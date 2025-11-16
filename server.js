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

// Persistent storage paths for Railway deployment
// Use /data for Railway volume mount, fallback to local for development
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'retail.db');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads');

// Create necessary directories if they don't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('Created data directory:', DATA_DIR);
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('Created uploads directory:', UPLOADS_DIR);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
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
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
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
    )`);

    // Bills table (Immutable bill snapshots)
    db.run(`CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      bill_number TEXT UNIQUE NOT NULL,
      job_card_id TEXT,
      sale_id TEXT,
      bill_date TEXT NOT NULL,
      customer_data TEXT NOT NULL,
      bill_items TEXT NOT NULL,
      labour_charge REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'finalized',
      payment_status TEXT DEFAULT 'unpaid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_card_id) REFERENCES job_cards(id),
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
      } else {
        console.log('✅ All database tables created successfully');

        // Migration: Add sale_id column to bills if it doesn't exist
        db.all(`PRAGMA table_info(bills)`, [], (err, columns) => {
          if (!err && columns) {
            const hasSaleId = columns.some(col => col.name === 'sale_id');
            if (!hasSaleId) {
              db.run(`ALTER TABLE bills ADD COLUMN sale_id TEXT`, (err) => {
                if (err) {
                  console.error('Error adding sale_id column to bills:', err);
                } else {
                  console.log('✅ Added sale_id column to bills table');
                }
              });
            }
          }
        });

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

// Authentication middleware that also accepts token via query parameter (for viewing bills in browser)
function authenticateTokenFlexible(req, res, next) {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const queryToken = req.query.token;

  const token = headerToken || queryToken;

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

// ==================== BILL HELPER FUNCTIONS ====================

// Generate next bill number (Format: BIL-YYYY-NNNN)
function getNextBillNumber(callback) {
  const year = new Date().getFullYear();
  const prefix = `BIL-${year}-`;

  db.get(
    `SELECT bill_number FROM bills WHERE bill_number LIKE ? ORDER BY bill_number DESC LIMIT 1`,
    [`${prefix}%`],
    (err, row) => {
      if (err) {
        return callback(err);
      }

      let nextNumber = 1;
      if (row && row.bill_number) {
        const lastNumber = parseInt(row.bill_number.split('-')[2]);
        nextNumber = lastNumber + 1;
      }

      const billNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;
      callback(null, billNumber);
    }
  );
}

// Generate bill snapshot from job card
function generateBillSnapshot(jobCardId, labourChargeParam, discountParam, callback) {
  // Get job card details
  db.get(
    `SELECT jc.*, c.name as customer_name, c.phone, c.email, c.vehicle_number, c.vehicle_type
     FROM job_cards jc
     JOIN customers c ON jc.customer_id = c.id
     WHERE jc.id = ?`,
    [jobCardId],
    (err, jobCard) => {
      if (err) return callback(err);
      if (!jobCard) return callback(new Error('Job card not found'));

      // Get tasks
      db.all(
        'SELECT task_description FROM job_card_tasks WHERE job_card_id = ?',
        [jobCardId],
        (err, tasks) => {
          if (err) return callback(err);

          // Get stock items
          db.all(
            `SELECT jsi.*, p.name as product_name
             FROM job_card_stock_items jsi
             JOIN products p ON jsi.product_id = p.id
             WHERE jsi.job_card_id = ?`,
            [jobCardId],
            (err, stockItems) => {
              if (err) return callback(err);

              // Build customer data
              const customerData = {
                name: jobCard.customer_name,
                phone: jobCard.phone,
                email: jobCard.email,
                vehicle_number: jobCard.vehicle_number,
                vehicle_type: jobCard.vehicle_type
              };

              // Build bill items (services + parts)
              const billItems = [];

              // Add services as line items
              tasks.forEach(task => {
                billItems.push({
                  type: 'service',
                  description: task.task_description,
                  quantity: 1,
                  rate: 0,
                  amount: 0
                });
              });

              // Add parts
              let partsTotal = 0;
              stockItems.forEach(item => {
                billItems.push({
                  type: 'part',
                  description: item.product_name,
                  quantity: item.quantity,
                  rate: item.unit_price,
                  amount: item.total_price
                });
                partsTotal += item.total_price;
              });

              // Calculate totals - use parameters passed from the completion endpoint
              const labourCharge = labourChargeParam !== undefined ? labourChargeParam : (jobCard.labour_charge || 0);
              const discount = discountParam !== undefined ? discountParam : (jobCard.discount || 0);
              const subtotal = partsTotal + labourCharge;
              const total = subtotal - discount;

              callback(null, {
                customer: customerData,
                items: billItems,
                labour_charge: labourCharge,
                discount: discount,
                subtotal: subtotal,
                total: total,
                parts_total: partsTotal
              });
            }
          );
        }
      );
    }
  );
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

  // Check if vehicle number already exists (if provided)
  if (vehicle_number && vehicle_number.trim()) {
    db.get(
      'SELECT id, name, phone FROM customers WHERE vehicle_number = ?',
      [vehicle_number.trim()],
      (err, existingCustomer) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (existingCustomer) {
          return res.status(400).json({
            error: 'Vehicle number already exists',
            message: `This vehicle number is already registered to ${existingCustomer.name} (${existingCustomer.phone}). Please search with vehicle number to find the existing customer.`,
            existing_customer: existingCustomer
          });
        }

        // No duplicate found, proceed with creation
        createCustomer();
      }
    );
  } else {
    // No vehicle number provided, create directly
    createCustomer();
  }

  function createCustomer() {
    const id = uuidv4();

    db.run(
      'INSERT INTO customers (id, name, email, phone, address, credit_limit, vehicle_type, vehicle_number, last_service_date, next_service_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, address, credit_limit || 0, vehicle_type, vehicle_number, last_service_date, next_service_date],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        // Return the full customer object
        res.json({
          id,
          name,
          email,
          phone,
          address,
          credit_limit: credit_limit || 0,
          vehicle_type,
          vehicle_number,
          last_service_date,
          next_service_date,
          message: 'Customer created successfully'
        });
      }
    );
  }
});

