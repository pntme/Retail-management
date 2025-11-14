# ⚡ QUICK START GUIDE

## Get Running in 3 Minutes!

### Step 1: Install Node.js (if not installed)
- Download from: https://nodejs.org/
- Choose LTS version
- Install with default settings

### Step 2: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd` and press Enter
- Navigate to the project folder: `cd path\to\retail-management-system`

**Mac/Linux:**
- Open Terminal
- Navigate to the project folder: `cd path/to/retail-management-system`

### Step 3: Install & Run

```bash
# Install dependencies (first time only)
npm install

# Start the server
npm start
```

### Step 4: Open Your Browser

Go to: **http://localhost:3001**

That's it! You're ready to use your retail system! 🎉

---

## First Steps in the Application

### 1. Add Your First Customer
- Click "Customers" in the sidebar
- Click "+ Add Customer" button
- Fill in the form
- Click "Save"

### 2. Add Your First Product
- Click "Products" in the sidebar
- Click "+ Add Product" button
- Fill in product details (name, SKU, price, stock)
- Click "Save"

### 3. Create Your First Sale
- Click "Sales" in the sidebar
- Click "+ New Sale" button
- Select products and quantities
- Choose payment method
- Click "Complete Sale"

### 4. Set Up Recurring Service (Optional)
- Click "Services" in the sidebar
- Click "+ Add Service" button
- Select customer
- Enter service details
- Choose billing cycle (weekly, monthly, quarterly, yearly)
- Click "Save"

---

## Troubleshooting

### "npm: command not found"
→ Install Node.js from https://nodejs.org/

### "Port 3001 already in use"
→ Change the port in server.js or stop the other application

### Can't connect to localhost:3001
→ Make sure the server is running in your terminal
→ Check for any error messages in the terminal

### Database not creating
→ Make sure you have write permissions in the folder
→ Try running as administrator (Windows) or with sudo (Mac/Linux)

---

## What's Included?

✅ Customer Management
✅ Product/Inventory Management
✅ Sales & Billing (POS)
✅ Recurring Services (Subscriptions)
✅ Dashboard with Statistics
✅ Complete REST API
✅ Responsive UI

---

## Next Steps

1. **Customize:** Edit the colors and branding in `public/index.html`
2. **Deploy:** Follow `DEPLOYMENT.md` to put it online
3. **Extend:** Add new features based on your needs
4. **Sell:** Use this as a base for your SaaS product!

---

## Important Files

- `server.js` - Backend API
- `public/index.html` - Frontend React app
- `retail.db` - Your database (auto-created)
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Hosting & customization guide

---

## Support

Need help? Check:
1. README.md - Full documentation
2. DEPLOYMENT.md - Deployment guide
3. Code comments in server.js

---

**You now have a complete retail management system! 🚀**

Start building your retail business or customize it to sell as your own product!
