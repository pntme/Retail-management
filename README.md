# Retail Management System

A complete, modern retail management system built with Node.js and React. Features customer management, inventory tracking, recurring service billing, and POS sales.

## 🌟 Features

### Core Functionality
- ✅ **Customer Management** - Store customer data, credit limits, and purchase history
- ✅ **Product & Inventory Management** - Track stock levels, SKUs, pricing, and reorder points
- ✅ **Recurring Service Management** - Periodic billing for subscriptions (weekly/monthly/quarterly/yearly)
- ✅ **Sales & Billing** - POS system with cart, discount, tax calculation
- ✅ **Dashboard** - Real-time statistics and analytics
- ✅ **User Authentication** - Secure JWT-based authentication
- ✅ **Low Stock Alerts** - Automatic notifications for inventory below reorder level

### Technical Features
- 🚀 Fast and lightweight (SQLite database)
- 🎨 Modern, responsive UI (React + Tailwind CSS)
- 🔐 Secure API with JWT authentication
- 📱 Mobile-friendly interface
- 💾 Self-hosted - 100% yours to customize
- 🔄 Real-time inventory updates
- 📊 Dashboard with key metrics

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- SQLite3 (no external database needed!)
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Tailwind CSS
- Vanilla JavaScript (no build step needed)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone or extract the project**
```bash
cd retail-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open your browser**
```
http://localhost:3001
```

5. **Login with default credentials**
- Username: `admin`
- Password: `admin123`

That's it! The application will create the SQLite database automatically on first run.

## 🚀 Usage

### Default Admin Account
- **Username:** admin
- **Password:** admin123

**⚠️ IMPORTANT:** Change the default password after first login!

### Managing Customers
1. Navigate to "Customers" in the sidebar
2. Click "+ Add Customer" to create new customers
3. Store contact info, credit limits, and addresses
4. Edit or delete customers as needed

### Managing Products
1. Navigate to "Products" in the sidebar
2. Add products with:
   - Name, SKU, Category
   - Pricing (retail and cost)
   - Stock quantity
   - Reorder level for alerts
3. Low stock items will be highlighted

### Recurring Services
1. Navigate to "Services" in the sidebar
2. Create periodic billing services:
   - Assign to a customer
   - Set billing cycle (weekly/monthly/quarterly/yearly)
   - Define start/end dates
   - Track service status

### Processing Sales
1. Navigate to "Sales" in the sidebar
2. Click "+ New Sale"
3. Select products (click to add to cart)
4. Optionally select a customer
5. Adjust quantities, add discounts/tax
6. Complete the sale
7. Inventory automatically updates!

## 🗂️ Project Structure

```
retail-management-system/
├── server.js              # Main Express server & API
├── package.json           # Dependencies
├── retail.db             # SQLite database (auto-created)
└── public/
    └── index.html        # React frontend (single-page app)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service

### Sales
- `GET /api/sales` - List all sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/low-stock` - Get low stock items
- `GET /api/dashboard/recent-sales` - Get recent sales

## 🔧 Configuration

### Change Server Port
Edit `server.js` line 9:
```javascript
const PORT = process.env.PORT || 3001;
```

### Change JWT Secret
Edit `server.js` line 10:
```javascript
const JWT_SECRET = 'your-secret-key-change-in-production';
```

**⚠️ IMPORTANT:** Change this in production!

### Change API URL (Frontend)
Edit `public/index.html` line 25:
```javascript
const API_URL = 'http://localhost:3001/api';
```

## 💼 Business Model Ideas

### How to Monetize This Software

1. **SaaS Hosting** 
   - Host for clients at ₹2,500-8,000/month per store
   - Handle updates, backups, and support

2. **Implementation Services**
   - Charge ₹1,50,000-8,00,000 for setup and customization
   - Add custom features per client needs

3. **White Label**
   - Brand it as your own
   - Bundle with hardware (tablets, printers, scanners)

4. **Support Contracts**
   - Monthly support: ₹8,000-40,000/month
   - Phone/email support, training

5. **Custom Development**
   - AI-powered inventory forecasting
   - Integration with accounting software
   - E-commerce integration
   - Mobile apps

## 🎯 Customization Ideas

### Easy Wins
- Add your logo to the login page
- Change color scheme (edit Tailwind classes)
- Add more fields to customer/product forms
- Create reports (sales by date, product performance)

### Advanced Features
- Email notifications for low stock
- Barcode scanner support
- Receipt printing
- Multi-location support
- Employee management
- Customer loyalty programs
- AI-powered sales forecasting

## 🔐 Security Notes

1. **Change Default Password** immediately
2. **Change JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Regular backups** of retail.db file
5. **Firewall** - Don't expose port 3001 to internet directly
6. **Use reverse proxy** (nginx) in production

## 📱 Deployment

### Cloud Deployment (Recommended)

**🚀 Deploy to Render (Easiest & Free):**
- See detailed guide: **[RENDER-DEPLOYMENT.md](./RENDER-DEPLOYMENT.md)**
- Quick start: Push to GitHub → Connect to Render → Click Deploy
- Free tier available with persistent storage
- Automatic HTTPS and custom domain support

**🚂 Deploy to Railway:**
- See detailed guide: **[RAILWAY-DEPLOYMENT.md](./RAILWAY-DEPLOYMENT.md)**
- Similar to Render, requires volume setup for data persistence

**📚 Complete Deployment Guide:**
- See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for all deployment options
- Includes: Render, Railway, Heroku, DigitalOcean, AWS EC2, Docker, and VPS setup

### Local Network Deployment
1. Find your computer's IP address
2. Update API_URL in index.html to `http://YOUR-IP:3001/api`
3. Other devices can access via `http://YOUR-IP:3001`

## 🐛 Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Run `npm install` again
- Check Node.js version (need v14+)

### Can't login
- Default: admin / admin123
- Check browser console for errors
- Verify server is running on port 3001

### Database issues
- Delete `retail.db` file and restart (will reset all data)
- Check file permissions

## 📄 License

MIT License - Feel free to use, modify, and sell this software!

## 🤝 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the code comments
3. Test with default credentials first

## 🎉 What's Next?

**Your Advantages:**
- ✅ No licensing fees or restrictions
- ✅ Complete source code access
- ✅ 100% customizable
- ✅ Self-hosted (you control everything)
- ✅ Modern tech stack (easy to find developers)
- ✅ Perfect for adding AI features later

**Next Steps:**
1. Test all features thoroughly
2. Customize the UI to your brand
3. Add your own features
4. Deploy for your first client
5. Build your business!

---

Built with ❤️ for entrepreneurs and developers who want to build their own SaaS business.
