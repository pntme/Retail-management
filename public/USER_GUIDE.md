# 📖 Retail Management System - User Guide

**Complete Guide for First-Time Users**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Customers](#managing-customers)
4. [Stock Management](#stock-management)
5. [Creating Job Cards](#creating-job-cards)
6. [Billing System](#billing-system)
7. [Sales Section](#sales-section)
8. [Service Reminders](#service-reminders)
9. [Profit & Loss Reports](#profit--loss-reports)
10. [Mobile Usage](#mobile-usage)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Login

1. **Open the Application**
   - Open your web browser (Chrome, Firefox, or Safari recommended)
   - Navigate to: `http://your-server-address:3001` (or provided URL)

2. **Login Screen**
   - You'll see the Retail Manager login page
   - Default credentials:
     - **Username**: `admin`
     - **Password**: `admin123`
   - Click "Login" button

3. **Change Password** (Recommended)
   - After first login, contact your administrator to change the default password for security

---

## Dashboard Overview

After logging in, you'll see the main dashboard with:

### Left Sidebar Menu
- **📊 Dashboard** - Overview of your business
- **🔔 Reminders** - Upcoming service reminders
- **👥 Customers** - Customer management
- **📦 Stock Management** - Inventory control
- **🔧 Job Cards** - Service job tracking
- **📄 Bills** - Invoice management
- **💰 Sales** - Direct sales
- **📈 Profit & Loss** - Financial reports

### Dashboard Metrics (Main Screen)
- Total Customers count
- Active Job Cards
- Low Stock Alerts
- Monthly Revenue

### Mobile View
- On mobile/tablet, the sidebar is hidden
- Click the **☰ (hamburger icon)** in the top-left to open menu
- Menu slides in from left with a backdrop
- Click any menu item to navigate
- Menu closes automatically after selection

---

## Managing Customers

### Adding a New Customer

**Step 1: Navigate to Customers**
- Click "👥 Customers" in the left sidebar

**Step 2: Click "Add Customer"**
- Look for the blue "➕ Add Customer" button at the top-right
- Click it to open the customer form

**Step 3: Fill Customer Details**

Required fields:
- **Name**: Customer's full name (e.g., "John Doe")
- **Phone**: Contact number (e.g., "9876543210")

Optional fields:
- **Email**: Customer's email address
- **Address**: Full address for reference
- **Vehicle Type**: Car/Bike model (e.g., "Honda City")
- **Vehicle Number**: Registration number (e.g., "KA01AB1234")
  - ⚠️ **Important**: Vehicle numbers must be unique
  - If you enter an existing vehicle number, you'll get an error message showing who owns it
  - This prevents duplicate entries
- **Credit Limit**: Maximum credit allowed (₹)
- **Last Service Date**: When last serviced
- **Next Service Date**: When next service is due

**Step 4: Save**
- Click "Save" button at the bottom
- You'll see a success message
- Customer appears in the customer list

### Searching Customers

**Quick Search:**
- Use the search box at the top of the customer list
- Search by:
  - Customer name
  - Phone number
  - Email
  - Vehicle number

### Viewing Customer Details

**Click on any customer row** to view:
- Full contact information
- Vehicle details
- Service history
- Associated job cards
- Bills history

### Editing Customer Information

1. Click the "✏️ Edit" icon next to the customer
2. Update any field
3. Click "Update" to save changes
4. ⚠️ Vehicle number validation applies here too

### Service History

**To view service history:**
1. Find the customer in the list
2. Click the "📅 Service History" icon
3. You'll see:
   - All job cards for this customer
   - Services performed (tasks)
   - Parts used
   - Bills generated
   - Dates and costs
4. Click "View Bill" on any bill to see the invoice

---

## Stock Management

### Adding Products to Inventory

**Step 1: Go to Stock Management**
- Click "📦 Stock Management" in sidebar

**Step 2: Add New Product**
- Click "➕ Add Product" button

**Step 3: Enter Product Details**

Required:
- **Product Name**: Item name (e.g., "Mobil Engine Oil 5W-30")
- **SKU**: Stock keeping unit / code (e.g., "OIL-MOB-5W30")
- **Buy Price**: Purchase cost per unit (₹)
- **Sell Price**: Selling price per unit (₹)
- **Min Stock Level**: Alert when stock goes below this

Optional:
- **Category**: Product category
- **Vendor**: Supplier name
- **Rack ID**: Storage location
- **Description**: Product details

**Step 4: Save Product**
- Click "Save"
- Product is now in your inventory with 0 quantity

### Recording Stock Purchases

**When you buy inventory:**

1. Find the product in the list
2. Click "📥 Add Stock" or similar action
3. Enter:
   - **Quantity**: How many units purchased
   - **Unit Price**: Cost per unit (can be different from buy price)
   - **Date**: Purchase date
   - **Invoice/Reference**: Supplier invoice number
4. Click "Add Transaction"
5. Stock quantity increases automatically

### Viewing Stock Levels

The stock list shows:
- **Product Name**
- **Current Quantity** (in green if healthy, red if low)
- **Buy Price** & **Sell Price**
- **Min Stock Alert**: Shows warning if below minimum
- **Actions**: Edit, Add Stock, View Transactions

### Stock Alerts

Products with quantity below minimum stock level:
- Appear in red in the list
- Show warning icon
- Displayed on Dashboard as "Low Stock Alerts"

---

## Creating Job Cards

Job Cards track service work for customer vehicles.

### Step 1: Navigate to Job Cards
- Click "🔧 Job Cards" in sidebar

### Step 2: Create New Job Card
- Click "➕ Create Job Card" button

### Step 3: Select Customer

**Option A: Existing Customer**
- Search by name, phone, or vehicle number
- Click on the customer to select

**Option B: New Customer**
- Click "Create New Customer"
- Fill customer form (see Customers section)
- Customer is auto-selected after creation

### Step 4: Enter Job Details

**Vehicle Information:**
- Vehicle number (auto-filled if customer has one)
- Vehicle type/model

**Service Tasks:**
- Click "➕ Add Task"
- Enter task description (e.g., "Oil Change", "Brake Inspection")
- Add multiple tasks as needed
- Click "Remove" to delete a task

**Job Assignment:**
- Select assignee (mechanic/technician)
- Add any notes or special instructions

**Service Dates:**
- Last service date (auto-filled if available)
- Next service date (auto-calculated as 3 months ahead)

### Step 5: Create Job Card
- Click "Create Job Card"
- Job card is created with status "Open"
- Unique job number is assigned (e.g., "JOB-2025-0001")

### Step 6: Add Parts/Stock Items

After creating the job card:

1. Open the job card (click on it)
2. Click "➕ Add Stock Item"
3. Search and select product from inventory
4. Enter:
   - **Quantity**: How many units used
   - **Unit Price**: Price to charge (auto-filled from sell price)
   - **Notes**: Optional notes
5. Click "Add"
6. Stock is automatically deducted from inventory
7. Item appears in the job card

**Repeat for all parts used in the service**

### Step 7: Complete Job Card & Generate Bill

**When work is finished:**

1. Open the job card
2. Click "✅ Complete & Bill" button
3. Enter:
   - **Labour Charge**: Service charge (₹)
   - **Discount**: Any discount to give (₹)
   - **Last Service Date**: Confirm or edit
   - **Next Service Date**: Confirm or edit (default: +3 months)
4. Click "Complete"

**What happens:**
- Job card status changes to "Closed"
- Bill is automatically generated
- Bill number assigned (e.g., "BIL-2025-0001")
- Customer's service dates are updated
- Success modal shows bill details

### Step 8: View/Print Bill

After completion, you can:
- Click "View Bill" to see invoice
- Click "Download" to save/print (use browser's Print → Save as PDF)
- Bill is stored permanently and can be accessed anytime

---

## Billing System

### Understanding Bills

**Bills are automatically created when you:**
- Complete a job card, OR
- Make a direct sale (see Sales section)

**Bill Components:**
1. **Customer Details**: Name, phone, vehicle
2. **Services Provided**: List of tasks performed
3. **Parts & Materials**: Stock items used with quantities and prices
4. **Labour Charge**: Service fees
5. **Discount**: Any discount applied
6. **Total Amount**: Final bill amount

### Viewing All Bills

**Step 1: Go to Bills Section**
- Click "📄 Bills" in sidebar

**Step 2: Use Filters** (Optional)

Filter bills by:
- **From Date**: Start date
- **To Date**: End date
- **Payment Status**: All, Paid, or Unpaid
- **Search**: Bill number or job number

Click "Apply Filters" to filter

**Step 3: Bills List**

You'll see all bills with:
- Bill number
- Job number
- Customer name and phone
- Bill date
- Total amount
- Payment status (PAID/UNPAID badge)
- Actions: View, Mark Paid

### Viewing a Bill

**To view any bill:**
1. Find the bill in the list
2. Click "View" button
3. Professional invoice opens in new tab showing:
   - Company/shop header
   - Bill number and date
   - Customer and vehicle details
   - Services performed
   - Parts used with quantities and prices
   - Labour charges
   - Discounts
   - Grand total
   - Payment status

### Downloading/Printing Bills

**Option 1: From Bill View**
1. Open the bill (View button)
2. In the new tab, click "Print Invoice" button at bottom
3. Use browser's Print dialog:
   - Select "Save as PDF" as printer
   - Click Save

**Option 2: Browser Print**
1. Open the bill
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Save as PDF or print to physical printer

### Marking Bills as Paid

When customer pays:
1. Go to Bills section
2. Find the unpaid bill
3. Click "Mark Paid" button
4. Confirm
5. Status changes from UNPAID (yellow) to PAID (green)

### Finding Old Bills

**Scenario: Customer comes after a month asking for bill**

No problem! Bills are stored permanently:

1. Go to Bills section
2. Set date range to include the past month
3. Search by customer phone or bill number
4. Click "View" to open the bill
5. Download/print as PDF

**Important:** Bill always shows the **original completion date**, not today's date!

### Bill History in Job Cards

To see all bills for a specific job card:
1. Go to Job Cards section
2. Open any closed job card
3. Scroll down to "Bills History" section
4. See all bills generated for that job
5. Click "View" or "Download" on any bill

---

## Sales Section

The Sales section handles direct product sales (not tied to job cards).

### Two Sales Modes

**Mode 1: Sell by Job Card**
- Use this when customer already has an open job card
- Items added to existing job card
- Job card gets completed with bill

**Mode 2: Direct Sell**
- Use this for walk-in customers
- Sell products directly without job card
- Instant billing

### Direct Sell Process

**Step 1: Select Direct Sell Mode**
- Go to "💰 Sales" in sidebar
- Click "Direct Sell" button

**Step 2: Select Customer**

**Option A: Existing Customer**
- Search by name, phone, or vehicle
- Click customer to select

**Option B: New Customer**
- Click "➕ Create New Customer"
- Fill:
  - Name (required)
  - Phone (required)
  - Email, address (optional)
- Click "Create"
- Customer is auto-selected

**Step 3: Add Products**
- Click "➕ Add Product"
- Search for product in the list
- Click on product to add to cart
- Product appears in selected items

**Repeat for all products customer wants to buy**

**Step 4: Adjust Quantities & Prices**

For each item in cart:
- **Quantity**: Change if needed (checks stock availability)
- **Unit Price**: Adjust if giving special price
- **Remove**: Click ✖️ to remove item

**Step 5: Apply Discount** (Optional)
- Enter discount amount (₹)
- Shows in the total calculation

**Step 6: Select Payment Method**
- Cash
- Card
- UPI
- Bank Transfer

**Step 7: Generate Bill**
- Review the bill preview showing:
  - Customer details
  - Items with quantities and prices
  - Subtotal
  - Discount (if any)
  - Final total
  - Payment method
- Click "Confirm & Generate Bill"

**Step 8: View/Print Bill**
- Bill is generated immediately
- Success message appears
- Click "View Bill" to see invoice
- Print or download as PDF

---

## Service Reminders

### Understanding Reminders

The system automatically tracks:
- **Last Service Date**: When customer was last serviced
- **Next Service Date**: When next service is due (usually 3 months later)

### Viewing Reminders

**Step 1: Go to Reminders**
- Click "🔔 Reminders" in sidebar

**Step 2: Reminder List**

You'll see customers sorted by:
- **Overdue** (in red): Service is past due
- **Upcoming** (in blue): Service due soon

Each reminder shows:
- Customer name
- Phone number (click to call)
- Next service date
- Status: "Overdue for X days" or "Upcoming service in X days"

### Taking Action on Reminders

**For each customer, you can:**

1. **View Service History**
   - Click "📅 Service History" icon
   - See all past services, parts used, bills
   - Click "View Bill" on any past bill

2. **View Call Logs**
   - Click "📞 Call Logs" icon
   - See history of calls made
   - Add new call log with notes

3. **Create Job Card**
   - When customer comes for service
   - Click customer to open details
   - Click "Create Job Card"
   - Follow job card process

### Adding Call Logs

When you call a customer:
1. Click "📞 Call Logs" icon for the customer
2. Click "Add New Call Log"
3. Enter notes about the call
   - Example: "Called, customer will come next week"
   - Example: "No answer, try again tomorrow"
4. Click "Add"
5. Log is saved with timestamp

**Call logs help track:**
- Who was contacted
- When they were contacted
- What was discussed
- Follow-up needed

---

## Profit & Loss Reports

### Accessing Reports

**Step 1: Go to Reports**
- Click "📈 Profit & Loss" in sidebar

**Step 2: View Current Report**
- Default shows current month data
- 4 summary cards at top:
  1. **Total Revenue** (green) - Money earned
  2. **Total Costs** (red) - Money spent on inventory
  3. **Net Profit/Loss** - Revenue minus Costs (green border = profit, red = loss)
  4. **Profit Margin** - Percentage of revenue that's profit

### Understanding the Charts

**Chart 1: Revenue vs Costs Trend (Line Chart)**
- Green line = Daily revenue from bills
- Red line = Daily inventory purchase costs
- Shows how revenue and costs change over time
- Hover over any point to see exact amount

**Chart 2: Daily Profit/Loss (Bar Chart)**
- Green bars = Days with profit
- Red bars = Days with loss
- Height shows amount of profit/loss
- Helps identify good and bad days

**Chart 3: Payment Status (Pie Chart)**
- Shows breakdown of paid vs unpaid bills
- Green slice = Paid bills
- Yellow slice = Unpaid bills
- Click on slices to see amounts

### Filtering Reports

**Step 1: Select Date Range**
- **From Date**: Start date for report
- **To Date**: End date for report
- Common ranges:
  - This Month: 1st of month to today
  - Last Month: Previous month dates
  - This Year: January 1st to today
  - Custom: Any date range you want

**Step 2: Generate Report**
- Click "Generate Report" button
- Charts and summaries update with new data

### Downloading/Printing Reports

**To save or print:**
1. Click "📄 Download/Print Report" button at top
2. Browser print dialog opens
3. Options:
   - **Print**: Send to physical printer
   - **Save as PDF**: Select "Save as PDF" as printer
   - **Destination**: Choose where to save
4. Click Print/Save

**Tip:** Report includes all charts and summaries in a professional format

### Using Reports for Business Decisions

**Key Insights:**

1. **Profit Margin**
   - Below 10%: Review pricing or reduce costs
   - 10-20%: Healthy margin
   - Above 20%: Excellent margin

2. **Unpaid Bills**
   - High unpaid amount: Follow up with customers
   - Set policies for credit limits

3. **Daily Trends**
   - Identify busy days vs slow days
   - Plan inventory purchases accordingly
   - Schedule staff based on trends

4. **Monthly Comparison**
   - Compare this month vs last month
   - Track growth or decline
   - Set revenue targets

---

## Mobile Usage

### Accessing on Mobile

**Step 1: Open Browser**
- Use Chrome, Safari, or Firefox on your phone/tablet

**Step 2: Navigate to URL**
- Enter the same web address as desktop
- Login with same credentials

**Step 3: Mobile Interface**
- Sidebar is hidden by default
- Clean, uncluttered main screen
- Touch-optimized buttons

### Using the Mobile Menu

**Opening Menu:**
- Look for **☰ (hamburger icon)** in top-left corner
- Tap it to open sidebar
- Sidebar slides in from left
- Dark backdrop appears behind

**Navigating:**
- Tap any menu item to go to that section
- Menu automatically closes after selection
- Or tap the backdrop to close menu manually
- Or tap the ✖️ close button in sidebar

### Mobile Tips

**Best Practices:**
1. **Landscape Mode**: Rotate phone sideways for tables and charts
2. **Zoom**: Pinch to zoom on small text
3. **Tables**: Swipe left/right on tables to see all columns
4. **Forms**: Tap form fields to bring up keyboard
5. **Charts**: Charts automatically resize for mobile screens

**Common Mobile Tasks:**

✅ **Quick Customer Lookup**
- Menu → Customers → Search

✅ **Create Job Card on the Go**
- Menu → Job Cards → Create Job Card

✅ **Mark Bill as Paid**
- Menu → Bills → Find bill → Mark Paid

✅ **Check Stock Levels**
- Menu → Stock Management → View products

✅ **Add Call Log**
- Menu → Reminders → Call Logs icon → Add note

---

## Common Tasks

### Task 1: New Customer Walk-In for Service

**Steps:**
1. Go to Job Cards → Create Job Card
2. Click "Create New Customer"
3. Enter name, phone, vehicle number
4. Save customer
5. Add service tasks (e.g., "Oil Change")
6. Create job card
7. Add stock items used (e.g., engine oil)
8. Complete & Bill
9. Enter labour charge, discount
10. View/print bill for customer

---

### Task 2: Regular Customer Returns for Service

**Steps:**
1. Go to Reminders
2. Find customer in the list
3. Click Service History to see past work
4. Go to Job Cards → Create Job Card
5. Search and select customer (auto-fills vehicle info)
6. Add tasks
7. Create job card
8. Complete work and add parts
9. Complete & Bill
10. Print bill

---

### Task 3: Customer Lost Their Bill

**Steps:**
1. Go to Bills section
2. Search by:
   - Customer phone number, OR
   - Bill number if they remember, OR
   - Date range when they came
3. Find the bill in results
4. Click "View"
5. Print or send to customer's email

**Remember:** Bills are never deleted, always accessible!

---

### Task 4: Running Out of Stock

**Steps:**
1. Go to Stock Management
2. Look for red warnings (below minimum stock)
3. Click "📥 Add Stock" for that product
4. Enter quantity purchased
5. Enter purchase price
6. Add supplier invoice reference
7. Save transaction
8. Stock level updates immediately

---

### Task 5: Customer Wants to Buy Products (No Service)

**Steps:**
1. Go to Sales → Direct Sell
2. Select customer or create new
3. Add products to cart
4. Adjust quantities
5. Apply discount if any
6. Select payment method
7. Confirm & Generate Bill
8. Print bill

---

### Task 6: Month-End Financial Review

**Steps:**
1. Go to Profit & Loss Reports
2. Set date range:
   - From: First day of last month
   - To: Last day of last month
3. Click "Generate Report"
4. Review:
   - Total revenue earned
   - Total costs incurred
   - Net profit/loss
   - Profit margin percentage
5. Check unpaid bills amount
6. Download/print report for records
7. Compare with previous months

---

### Task 7: Following Up on Overdue Services

**Steps:**
1. Go to Reminders
2. Filter/sort by overdue customers (shown in red)
3. For each customer:
   - Click "📞 Call Logs"
   - Call the customer
   - Add call log with outcome
   - If customer agrees, create job card
4. Track follow-up dates in call logs

---

## Troubleshooting

### Problem: Can't Login

**Solutions:**
1. Check username and password (case-sensitive)
2. Try default credentials: admin / admin123
3. Clear browser cache and cookies
4. Try different browser
5. Contact system administrator

---

### Problem: Vehicle Number Already Exists Error

**This is by design!**
- When adding/editing customer with vehicle number
- System checks if number already exists
- Error message shows: "This vehicle number is already registered to [Name] ([Phone])"

**Solutions:**
1. Search for existing customer using that vehicle number
2. Update existing customer instead of creating new
3. Verify vehicle number is typed correctly

---

### Problem: Stock Item Shows Out of Stock

**Causes:**
- Item used in job cards
- Physical stock sold out
- Not recorded in purchases

**Solutions:**
1. Record new stock purchase
2. Check inventory transactions to see usage
3. Adjust stock if count is wrong (Add Stock with notes)

---

### Problem: Bill Not Generating

**Check:**
1. Job card must be marked as "Completed"
2. All required fields filled in Complete & Bill form
3. Try refreshing the page
4. Check console for errors (F12 in browser)

---

### Problem: Charts Not Showing in Profit & Loss

**Solutions:**
1. Ensure date range has data (bills or purchases)
2. Try wider date range
3. Refresh the page
4. Clear browser cache
5. Try different browser

---

### Problem: Mobile Menu Not Opening

**Solutions:**
1. Look for ☰ icon in top-left corner
2. Refresh page
3. Check screen size (should be < 1024px width for mobile view)
4. Try different browser

---

### Problem: Can't Find Old Bill

**Solutions:**
1. Expand date range in Bills filters
2. Search by exact bill number or phone
3. Bills are never deleted - check search terms
4. Try searching without filters (remove all filters)

---

### Problem: Discount Not Applying

**Check:**
1. Discount is flat amount (₹), not percentage
2. Amount entered correctly
3. Discount can't be more than subtotal
4. Save/Submit button clicked

---

## Best Practices

### Daily Tasks
- [ ] Check low stock alerts
- [ ] Review open job cards
- [ ] Mark paid bills as paid
- [ ] Add call logs for customer follow-ups

### Weekly Tasks
- [ ] Review upcoming service reminders
- [ ] Call overdue customers
- [ ] Check unpaid bills and follow up
- [ ] Review inventory levels

### Monthly Tasks
- [ ] Generate Profit & Loss report
- [ ] Compare with previous month
- [ ] Plan inventory purchases
- [ ] Review pricing if profit margin is low
- [ ] Back up important data

### Data Entry Tips
1. **Always fill vehicle numbers** for tracking
2. **Add detailed task descriptions** for service history
3. **Use consistent product names** for easier search
4. **Add notes** in job cards for special instructions
5. **Mark bills as paid** immediately when received

### Security Tips
1. **Logout** when leaving computer unattended
2. **Change default password** after first login
3. **Don't share** login credentials
4. **Regular backups** of database
5. **Use strong passwords**

---

## Getting Help

### Contact Information
- **Technical Support**: [Your contact info]
- **System Administrator**: [Admin contact]
- **Emergency**: [Emergency contact]

### Quick Reference

**Keyboard Shortcuts:**
- `Ctrl+P` / `Cmd+P`: Print current page
- `F5`: Refresh page
- `Ctrl+F` / `Cmd+F`: Search on page

**Common Abbreviations:**
- JOB: Job Card
- BIL: Bill/Invoice
- SKU: Stock Keeping Unit

---

## Appendix: Understanding the Bill

### Sample Bill Breakdown

```
INVOICE
Invoice #BIL-2025-0001

BILL TO:                          INVOICE DETAILS:
John Doe                          Date: 15-Jan-2025
Phone: 9876543210                 Invoice #: BIL-2025-0001
Vehicle: KA01AB1234               Status: UNPAID
Model: Honda City

SERVICES PROVIDED
Service Description               Qty    Rate        Amount
Oil Change                        1      ₹0.00       ₹0.00
Brake Inspection                  1      ₹0.00       ₹0.00

PARTS & MATERIALS
Item Description                  Qty    Rate        Amount
Mobil Engine Oil 5W-30           4      ₹450.00     ₹1,800.00
Brake Fluid DOT 4                1      ₹200.00     ₹200.00

Labour Charge:                                       ₹500.00
Subtotal:                                           ₹2,500.00
Discount:                                            -₹100.00
────────────────────────────────────────────────────────────
TOTAL:                                              ₹2,400.00
```

**Understanding Each Part:**
1. **Services Provided**: Tasks performed (usually ₹0 as cost is in labour)
2. **Parts & Materials**: Stock items used with quantity and price
3. **Labour Charge**: Service fees for the work done
4. **Subtotal**: Parts total + Labour charge
5. **Discount**: Any discount given to customer
6. **Total**: Final amount to be paid

---

## Conclusion

This guide covers all major features of the Retail Management System. For advanced features or custom needs, please contact your system administrator.

**Remember:**
- Data is automatically saved
- Bills are permanent and never deleted
- Mobile and desktop work identically
- Regular backups are important
- Contact support if you need help

**Thank you for using Retail Management System!**

---

**Document Version:** 1.0
**Last Updated:** January 2025
**For Software Version:** 2.0 (Complete Bill System)
