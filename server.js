const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize SQLite Database
const db = new sqlite3.Database('./retail.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      vehicle_type TEXT,
      vehicle_number TEXT,
      last_service_date DATE,
      next_service_date DATE,
      credit_limit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Call Logs table
    db.run(`CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`);

    // Products table (Master Data - no quantity or purchase price here)
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sell_price REAL NOT NULL,
      vendor TEXT,
      rack_id TEXT,
      additional_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Inventory Transactions table (All stock movements)
    db.run(`CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost REAL,
      unit_price REAL,
      total_amount REAL,
      vendor TEXT,
      reference_no TEXT,
      notes TEXT,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      document_id TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // Documents table (File storage metadata)
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      document_type TEXT,
      related_entity_type TEXT,
      related_entity_id TEXT,
      uploaded_by TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    )`);

    // Services table (for periodic billing)
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      billing_cycle TEXT DEFAULT 'monthly',
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`);

    // Sales table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      total_amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'paid',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`);

    // Sale items table
    db.run(`CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // Recurring bills table
    db.run(`CREATE TABLE IF NOT EXISTS recurring_bills (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`);

    // Job Cards table
    db.run(`CREATE TABLE IF NOT EXISTS job_cards (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      vehicle_number TEXT NOT NULL,
      job_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'open',
      assignee TEXT,
      notes TEXT,
      labour_charge REAL DEFAULT 0,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      billed_at DATETIME,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`);

    // Job Card Tasks table (array of tasks from customer)
    db.run(`CREATE TABLE IF NOT EXISTS job_card_tasks (
      id TEXT PRIMARY KEY,
      job_card_id TEXT NOT NULL,
      task_description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_card_id) REFERENCES job_cards(id)
    )`);

    // Job Card Stock Items table (stocks installed in vehicle)
    db.run(`CREATE TABLE IF NOT EXISTS job_card_stock_items (
      id TEXT PRIMARY KEY,
      job_card_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
      } else {
        console.log('✅ All database tables created successfully');
        
        // Migration: Add labour_charge column to job_cards if it doesn't exist
        db.all(`PRAGMA table_info(job_cards)`, [], (err, columns) => {
          if (!err && columns) {
            const hasLabourCharge = columns.some(col => col.name === 'labour_charge');
            if (!hasLabourCharge) {
              db.run(`ALTER TABLE job_cards ADD COLUMN labour_charge REAL DEFAULT 0`, (err) => {
                if (err) {
                  console.error('Error adding labour_charge column:', err);
                } else {
                  console.log('✅ Added labour_charge column to job_cards');
                }
              });
            }
            
            const hasDiscount = columns.some(col => col.name === 'discount');
            if (!hasDiscount) {
              db.run(`ALTER TABLE job_cards ADD COLUMN discount REAL DEFAULT 0`, (err) => {
                if (err) {
                  console.error('Error adding discount column:', err);
                } else {
                  console.log('✅ Added discount column to job_cards');
                }
              });
            }
          }
        });
        
        // Create default admin user after tables are created
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO users (id, username, password, email, role) 
                VALUES (?, ?, ?, ?, ?)`, 
                [uuidv4(), 'admin', adminPassword, 'admin@retail.com', 'admin'],
                (err) => {
                  if (err) {
                    console.error('Error creating admin user:', err);
                  } else {
                    console.log('✅ Admin user created/verified');
                  }
                });
      
          // Add call_logs table if not exists
          db.run(`CREATE TABLE IF NOT EXISTS call_logs (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            note TEXT NOT NULL,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
          )`, (err) => {
            if (err) console.error('Error creating call_logs table:', err);
            else console.log('✅ call_logs table created/verified');
          });
      }
    });
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// ==================== CUSTOMER ROUTES ====================

app.get('/api/customers', authenticateToken, (req, res) => {
  const search = req.query.search || '';
  
  if (search) {
    // Search in name, phone, email, vehicle_type, vehicle_number
    const searchTerm = `%${search}%`;
    db.all(
      `SELECT * FROM customers 
       WHERE name LIKE ? 
       OR phone LIKE ? 
       OR email LIKE ? 
       OR vehicle_type LIKE ? 
       OR vehicle_number LIKE ? 
       ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  } else {
    db.all('SELECT * FROM customers ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  }
});

app.post('/api/customers', authenticateToken, (req, res) => {
  const { name, email, phone, address, credit_limit, vehicle_type, vehicle_number, last_service_date, next_service_date } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO customers (id, name, email, phone, address, credit_limit, vehicle_type, vehicle_number, last_service_date, next_service_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, phone, address, credit_limit || 0, vehicle_type, vehicle_number, last_service_date, next_service_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, message: 'Customer created successfully' });
    }
  );
});

