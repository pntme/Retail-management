# 🚀 Deployment & Customization Guide

## Table of Contents
1. [Self-Hosting](#self-hosting)
2. [Cloud Deployment](#cloud-deployment)
3. [Customization Guide](#customization-guide)
4. [Selling as SaaS](#selling-as-saas)
5. [Security Best Practices](#security-best-practices)

---

## 1. Self-Hosting

### Option A: Simple Server Setup

**Requirements:**
- Linux server (Ubuntu 20.04+ recommended)
- Node.js 14+
- 512MB RAM minimum (1GB recommended)
- 10GB disk space

**Steps:**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Clone/upload your project
cd /var/www
# Upload your retail-management-system folder here

# 4. Install dependencies
cd retail-management-system
npm install

# 5. Install PM2 for process management
sudo npm install -g pm2

# 6. Start the application
pm2 start server.js --name retail-hub
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/retail-hub

# Add this configuration:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/retail-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 8. Setup SSL with Let's Encrypt (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### Option B: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  retail-hub:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./retail.db:/app/retail.db
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 2. Cloud Deployment

### Railway Deployment (Recommended - With Data Persistence)

**⚠️ IMPORTANT: Railway uses ephemeral storage. You MUST use volumes to prevent data loss!**

See **[RAILWAY-DEPLOYMENT.md](./RAILWAY-DEPLOYMENT.md)** for detailed instructions.

**Quick Start:**

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from your GitHub repo
4. **Add a Volume**:
   - Go to service → Volumes → New Volume
   - Mount path: `/data`
   - Size: 1GB (to start)
5. **Set environment variable**:
   ```
   RAILWAY_VOLUME_MOUNT_PATH=/data
   ```
6. Deploy!

**Why Railway?**
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Built-in monitoring
- ✅ Free tier available
- ✅ Persistent storage with volumes

### Heroku Deployment

```bash
# 1. Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. Login
heroku login

# 3. Create app
heroku create your-retail-app

# 4. Deploy
git init
git add .
git commit -m "Initial deployment"
git push heroku main

# 5. Open app
heroku open
```

### DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean App Platform
3. Click "Create App"
4. Select your repository
5. Configure:
   - Build Command: `npm install`
   - Run Command: `node server.js`
   - Port: 3001
6. Deploy!

### AWS EC2 Deployment

```bash
# 1. Launch EC2 instance (Ubuntu 20.04)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Follow the "Simple Server Setup" steps above
```

---

## 3. Customization Guide

### Branding

**Change App Name:**

Edit `public/index.html`:
```javascript
<div className="logo">🏪 YourBrandName</div>
<title>YourBrandName - Retail Management</title>
```

**Change Colors:**

Edit the color scheme in `public/index.html` `<style>` section:
```css
/* Primary Color (Blue) */
background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
/* Change to your brand color, e.g., */
background: linear-gradient(180deg, #059669 0%, #10b981 100%); /* Green */

.btn-primary {
  background: #1e3a8a; /* Your primary color */
}
```

### Add New Features

**Example: Add Tax Calculation**

1. **Backend** (server.js):
```javascript
// In sales creation
const TAX_RATE = 0.10; // 10% tax
const subtotal = total;
const tax = subtotal * TAX_RATE;
const totalWithTax = subtotal + tax;

// Store in database
db.run(
  'INSERT INTO sales (customer_id, subtotal, tax, total_amount, payment_method) VALUES (?, ?, ?, ?, ?)',
  [customer_id, subtotal, tax, totalWithTax, payment_method],
  // ...
);
```

2. **Frontend** (public/index.html):
```javascript
// In SaleModal component
<tr>
  <td colSpan="3" style={{textAlign: 'right'}}>Subtotal:</td>
  <td>${subtotal.toFixed(2)}</td>
</tr>
<tr>
  <td colSpan="3" style={{textAlign: 'right'}}>Tax (10%):</td>
  <td>${(subtotal * 0.10).toFixed(2)}</td>
</tr>
<tr>
  <td colSpan="3" style={{textAlign: 'right', fontWeight: 'bold'}}>Total:</td>
  <td style={{fontWeight: 'bold'}}>${(subtotal * 1.10).toFixed(2)}</td>
</tr>
```

### Database Customization

**Add New Fields:**

1. Update table schema in `server.js`:
```javascript
db.run(`CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,  // NEW FIELD
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

2. Update API endpoints to include new field
3. Update frontend forms

### Multi-language Support

Create a translations object:
```javascript
const translations = {
  en: {
    dashboard: 'Dashboard',
    customers: 'Customers',
    // ... more translations
  },
  es: {
    dashboard: 'Tablero',
    customers: 'Clientes',
    // ... more translations
  }
};
```

---

## 4. Selling as SaaS

### Business Model Options

**Option 1: Per-Store Pricing**
```
Basic Plan: $29/month
- 1 Store
- Up to 100 products
- Basic reports

Pro Plan: $79/month
- 3 Stores
- Unlimited products
- Advanced reports
- Priority support

Enterprise: Custom pricing
- Unlimited stores
- Custom features
- Dedicated support
```

**Option 2: Usage-Based Pricing**
```
$0.10 per transaction
$5/month minimum
Volume discounts available
```

### Multi-Tenant Architecture

To support multiple clients, you'll need to add:

1. **Tenant Isolation:**
```javascript
// Add tenant_id to all tables
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  name TEXT,
  // ...
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

// Add middleware to filter by tenant
app.use((req, res, next) => {
  req.tenantId = getUserTenantId(req.user);
  next();
});

// Update queries
app.get('/api/customers', (req, res) => {
  db.all(
    'SELECT * FROM customers WHERE tenant_id = ?',
    [req.tenantId],
    // ...
  );
});
```

2. **User Authentication:**
```bash
npm install jsonwebtoken bcryptjs
```

```javascript
// Add authentication
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register endpoint
app.post('/api/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  // Save user with hashed password
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  // Verify credentials
  const token = jwt.sign({ userId, tenantId }, 'secret');
  res.json({ token });
});

// Protect routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  // Verify token
  next();
};

app.use('/api', authMiddleware);
```

3. **Payment Integration (Stripe):**
```bash
npm install stripe
```

```javascript
const stripe = require('stripe')('your_stripe_key');

app.post('/api/subscribe', async (req, res) => {
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customerId,
    items: [{ price: 'price_xxxxx' }],
  });
  res.json(subscription);
});
```

### Marketing Your SaaS

**Landing Page Features:**
- Free 14-day trial
- No credit card required
- Video demo
- Customer testimonials
- Pricing comparison
- Live chat support

**SEO Keywords:**
- "retail management software"
- "point of sale system"
- "inventory management"
- "small business POS"

---

## 5. Security Best Practices

### Essential Security Measures

1. **Add Authentication:**
```javascript
// Implement JWT authentication
// Never expose APIs without auth in production
```

2. **Input Validation:**
```javascript
const validator = require('validator');

app.post('/api/customers', (req, res) => {
  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  // Continue...
});
```

3. **SQL Injection Prevention:**
```javascript
// Always use parameterized queries (already implemented)
db.run('SELECT * FROM users WHERE id = ?', [userId]); // ✓ Good
db.run(`SELECT * FROM users WHERE id = ${userId}`);  // ✗ Bad
```

4. **HTTPS Only:**
```nginx
# Force HTTPS in Nginx
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

5. **Rate Limiting:**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

6. **Environment Variables:**
```javascript
// Never commit sensitive data
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
```

7. **Database Backups:**
```bash
# Setup daily backups
0 2 * * * cp /path/to/retail.db /backups/retail-$(date +\%Y\%m\%d).db
```

8. **CORS Configuration:**
```javascript
app.use(cors({
  origin: 'https://yourdomain.com', // Specific origin only
  credentials: true
}));
```

---

## 6. Monitoring & Maintenance

### Setup Monitoring

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Error Tracking:**
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in your app
logger.error('Something went wrong', { error: err });
```

### Regular Maintenance Tasks

1. **Weekly:**
   - Check error logs
   - Review system performance
   - Check disk space

2. **Monthly:**
   - Update dependencies
   - Review security patches
   - Optimize database
   - Test backups

3. **Quarterly:**
   - Security audit
   - Performance optimization
   - User feedback review

---

## 7. Next Steps

### Recommended Enhancements

1. **Authentication & Authorization**
   - User login/logout
   - Role-based access (admin, cashier, manager)
   - Session management

2. **Reporting**
   - Sales by date range
   - Top selling products
   - Customer analytics
   - Revenue forecasts

3. **Integrations**
   - Payment gateways (Stripe, PayPal)
   - Email notifications (SendGrid)
   - SMS alerts (Twilio)
   - Accounting software (QuickBooks)

4. **Mobile App**
   - React Native version
   - Barcode scanning
   - Offline mode

5. **Advanced Features**
   - Employee management
   - Supplier management
   - Purchase orders
   - Returns/refunds
   - Discounts & promotions
   - Gift cards
   - Loyalty programs

---

## Need Help?

- Check the main README.md for basic information
- Review the code comments in server.js
- Test features locally before deploying
- Keep backups before making changes

**Good luck with your retail management system! 🚀**