app.put('/api/customers/:id', authenticateToken, (req, res) => {
  const { name, email, phone, address, credit_limit, vehicle_type, vehicle_number, last_service_date, next_service_date } = req.body;
  const { id } = req.params;

  // Check if vehicle number already exists (excluding current customer)
  if (vehicle_number && vehicle_number.trim()) {
    db.get(
      'SELECT id, name, phone FROM customers WHERE vehicle_number = ? AND id != ?',
      [vehicle_number.trim(), id],
      (err, existingCustomer) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (existingCustomer) {
          return res.status(400).json({
            error: 'Vehicle number already exists',
            message: `This vehicle number is already registered to ${existingCustomer.name} (${existingCustomer.phone}). Please search with vehicle number to find the existing customer.`,
            existing_customer: existingCustomer
          });
        }

        // No duplicate found, proceed with update
        updateCustomer();
      }
    );
  } else {
    // No vehicle number provided, update directly
    updateCustomer();
  }

  function updateCustomer() {
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
  }
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

    // For each job card, get tasks, stock items, and bill info
    const detailPromises = jobCards.map(jc => {
      return new Promise((resolve, reject) => {
        db.all('SELECT id, task_description, status, created_at FROM job_card_tasks WHERE job_card_id = ? ORDER BY created_at', [jc.id], (err, tasks) => {
          if (err) return reject(err);
          db.all(`SELECT jcs.id, jcs.product_id, jcs.quantity, jcs.unit_price, jcs.total_price, p.name as product_name
                  FROM job_card_stock_items jcs
                  LEFT JOIN products p ON jcs.product_id = p.id
                  WHERE jcs.job_card_id = ? ORDER BY jcs.created_at`, [jc.id], (err, stockItems) => {
            if (err) return reject(err);

            // Get bill info for this job card
            db.all('SELECT id, bill_number, bill_date, total, payment_status FROM bills WHERE job_card_id = ? ORDER BY bill_date DESC', [jc.id], (err, bills) => {
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
                stock_items: stockItems || [],
                bills: bills || []
              });
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

      // Create a bill for this direct sale
      db.get('SELECT * FROM customers WHERE id = ?', [customer_id], (err, customer) => {
        if (err || !customer) {
          console.error('Error fetching customer for bill:', err);
          return res.json({ id: saleId, message: 'Sale created successfully', total: totalAmount });
        }

        // Generate bill number
        const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const billId = uuidv4();
        const billDate = new Date().toISOString().split('T')[0];

        // Prepare customer data
        const customerData = {
          id: customer.id,
          name: customer.name,
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || ''
        };

        // Prepare bill items in the same format as job card bills
        const billItems = items.map(item => ({
          type: 'part',
          description: item.product_name,
          quantity: item.quantity,
          rate: item.unit_price,
          amount: item.quantity * item.unit_price
        }));

        db.run(
          `INSERT INTO bills (
            id, bill_number, sale_id, bill_date, customer_data, bill_items,
            labour_charge, discount, subtotal, total, status, payment_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            billId,
            billNumber,
            saleId,
            billDate,
            JSON.stringify(customerData),
            JSON.stringify(billItems),
            0, // labour_charge
            discountAmount,
            total,
            totalAmount,
            'finalized',
            payment_method === 'cash' ? 'paid' : 'unpaid'
          ],
          function(err) {
            if (err) {
              console.error('Error creating bill for sale:', err);
            } else {
              console.log('✅ Bill created for direct sale:', billNumber);
            }
            res.json({
              id: saleId,
              bill_id: billId,
              bill_number: billNumber,
              message: 'Sale and bill created successfully',
              total: totalAmount
            });
          }
        );
      });
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

  // Check if there's already an open job card for this vehicle
  db.get(`
    SELECT job_number, status
    FROM job_cards
    WHERE vehicle_number = ? AND status NOT IN ('completed', 'rejected')
    ORDER BY created_at DESC
    LIMIT 1
  `, [vehicle_number], (err, existingJobCard) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (existingJobCard) {
      return res.status(400).json({
        error: `An open job card (${existingJobCard.job_number}) already exists for this vehicle. Please complete or reject the existing job card before creating a new one.`,
        existing_job_number: existingJobCard.job_number
      });
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
});

// Get all job cards with filters
app.get('/api/job-cards', authenticateToken, (req, res) => {
  const { status, search, from_date, to_date } = req.query;

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

  if (from_date) {
    query += ` AND DATE(jc.created_at) >= DATE(?)`;
    params.push(from_date);
  }

  if (to_date) {
    query += ` AND DATE(jc.created_at) <= DATE(?)`;
    params.push(to_date);
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
  const { status, task_description } = req.body;

  // Build update query dynamically based on what's provided
  const updates = [];
  const values = [];

  if (status) {
    updates.push('status = ?');
    values.push(status);
  }

  if (task_description) {
    updates.push('task_description = ?');
    values.push(task_description);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(taskId, jobCardId);

  db.run(`
    UPDATE job_card_tasks SET ${updates.join(', ')} WHERE id = ? AND job_card_id = ?
  `, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// Add a new task to a job card
app.post('/api/job-cards/:jobCardId/tasks', authenticateToken, (req, res) => {
  const { jobCardId } = req.params;
  const { task_description } = req.body;

  if (!task_description || !task_description.trim()) {
    return res.status(400).json({ error: 'Task description is required' });
  }

  // Check if job card exists and is not completed/rejected
  db.get('SELECT status FROM job_cards WHERE id = ?', [jobCardId], (err, jobCard) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!jobCard) {
      return res.status(404).json({ error: 'Job card not found' });
    }
    if (jobCard.status === 'completed' || jobCard.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot add tasks to a completed or rejected job card' });
    }

    const taskId = uuidv4();
    db.run(
      'INSERT INTO job_card_tasks (id, job_card_id, task_description, status) VALUES (?, ?, ?, ?)',
      [taskId, jobCardId, task_description.trim(), 'pending'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: taskId, message: 'Task added successfully' });
      }
    );
  });
});

// Delete a task from a job card
app.delete('/api/job-cards/:jobCardId/tasks/:taskId', authenticateToken, (req, res) => {
  const { jobCardId, taskId } = req.params;

  db.run(
    'DELETE FROM job_card_tasks WHERE id = ? AND job_card_id = ?',
    [taskId, jobCardId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    }
  );
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

        // Auto-create bill when job card is completed
        getNextBillNumber((err, billNumber) => {
          if (err) {
            console.error('Error generating bill number:', err);
            return res.status(500).json({ error: 'Failed to generate bill number' });
          }

          generateBillSnapshot(jobCardId, labour_charge || 0, discount || 0, (err, billData) => {
            if (err) {
              console.error('Error generating bill snapshot:', err);
              return res.status(500).json({ error: 'Failed to generate bill' });
            }

            const billId = uuidv4();
            const billDate = formatDate(today);

            db.run(`
              INSERT INTO bills (
                id, bill_number, job_card_id, bill_date,
                customer_data, bill_items,
                labour_charge, discount, subtotal, total,
                status, payment_status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              billId,
              billNumber,
              jobCardId,
              billDate,
              JSON.stringify(billData.customer),
              JSON.stringify(billData.items),
              billData.labour_charge,
              billData.discount,
              billData.subtotal,
              billData.total,
              'finalized',
              'unpaid'
            ], function(err) {
              if (err) {
                console.error('Error creating bill:', err);
                return res.status(500).json({ error: 'Failed to create bill' });
              }

              res.json({
                message: 'Job card completed and bill generated successfully',
                last_service_date: finalLastService,
                next_service_date: finalNextService,
                bill: {
                  id: billId,
                  bill_number: billNumber,
                  bill_date: billDate,
                  total: billData.total
                }
              });
            });
          });
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

// ==================== BILL ROUTES ====================

// Get all bills for a specific job card
app.get('/api/job-cards/:id/bills', authenticateToken, (req, res) => {
  const jobCardId = req.params.id;

  db.all(
    `SELECT id, bill_number, bill_date, total, status, payment_status, created_at
     FROM bills
     WHERE job_card_id = ?
     ORDER BY bill_date DESC`,
    [jobCardId],
    (err, bills) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(bills);
    }
  );
});

// Get bill details by ID
app.get('/api/bills/:id', authenticateToken, (req, res) => {
  const billId = req.params.id;

  db.get(
    'SELECT * FROM bills WHERE id = ?',
    [billId],
    (err, bill) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      // Parse JSON fields
      bill.customer_data = JSON.parse(bill.customer_data);
      bill.bill_items = JSON.parse(bill.bill_items);

      res.json(bill);
    }
  );
});

// List all bills with optional filters
app.get('/api/bills', authenticateToken, (req, res) => {
  const { from, to, status, payment_status, search } = req.query;

  let query = `
    SELECT b.*, jc.job_number
    FROM bills b
    LEFT JOIN job_cards jc ON b.job_card_id = jc.id
    WHERE 1=1
  `;
  const params = [];

  if (from) {
    query += ' AND b.bill_date >= ?';
    params.push(from);
  }

  if (to) {
    query += ' AND b.bill_date <= ?';
    params.push(to);
  }

  if (status) {
    query += ' AND b.status = ?';
    params.push(status);
  }

  if (payment_status) {
    query += ' AND b.payment_status = ?';
    params.push(payment_status);
  }

  if (search) {
    query += ' AND (b.bill_number LIKE ? OR jc.job_number LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY b.bill_date DESC, b.created_at DESC';

  db.all(query, params, (err, bills) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Parse JSON fields for each bill
    bills.forEach(bill => {
      bill.customer_data = JSON.parse(bill.customer_data);
      bill.bill_items = JSON.parse(bill.bill_items);
      // Set job_number to empty string if null (for direct sales)
      if (!bill.job_number) {
        bill.job_number = 'DIRECT SALE';
      }
    });

    res.json(bills);
  });
});

// View bill as HTML (for browser display)
app.get('/api/bills/:id/view', authenticateTokenFlexible, (req, res) => {
  const billId = req.params.id;

  db.get('SELECT * FROM bills WHERE id = ?', [billId], (err, bill) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const customer = JSON.parse(bill.customer_data);
    const items = JSON.parse(bill.bill_items);

    // Generate HTML invoice
    const html = generateBillHTML(bill, customer, items);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
});

// Download bill as PDF (to be implemented with PDF library)
app.get('/api/bills/:id/download', authenticateToken, (req, res) => {
  const billId = req.params.id;

  db.get('SELECT * FROM bills WHERE id = ?', [billId], (err, bill) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const customer = JSON.parse(bill.customer_data);
    const items = JSON.parse(bill.bill_items);

    // Generate HTML first (will convert to PDF later)
    const html = generateBillHTML(bill, customer, items);

    // For now, return HTML - will be replaced with PDF generation
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${bill.bill_number}.html"`);
    res.send(html);
  });
});

// Mark bill as paid
app.post('/api/bills/:id/mark-paid', authenticateToken, (req, res) => {
  const billId = req.params.id;

  db.run(
    'UPDATE bills SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['paid', billId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }
      res.json({ message: 'Bill marked as paid successfully' });
    }
  );
});

// Cancel a bill
app.post('/api/bills/:id/cancel', authenticateToken, (req, res) => {
  const billId = req.params.id;
  const { reason } = req.body;

  db.run(
    `UPDATE bills
     SET status = 'cancelled',
         notes = COALESCE(notes || '\n', '') || ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [`Cancellation reason: ${reason || 'No reason provided'}`, billId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }
      res.json({ message: 'Bill cancelled successfully' });
    }
  );
});

// Helper function to generate bill HTML
function generateBillHTML(bill, customer, items) {
  // Show all services performed (tasks)
  const serviceItems = items.filter(item => item.type === 'service');
  // Show all parts used
  const partItems = items.filter(item => item.type === 'part');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${bill.bill_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    .invoice-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .invoice-header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #333;
    }
    .invoice-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      margin-bottom: 10px;
      color: #555;
      font-size: 14px;
      text-transform: uppercase;
    }
    .info-section p {
      margin: 5px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f4f4f4;
      font-weight: bold;
      color: #333;
    }
    .text-right { text-align: right; }
    .summary {
      margin-left: auto;
      width: 300px;
      margin-top: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid #333;
      border-bottom: 3px double #333;
      margin-top: 10px;
      padding-top: 10px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <h1>INVOICE</h1>
    <p style="font-size: 14px; color: #666;">Invoice #${bill.bill_number}</p>
  </div>

  <div class="invoice-info">
    <div class="info-section">
      <h3>Bill To:</h3>
      <p><strong>${customer.name}</strong></p>
      ${customer.phone ? `<p>Phone: ${customer.phone}</p>` : ''}
      ${customer.email ? `<p>Email: ${customer.email}</p>` : ''}
      ${customer.vehicle_number ? `<p>Vehicle: ${customer.vehicle_number}</p>` : ''}
      ${customer.vehicle_type ? `<p>Model: ${customer.vehicle_type}</p>` : ''}
    </div>
    <div class="info-section" style="text-align: right;">
      <h3>Invoice Details:</h3>
      <p><strong>Date:</strong> ${new Date(bill.bill_date).toLocaleDateString('en-IN')}</p>
      <p><strong>Invoice #:</strong> ${bill.bill_number}</p>
      <p><strong>Status:</strong> ${bill.payment_status.toUpperCase()}</p>
    </div>
  </div>

  ${serviceItems.length > 0 ? `
  <h3 style="margin: 20px 0 10px 0; color: #333;">Services Performed</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">S.No</th>
        <th>Service Description</th>
      </tr>
    </thead>
    <tbody>
      ${serviceItems.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.description}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <p style="font-size: 12px; color: #666; margin-bottom: 20px;"><em>Note: Service charges are included in the Labour Charge below.</em></p>
  ` : ''}

  ${partItems.length > 0 ? `
  <h3 style="margin: 20px 0 10px 0; color: #333;">Parts & Materials</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 60%;">Item Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${partItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">₹${item.rate.toFixed(2)}</td>
          <td class="text-right">₹${item.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="summary">
    ${bill.labour_charge > 0 ? `
      <div class="summary-row">
        <span>Labour Charge:</span>
        <span>₹${bill.labour_charge.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>₹${bill.subtotal.toFixed(2)}</span>
    </div>
    ${bill.discount > 0 ? `
      <div class="summary-row" style="color: #d9534f;">
        <span>Discount:</span>
        <span>- ₹${bill.discount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="summary-row total">
      <span>TOTAL:</span>
      <span>₹${bill.total.toFixed(2)}</span>
    </div>
  </div>

  ${bill.notes ? `
  <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 3px solid #333;">
    <strong>Notes:</strong><br/>
    ${bill.notes}
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 10px;">This is a computer-generated invoice.</p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 30px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
      Print Invoice
    </button>
  </div>
</body>
</html>
  `;
}

// ==================== PROFIT & LOSS ROUTES ====================

// Get profit and loss report with date filtering
app.get('/api/reports/profit-loss', authenticateToken, (req, res) => {
  const { from, to } = req.query;
  const fromDate = from || '1900-01-01';
  const toDate = to || '2099-12-31';

  // Get total revenue from bills
  db.get(
    `SELECT
      COALESCE(SUM(total), 0) as total_revenue,
      COUNT(*) as bill_count
     FROM bills
     WHERE bill_date >= ? AND bill_date <= ? AND status = 'finalized'`,
    [fromDate, toDate],
    (err, revenueData) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get total costs from inventory purchases
      db.get(
        `SELECT
          COALESCE(SUM(total_amount), 0) as total_costs
         FROM inventory_transactions
         WHERE transaction_type = 'PURCHASE'
         AND DATE(transaction_date) >= ? AND DATE(transaction_date) <= ?`,
        [fromDate, toDate],
        (err, costData) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Get daily breakdown for charts
          db.all(
            `SELECT
              bill_date as date,
              COALESCE(SUM(total), 0) as revenue,
              COUNT(*) as transactions
             FROM bills
             WHERE bill_date >= ? AND bill_date <= ? AND status = 'finalized'
             GROUP BY bill_date
             ORDER BY bill_date`,
            [fromDate, toDate],
            (err, dailyRevenue) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Get daily costs
              db.all(
                `SELECT
                  DATE(transaction_date) as date,
                  COALESCE(SUM(total_amount), 0) as costs
                 FROM inventory_transactions
                 WHERE transaction_type = 'PURCHASE'
                 AND DATE(transaction_date) >= ? AND DATE(transaction_date) <= ?
                 GROUP BY DATE(transaction_date)
                 ORDER BY DATE(transaction_date)`,
                [fromDate, toDate],
                (err, dailyCosts) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }

                  // Get payment status breakdown
                  db.all(
                    `SELECT
                      payment_status,
                      COALESCE(SUM(total), 0) as amount,
                      COUNT(*) as count
                     FROM bills
                     WHERE bill_date >= ? AND bill_date <= ?
                     GROUP BY payment_status`,
                    [fromDate, toDate],
                    (err, paymentBreakdown) => {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }

                      // Calculate profit/loss
                      const totalRevenue = revenueData.total_revenue || 0;
                      const totalCosts = costData.total_costs || 0;
                      const profitLoss = totalRevenue - totalCosts;

                      // Combine daily data
                      const dailyData = {};

                      dailyRevenue.forEach(day => {
                        if (!dailyData[day.date]) {
                          dailyData[day.date] = { date: day.date, revenue: 0, costs: 0, profit: 0 };
                        }
                        dailyData[day.date].revenue = day.revenue;
                      });

                      dailyCosts.forEach(day => {
                        if (!dailyData[day.date]) {
                          dailyData[day.date] = { date: day.date, revenue: 0, costs: 0, profit: 0 };
                        }
                        dailyData[day.date].costs = day.costs;
                      });

                      // Calculate profit for each day
                      Object.keys(dailyData).forEach(date => {
                        dailyData[date].profit = dailyData[date].revenue - dailyData[date].costs;
                      });

                      const dailyChart = Object.values(dailyData).sort((a, b) =>
                        new Date(a.date) - new Date(b.date)
                      );

                      res.json({
                        summary: {
                          total_revenue: totalRevenue,
                          total_costs: totalCosts,
                          profit_loss: profitLoss,
                          bill_count: revenueData.bill_count,
                          profit_margin: totalRevenue > 0 ? ((profitLoss / totalRevenue) * 100).toFixed(2) : 0
                        },
                        payment_breakdown: paymentBreakdown,
                        daily_chart: dailyChart,
                        date_range: {
                          from: fromDate,
                          to: toDate
                        }
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// ==================== USER GUIDE ROUTE ====================

// Serve user guide as HTML
app.get('/user-guide', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const guidePath = path.join(__dirname, 'USER_GUIDE.md');

  fs.readFile(guidePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('User guide not found');
    }

    // Convert markdown to HTML-friendly format (basic conversion)
    let html = data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^---$/gm, '<hr>');

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Retail Management System - User Guide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin: 30px 0 20px 0;
      font-size: 2em;
    }
    h2 {
      color: #1e40af;
      margin: 25px 0 15px 0;
      font-size: 1.5em;
      border-left: 4px solid #2563eb;
      padding-left: 15px;
    }
    h3 {
      color: #1e3a8a;
      margin: 20px 0 10px 0;
      font-size: 1.2em;
    }
    h4 {
      color: #475569;
      margin: 15px 0 8px 0;
      font-size: 1.1em;
    }
    p {
      margin: 10px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 10px 0 10px 30px;
    }
    li {
      margin: 5px 0;
    }
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      color: #dc2626;
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    strong {
      color: #1e40af;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 30px 0;
    }
    .back-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: background 0.3s;
    }
    .back-btn:hover {
      background: #1e40af;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 140px;
      background: #059669;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      border: none;
      font-size: 14px;
    }
    .print-btn:hover {
      background: #047857;
    }
    @media print {
      .back-btn, .print-btn { display: none; }
      .container { box-shadow: none; padding: 20px; }
    }
    @media (max-width: 768px) {
      body { padding: 10px; }
      .container { padding: 20px; }
      h1 { font-size: 1.5em; }
      h2 { font-size: 1.3em; }
      .back-btn { top: 10px; right: 10px; padding: 8px 15px; font-size: 12px; }
      .print-btn { top: 10px; right: 110px; padding: 8px 15px; font-size: 12px; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print Guide</button>
  <a href="/" class="back-btn">← Back to App</a>
  <div class="container">
    <p>${html}</p>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(fullHtml);
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Default login: username=admin, password=admin123`);
});