app.put('/api/customers/:id', authenticateToken, (req, res) => {
  const { name, email, phone, address, credit_limit, vehicle_type, vehicle_number, last_service_date, next_service_date } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, credit_limit = ?, vehicle_type = ?, vehicle_number = ?, last_service_date = ?, next_service_date = ? WHERE id = ?',
    [name, email, phone, address, credit_limit, vehicle_type, vehicle_number, last_service_date, next_service_date, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Customer updated successfully' });
    }
  );
});

app.delete('/api/customers/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Customer deleted successfully' });
  });
});

// Call logs for a customer
app.get('/api/customers/:id/call-logs', authenticateToken, (req, res) => {
  const customerId = req.params.id;
  db.all('SELECT id, note, created_by, created_at FROM call_logs WHERE customer_id = ? ORDER BY created_at DESC', [customerId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/customers/:id/call-logs', authenticateToken, (req, res) => {
  const customerId = req.params.id;
  const { note } = req.body;
  if (!note || !note.trim()) return res.status(400).json({ error: 'Note is required' });
  const id = uuidv4();
  db.run('INSERT INTO call_logs (id, customer_id, note, created_by) VALUES (?, ?, ?, ?)', [id, customerId, note.trim(), req.user.username], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, message: 'Call note saved' });
  });
});

// Service history for a customer derived from job cards
app.get('/api/customers/:id/service-history', authenticateToken, (req, res) => {
  const customerId = req.params.id;

  db.all(`SELECT * FROM job_cards WHERE customer_id = ? ORDER BY created_at DESC LIMIT 200`, [customerId], (err, jobCards) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!jobCards || jobCards.length === 0) return res.json([]);

    // For each job card, get tasks and stock items
    const detailPromises = jobCards.map(jc => {
      return new Promise((resolve, reject) => {
        db.all('SELECT id, task_description, status, created_at FROM job_card_tasks WHERE job_card_id = ? ORDER BY created_at', [jc.id], (err, tasks) => {
          if (err) return reject(err);
          db.all(`SELECT jcs.id, jcs.product_id, jcs.quantity, jcs.unit_price, jcs.total_price, p.name as product_name
                  FROM job_card_stock_items jcs
                  LEFT JOIN products p ON jcs.product_id = p.id
                  WHERE jcs.job_card_id = ? ORDER BY jcs.created_at`, [jc.id], (err, stockItems) => {
            if (err) return reject(err);
            resolve({
              id: jc.id,
              job_number: jc.job_number,
              status: jc.status,
              assignee: jc.assignee,
              notes: jc.notes,
              labour_charge: jc.labour_charge,
              created_at: jc.created_at,
              closed_at: jc.closed_at,
              tasks: tasks || [],
              stock_items: stockItems || []
            });
          });
        });
      });
    });

    Promise.all(detailPromises)
      .then(results => res.json(results))
      .catch(err => res.status(500).json({ error: err.message }));
  });
});

// ==================== PRODUCT ROUTES ====================

// Get all products with calculated stock
app.get('/api/products', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      p.*,
      COALESCE(SUM(CASE WHEN it.transaction_type IN ('PURCHASE', 'ADJUSTMENT_IN') THEN it.quantity
                       WHEN it.transaction_type IN ('SALE', 'ADJUSTMENT_OUT') THEN -it.quantity
                       ELSE 0 END), 0) as quantity,
      COALESCE(
        SUM(CASE WHEN it.transaction_type = 'PURCHASE' THEN it.quantity * it.unit_cost ELSE 0 END) / 
        NULLIF(SUM(CASE WHEN it.transaction_type = 'PURCHASE' THEN it.quantity ELSE 0 END), 0),
        0
      ) as purchase_price
    FROM products p
    LEFT JOIN inventory_transactions it ON p.id = it.product_id
    GROUP BY p.id
    ORDER BY p.name
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single product with stock details
app.get('/api/products/:id', authenticateToken, (req, res) => {
  const productId = req.params.id;
  
  db.get(`
    SELECT 
      p.*,
      COALESCE(SUM(CASE WHEN it.transaction_type IN ('PURCHASE', 'ADJUSTMENT_IN') THEN it.quantity
                       WHEN it.transaction_type IN ('SALE', 'ADJUSTMENT_OUT') THEN -it.quantity
                       ELSE 0 END), 0) as quantity,
      COALESCE(
        SUM(CASE WHEN it.transaction_type = 'PURCHASE' THEN it.quantity * it.unit_cost ELSE 0 END) / 
        NULLIF(SUM(CASE WHEN it.transaction_type = 'PURCHASE' THEN it.quantity ELSE 0 END), 0),
        0
      ) as purchase_price
    FROM products p
    LEFT JOIN inventory_transactions it ON p.id = it.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `, [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { name, sell_price, vendor, rack_id, additional_info } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO products (id, name, sell_price, vendor, rack_id, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, sell_price, vendor || null, rack_id || null, additional_info || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, message: 'Product created successfully' });
    }
  );
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { name, sell_price, vendor, rack_id, additional_info } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE products SET name = ?, sell_price = ?, vendor = ?, rack_id = ?, additional_info = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, sell_price, vendor || null, rack_id || null, additional_info || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// ==================== INVENTORY TRANSACTION ROUTES ====================

// Get all transactions for a product
app.get('/api/inventory-transactions/product/:productId', authenticateToken, (req, res) => {
  db.all(`
    SELECT it.*, p.name as product_name, d.file_name as document_name
    FROM inventory_transactions it
    LEFT JOIN products p ON it.product_id = p.id
    LEFT JOIN documents d ON it.document_id = d.id
    WHERE it.product_id = ?
    ORDER BY it.transaction_date DESC
  `, [req.params.productId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all transactions (recent)
app.get('/api/inventory-transactions', authenticateToken, (req, res) => {
  const limit = req.query.limit || 100;
  db.all(`
    SELECT it.*, p.name as product_name, d.file_name as document_name
    FROM inventory_transactions it
    LEFT JOIN products p ON it.product_id = p.id
    LEFT JOIN documents d ON it.document_id = d.id
    ORDER BY it.transaction_date DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create inventory transaction (Purchase/Sale/Adjustment)
app.post('/api/inventory-transactions', authenticateToken, (req, res) => {
  const { product_id, transaction_type, quantity, unit_cost, unit_price, vendor, reference_no, notes, document_id } = req.body;
  const id = uuidv4();
  
  let total_amount = 0;
  if (transaction_type === 'PURCHASE' || transaction_type === 'ADJUSTMENT_IN') {
    total_amount = quantity * (unit_cost || 0);
  } else if (transaction_type === 'SALE' || transaction_type === 'ADJUSTMENT_OUT') {
    total_amount = quantity * (unit_price || 0);
  }

  db.run(
    `INSERT INTO inventory_transactions 
    (id, product_id, transaction_type, quantity, unit_cost, unit_price, total_amount, vendor, reference_no, notes, created_by, document_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, product_id, transaction_type, quantity, unit_cost, unit_price, total_amount, vendor, reference_no, notes, req.user.id, document_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, message: 'Transaction created successfully' });
    }
  );
});

// ==================== DOCUMENT MANAGEMENT ROUTES ====================

// Upload document
app.post('/api/documents/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { document_type, related_entity_type, related_entity_id, notes } = req.body;
  const id = uuidv4();

  db.run(
    `INSERT INTO documents 
    (id, file_name, file_path, file_size, mime_type, document_type, related_entity_type, related_entity_id, uploaded_by, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, 
      req.file.originalname, 
      req.file.path, 
      req.file.size, 
      req.file.mimetype,
      document_type || 'OTHER',
      related_entity_type,
      related_entity_id,
      req.user.id,
      notes
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id, 
        file_name: req.file.originalname,
        message: 'Document uploaded successfully' 
      });
    }
  );
});

// Get documents for an entity
app.get('/api/documents/:entityType/:entityId', authenticateToken, (req, res) => {
  const { entityType, entityId } = req.params;
  
  db.all(
    'SELECT * FROM documents WHERE related_entity_type = ? AND related_entity_id = ? ORDER BY upload_date DESC',
    [entityType, entityId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Delete document and file for a transaction
app.delete('/api/inventory-transactions/:transactionId/document', authenticateToken, (req, res) => {
  const { transactionId } = req.params;
  
  db.get('SELECT file_path FROM documents WHERE related_entity_id = ? AND related_entity_type = ?', 
    [transactionId, 'INVENTORY_TRANSACTION'], 
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete file from disk
      if (fs.existsSync(row.file_path)) {
        fs.unlinkSync(row.file_path);
      }

      // Delete record from database
      db.run('DELETE FROM documents WHERE related_entity_id = ? AND related_entity_type = ?',
        [transactionId, 'INVENTORY_TRANSACTION'],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Document deleted successfully' });
        }
      );
    }
  );
});

// Download document
app.get('/api/documents/download/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], (err, doc) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if file exists
    if (!fs.existsSync(doc.file_path)) {
      console.error('File not found:', doc.file_path);
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    res.download(doc.file_path, doc.file_name);
  });
});

// Delete document
app.delete('/api/documents/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM documents WHERE id = ?', [req.params.id], (err, doc) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from disk
    fs.unlink(doc.file_path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Delete from database
    db.run('DELETE FROM documents WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Document deleted successfully' });
    });
  });
});

// ==================== SERVICE ROUTES ====================

app.get('/api/services', authenticateToken, (req, res) => {
  db.all(`
    SELECT s.*, c.name as customer_name 
    FROM services s 
    LEFT JOIN customers c ON s.customer_id = c.id 
    ORDER BY s.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/services', authenticateToken, (req, res) => {
  const { customer_id, service_name, description, price, billing_cycle, start_date, end_date } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO services (id, customer_id, service_name, description, price, billing_cycle, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, customer_id, service_name, description, price, billing_cycle || 'monthly', start_date, end_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, message: 'Service created successfully' });
    }
  );
});

app.put('/api/services/:id', authenticateToken, (req, res) => {
  const { service_name, description, price, billing_cycle, status, end_date } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE services SET service_name = ?, description = ?, price = ?, billing_cycle = ?, status = ?, end_date = ? WHERE id = ?',
    [service_name, description, price, billing_cycle, status, end_date, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Service updated successfully' });
    }
  );
});

// ==================== SALES ROUTES ====================

app.get('/api/sales', authenticateToken, (req, res) => {
  db.all(`
    SELECT s.*, c.name as customer_name 
    FROM sales s 
    LEFT JOIN customers c ON s.customer_id = c.id 
    ORDER BY s.created_at DESC 
    LIMIT 100
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/sales/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM sales WHERE id = ?', [req.params.id], (err, sale) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    db.all('SELECT si.*, p.name as product_name FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?', 
      [req.params.id], (err, items) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ ...sale, items });
      });
  });
});

app.post('/api/sales', authenticateToken, (req, res) => {
  const { customer_id, items, discount, tax, payment_method } = req.body;
  const saleId = uuidv4();
  
  // Calculate total
  let total = 0;
  items.forEach(item => {
    total += item.quantity * item.unit_price;
  });
  
  const discountAmount = discount || 0;
  const taxAmount = tax || 0;
  const totalAmount = total - discountAmount + taxAmount;

  db.run(
    'INSERT INTO sales (id, customer_id, total_amount, discount, tax, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [saleId, customer_id, totalAmount, discountAmount, taxAmount, payment_method, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Insert sale items and create inventory transactions
      const saleItemStmt = db.prepare('INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
      const inventoryStmt = db.prepare('INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, unit_price, total_amount, reference_no, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

      items.forEach(item => {
        const itemId = uuidv4();
        const subtotal = item.quantity * item.unit_price;
        
        // Insert sale item
        saleItemStmt.run(itemId, saleId, item.product_id, item.quantity, item.unit_price, subtotal);
        
        // Create inventory transaction (SALE = stock decrease)
        const transId = uuidv4();
        inventoryStmt.run(transId, item.product_id, 'SALE', item.quantity, item.unit_price, subtotal, saleId, req.user.id);
      });

      saleItemStmt.finalize();
      inventoryStmt.finalize();

      res.json({ id: saleId, message: 'Sale created successfully', total: totalAmount });
    }
  );
});

// ==================== DASHBOARD/STATS ROUTES ====================

app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as count FROM customers', [], (err, result) => {
    stats.total_customers = result.count;

    db.get('SELECT COUNT(*) as count FROM products', [], (err, result) => {
      stats.total_products = result.count;

      db.get(`
        SELECT COUNT(*) as count FROM (
          SELECT p.id,
            COALESCE(SUM(CASE WHEN it.transaction_type IN ('PURCHASE', 'ADJUSTMENT_IN') THEN it.quantity
                             WHEN it.transaction_type IN ('SALE', 'ADJUSTMENT_OUT') THEN -it.quantity
                             ELSE 0 END), 0) as quantity
          FROM products p
          LEFT JOIN inventory_transactions it ON p.id = it.product_id
          GROUP BY p.id
          HAVING quantity <= 10
        )
      `, [], (err, result) => {
        stats.low_stock_items = result.count;

        db.get('SELECT SUM(total_amount) as total FROM sales WHERE date(created_at) = date("now")', [], (err, result) => {
          stats.today_sales = result.total || 0;

          db.get('SELECT COUNT(*) as count FROM sales WHERE date(created_at) = date("now")', [], (err, result) => {
            stats.today_transactions = result.count;

            db.get('SELECT SUM(total_amount) as total FROM sales WHERE date(created_at) >= date("now", "-30 days")', [], (err, result) => {
              stats.monthly_sales = result.total || 0;

              db.get('SELECT COUNT(*) as count FROM services WHERE status = "active"', [], (err, result) => {
                stats.active_services = result.count;

                            // Upcoming services (next 7 days)
                            db.all(`SELECT id, name, phone, next_service_date FROM customers WHERE next_service_date BETWEEN date('now') AND date('now', '+7 days') ORDER BY next_service_date`, [], (err, upcomingRows) => {
                              if (err) {
                                stats.upcoming_services = [];
                                stats.upcoming_count = 0;
                              } else {
                                stats.upcoming_services = upcomingRows;
                                stats.upcoming_count = upcomingRows.length;
                              }

                              // Overdue services (past 7 days)
                              db.all(`SELECT id, name, phone, next_service_date FROM customers WHERE next_service_date BETWEEN date('now', '-7 days') AND date('now', '-1 day') ORDER BY next_service_date`, [], (err, overdueRows) => {
                                if (err) {
                                  stats.overdue_services = [];
                                  stats.overdue_count = 0;
                                } else {
                                  stats.overdue_services = overdueRows;
                                  stats.overdue_count = overdueRows.length;
                                }

                                res.json(stats);
                              });
                            });
              });
            });
          });
        });
      });
    });
  });
});

app.get('/api/dashboard/low-stock', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      p.*,
      COALESCE(SUM(CASE WHEN it.transaction_type IN ('PURCHASE', 'ADJUSTMENT_IN') THEN it.quantity
                       WHEN it.transaction_type IN ('SALE', 'ADJUSTMENT_OUT') THEN -it.quantity
                       ELSE 0 END), 0) as quantity
    FROM products p
    LEFT JOIN inventory_transactions it ON p.id = it.product_id
    GROUP BY p.id
    HAVING quantity <= 10
    ORDER BY quantity
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/dashboard/recent-sales', authenticateToken, (req, res) => {
  db.all(`
    SELECT s.*, c.name as customer_name 
    FROM sales s 
    LEFT JOIN customers c ON s.customer_id = c.id 
    ORDER BY s.created_at DESC 
    LIMIT 10
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ==================== JOB CARDS MANAGEMENT ====================

// Search customers for job card (by name, phone, email, vehicle_number)
app.get('/api/job-cards/search-customer', authenticateToken, (req, res) => {
  const { search } = req.query;
  
  if (!search) {
    return res.status(400).json({ error: 'Search term required' });
  }

  const searchTerm = `%${search}%`;
  db.all(`
    SELECT * FROM customers 
    WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR vehicle_number LIKE ?
    ORDER BY name
    LIMIT 20
  `, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create new job card
app.post('/api/job-cards', authenticateToken, (req, res) => {
  const { customer_id, vehicle_number, tasks, assignee, notes } = req.body;
  
  if (!customer_id || !vehicle_number || !tasks || tasks.length === 0) {
    return res.status(400).json({ error: 'Customer, vehicle number, and at least one task required' });
  }

  const jobCardId = uuidv4();
  const jobNumber = 'JC-' + Date.now();
  const createdBy = req.user.username;

  db.serialize(() => {
    // Insert job card
    db.run(`
      INSERT INTO job_cards (id, customer_id, vehicle_number, job_number, assignee, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [jobCardId, customer_id, vehicle_number, jobNumber, assignee || null, notes || null, createdBy], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Insert tasks
      const taskStmt = db.prepare(`
        INSERT INTO job_card_tasks (id, job_card_id, task_description)
        VALUES (?, ?, ?)
      `);

      tasks.forEach(task => {
        taskStmt.run(uuidv4(), jobCardId, task);
      });

      taskStmt.finalize((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ 
          id: jobCardId, 
          job_number: jobNumber,
          message: 'Job card created successfully' 
        });
      });
    });
  });
});

// Get all job cards with filters
app.get('/api/job-cards', authenticateToken, (req, res) => {
  const { status, search } = req.query;
  
  let query = `
    SELECT jc.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM job_cards jc
    LEFT JOIN customers c ON jc.customer_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ` AND jc.status = ?`;
    params.push(status);
  }
  
  if (search) {
    query += ` AND (jc.job_number LIKE ? OR jc.vehicle_number LIKE ? OR c.name LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ` ORDER BY jc.created_at DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single job card with details
app.get('/api/job-cards/:id', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  
  db.get(`
    SELECT jc.*, c.name as customer_name, c.phone as customer_phone, 
           c.email as customer_email, c.address as customer_address
    FROM job_cards jc
    LEFT JOIN customers c ON jc.customer_id = c.id
    WHERE jc.id = ?
  `, [jobCardId], (err, jobCard) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!jobCard) {
      return res.status(404).json({ error: 'Job card not found' });
    }

    // Get tasks
    db.all(`
      SELECT * FROM job_card_tasks WHERE job_card_id = ? ORDER BY created_at
    `, [jobCardId], (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get stock items
      db.all(`
        SELECT jcs.*, p.name as product_name, p.rack_id
        FROM job_card_stock_items jcs
        LEFT JOIN products p ON jcs.product_id = p.id
        WHERE jcs.job_card_id = ?
        ORDER BY jcs.created_at
      `, [jobCardId], (err, stockItems) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          ...jobCard,
          tasks,
          stock_items: stockItems
        });
      });
    });
  });
});

// Update job card (assignee, notes, status)
app.put('/api/job-cards/:id', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  const { assignee, notes, status } = req.body;
  
  let query = 'UPDATE job_cards SET ';
  const params = [];
  const updates = [];
  
  if (assignee !== undefined) {
    updates.push('assignee = ?');
    params.push(assignee);
  }
  
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }
  
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
    
    if (status === 'closed') {
      updates.push('closed_at = CURRENT_TIMESTAMP');
    }
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  query += updates.join(', ') + ' WHERE id = ?';
  params.push(jobCardId);
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job card not found' });
    }
    res.json({ message: 'Job card updated successfully' });
  });
});

// Add stock item to job card
app.post('/api/job-cards/:id/stock-items', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  const { product_id, quantity, unit_price, notes } = req.body;
  
  if (!product_id || !quantity || !unit_price) {
    return res.status(400).json({ error: 'Product, quantity, and unit price required' });
  }

  const stockItemId = uuidv4();
  const totalPrice = quantity * unit_price;

  db.run(`
    INSERT INTO job_card_stock_items (id, job_card_id, product_id, quantity, unit_price, total_price, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [stockItemId, jobCardId, product_id, quantity, unit_price, totalPrice, notes || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Create inventory transaction for stock usage
    const transactionId = uuidv4();
    db.run(`
      INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, unit_price, total_amount, notes, reference_no, created_by)
      VALUES (?, ?, 'SALE', ?, ?, ?, ?, ?, ?)
    `, [transactionId, product_id, quantity, unit_price, totalPrice, 
        `Used in Job Card ${jobCardId}`, jobCardId, req.user.username], (err) => {
      if (err) {
        console.error('Error creating inventory transaction:', err);
      }
    });

    res.json({ id: stockItemId, message: 'Stock item added successfully' });
  });
});

// Remove stock item from job card
app.delete('/api/job-cards/:jobCardId/stock-items/:stockItemId', authenticateToken, (req, res) => {
  const { jobCardId, stockItemId } = req.params;
  
  db.run(`
    DELETE FROM job_card_stock_items WHERE id = ? AND job_card_id = ?
  `, [stockItemId, jobCardId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }
    res.json({ message: 'Stock item removed successfully' });
  });
});

// Update task status
app.put('/api/job-cards/:jobCardId/tasks/:taskId', authenticateToken, (req, res) => {
  const { jobCardId, taskId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }
  
  db.run(`
    UPDATE job_card_tasks SET status = ? WHERE id = ? AND job_card_id = ?
  `, [status, taskId, jobCardId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task status updated successfully' });
  });
});

// Get bill details for job card
app.get('/api/job-cards/:id/bill', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  
  db.get(`
    SELECT 
      jc.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      c.address as customer_address
    FROM job_cards jc
    LEFT JOIN customers c ON jc.customer_id = c.id
    WHERE jc.id = ?
  `, [jobCardId], (err, jobCard) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!jobCard) {
      return res.status(404).json({ error: 'Job card not found' });
    }

    // Get tasks
    db.all('SELECT * FROM job_card_tasks WHERE job_card_id = ?', [jobCardId], (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get stock items
      db.all(`
        SELECT 
          jcs.*,
          p.name as product_name,
          p.rack_id
        FROM job_card_stock_items jcs
        LEFT JOIN products p ON jcs.product_id = p.id
        WHERE jcs.job_card_id = ?
      `, [jobCardId], (err, stockItems) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const stockTotal = stockItems.reduce((sum, item) => sum + item.total_price, 0);
        const labourCharge = jobCard.labour_charge || 0;
        const discount = jobCard.discount || 0;
        const subtotal = stockTotal + labourCharge;
        const grandTotal = subtotal - discount;

        res.json({
          ...jobCard,
          tasks,
          stock_items: stockItems,
          stock_total: stockTotal,
          subtotal: subtotal,
          grand_total: grandTotal
        });
      });
    });
  });
});

// Complete and bill job card
app.post('/api/job-cards/:id/complete', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  const { labour_charge, discount, last_service_date, next_service_date } = req.body;
  
  db.serialize(() => {
    // Get customer_id first
    db.get('SELECT customer_id FROM job_cards WHERE id = ?', [jobCardId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Job card not found' });
      }

      // Update job card status, labour charge, and discount (NO billed_at)
      db.run(`
        UPDATE job_cards 
        SET status = 'closed', 
            closed_at = CURRENT_TIMESTAMP, 
            labour_charge = ?,
            discount = ?
        WHERE id = ?
      `, [labour_charge || 0, discount || 0, jobCardId], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Auto-delete call logs for this customer when job card is completed
        db.run(`DELETE FROM call_logs WHERE customer_id = ?`, [row.customer_id], (err) => {
          if (err) {
            console.error('Error deleting call logs:', err);
          }
        });

        // Auto-populate service dates if not provided
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];
        let finalLastService = last_service_date || formatDate(today);
        
        // Default next service = today + 3 months
        const addMonths = (date, months) => {
          const d = new Date(date);
          const nm = new Date(d.setMonth(d.getMonth() + months));
          return nm;
        };
        let finalNextService = next_service_date || formatDate(addMonths(today, 3));

        // If next service falls on Saturday (6), add one day
        try {
          const nsDate = new Date(finalNextService);
          if (nsDate.getDay() === 6) {
            nsDate.setDate(nsDate.getDate() + 1);
            finalNextService = formatDate(nsDate);
          }
        } catch (e) { /* ignore parse errors */ }

        // Always update customer with final service dates
        db.run(`
          UPDATE customers SET last_service_date = ?, next_service_date = ? WHERE id = ?
        `, [finalLastService, finalNextService, row.customer_id], (err) => {
          if (err) {
            console.error('Error updating service dates:', err);
          }
        });

        res.json({ 
          message: 'Job card completed successfully', 
          last_service_date: finalLastService,
          next_service_date: finalNextService
        });
      });
    });
  });
});

// Reject/Cancel job card
app.post('/api/job-cards/:id/reject', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  const { reason } = req.body;
  
  db.run(`
    UPDATE job_cards 
    SET status = 'rejected', closed_at = CURRENT_TIMESTAMP, notes = COALESCE(notes || '\n', '') || 'Rejection Reason: ' || ?
    WHERE id = ?
  `, [reason || 'No reason provided', jobCardId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job card not found' });
    }
    res.json({ message: 'Job card rejected successfully' });
  });
});

// Update Job Card (PUT)
app.put('/api/job-cards/:id', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;
  const { status, assignee, labour_charge, discount, notes, last_service_date, next_service_date, tasks } = req.body;
  
  if (!tasks || tasks.length === 0) {
    return res.status(400).json({ error: 'At least one task is required' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Update job card main details
    const updateFields = [];
    const updateValues = [];
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
      
      // Set closed_at if status is being changed to closed
      if (status === 'closed') {
        updateFields.push('closed_at = CURRENT_TIMESTAMP');
      }
    }
    if (assignee !== undefined) {
      updateFields.push('assignee = ?');
      updateValues.push(assignee || null);
    }
    if (labour_charge !== undefined) {
      updateFields.push('labour_charge = ?');
      updateValues.push(labour_charge);
    }
    if (discount !== undefined) {
      updateFields.push('discount = ?');
      updateValues.push(discount);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes || null);
    }
    if (last_service_date !== undefined) {
      updateFields.push('last_service_date = ?');
      updateValues.push(last_service_date || null);
    }
    if (next_service_date !== undefined) {
      updateFields.push('next_service_date = ?');
      updateValues.push(next_service_date || null);
    }
    
    updateValues.push(jobCardId);
    
    db.run(`
      UPDATE job_cards 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues, function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Job card not found' });
      }
      
      // Delete existing tasks
      db.run('DELETE FROM job_card_tasks WHERE job_card_id = ?', [jobCardId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        // Insert new tasks
        const taskStmt = db.prepare('INSERT INTO job_card_tasks (job_card_id, task_description) VALUES (?, ?)');
        let taskErrors = false;
        
        tasks.forEach(task => {
          taskStmt.run([jobCardId, task], function(err) {
            if (err) {
              taskErrors = true;
            }
          });
        });
        
        taskStmt.finalize(function(err) {
          if (err || taskErrors) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to update tasks' });
          }
          
          db.run('COMMIT');
          res.json({ message: 'Job card updated successfully' });
        });
      });
    });
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Default login: username=admin, password=admin123`);
});