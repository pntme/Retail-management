# Product Schema Update

## Changes Made

The Product section has been updated with the following fields and features:

### Database Schema (server.js)

**Products Table Fields:**
1. **Product Name** (`name`) - TEXT NOT NULL - Mandatory, free text
2. **Unit Sell Price** (`sell_price`) - REAL NOT NULL - Mandatory, number only, Currency: INR (₹)
3. **Quantity** (`quantity`) - INTEGER NOT NULL - Mandatory, number only
4. **Unit Purchase Price** (`purchase_price`) - REAL NOT NULL - Mandatory, number only, Currency: INR (₹)
5. **Vendor** (`vendor`) - TEXT - Optional, free text
6. **Rack ID** (`rack_id`) - TEXT - Optional, free text
7. **Additional Info** (`additional_info`) - TEXT - Optional, textarea/free text
8. **ID** (`id`) - TEXT PRIMARY KEY - Auto-generated UUID
9. **Created At** (`created_at`) - DATETIME - Auto-timestamp

### Frontend UI (public/index.html)

**Products Component Features:**
- Full CRUD operations (Create, Read, Update, Delete)
- **Search Functionality**: Search products by name or vendor
- **Rack Filter**: Filter products by specific rack location (e.g., A-1, A-2, B-1)
- Product listing table with view, edit, and delete actions
- Add Product button to create new products
- Form validation for mandatory fields
- Number validation for prices and quantity
- INR (₹) currency symbol display
- **Calculated Fields Display**:
  - Total Purchase Price (Unit Purchase Price × Quantity)
  - Expected Total Sell Price (Unit Sell Price × Quantity)
  - Potential Profit (before customer discounts)
- View modal to see complete product details with totals
- Edit modal to update existing products with live calculation preview
- Responsive table layout with horizontal scroll
- Results counter showing filtered vs total products
- Clear filters button

**Form Fields:**
- Product Name (text input, required)
- Unit Sell Price (number input with 2 decimal places, required, displayed with ₹)
- Quantity (integer input, required)
- Unit Purchase Price (number input with 2 decimal places, required, displayed with ₹)
- Vendor (text input, optional)
- Rack ID (text input, optional, e.g., A-1, B-2)
- Additional Info (textarea, optional)
- **Live Calculations** (shown in form):
  - Total Purchase Price
  - Expected Total Sell Price
  - Potential Profit

**Table Columns:**
1. Actions (View, Edit, Delete icons)
2. Product Name
3. Unit Sell Price (₹)
4. Quantity
5. Unit Purchase Price (₹)
6. **Total Purchase (₹)** - Calculated (orange color)
7. **Expected Total Sell (₹)** - Calculated (green color)
8. Vendor
9. Rack ID

### Search and Filter Features

**Search Bar:**
- Search by product name (case-insensitive)
- Search by vendor name (case-insensitive)
- Real-time filtering as you type

**Rack Filter:**
- Dropdown showing all unique rack IDs from products
- Filter to show only products in selected rack
- Useful for inventory management by location
- Example: Filter "A-1" shows only products in Rack A-1

**Combined Filtering:**
- Search and rack filter can be used together
- Clear Filters button to reset both filters
- Shows count: "Showing X of Y products"

### API Endpoints Updated

1. **GET /api/products** - Fetch all products
2. **POST /api/products** - Create new product with new schema
3. **PUT /api/products/:id** - Update product with new schema
4. **DELETE /api/products/:id** - Delete product

### Backend Changes (server.js)

1. Updated products table schema (lines 57-65)
2. Updated POST /api/products endpoint (lines 277-291)
3. Updated PUT /api/products/:id endpoint (lines 293-307)
4. Updated low stock queries to use `quantity` field (lines 454, 479-486)
5. Updated sales inventory update to use `quantity` field (line 426)

### Frontend Changes (public/index.html)

1. Replaced Products component placeholder with full implementation (lines 372-690+)
2. Added form state management
3. Added validation for mandatory fields
4. Added view, edit, delete functionality
5. Added modal for create/edit/view operations
6. Integrated INR currency display
7. **Added search bar for product/vendor search**
8. **Added rack filter dropdown**
9. **Added calculateTotals() function for computed values**
10. **Added live calculation preview in create/edit form**
11. **Updated table to show total purchase and expected total sell prices**
12. **Enhanced view modal with pricing breakdown and totals section**

### Pricing and Discount Information

**Unit Prices:**
- Sell Price and Purchase Price are stored as **unit prices**
- The system calculates total values automatically

**Calculated Values:**
- **Total Purchase Price** = Unit Purchase Price × Quantity
- **Expected Total Sell Price** = Unit Sell Price × Quantity
- **Potential Profit** = Expected Total Sell Price - Total Purchase Price

**Customer Discounts:**
- The "Expected Total Sell Price" shown is the maximum (before discount)
- Actual discounts are applied during sales transactions
- Each customer can receive different discount amounts
- The product view includes a note about discounts being applied at sale time

### Example Data

**Rack A-1** (4 products):
- Laptop Dell XPS: 5 units @ ₹75,000 each = ₹375,000 total sell price
- Mouse Logitech: 50 units @ ₹800 each = ₹40,000 total sell price
- Keyboard Mechanical: 20 units @ ₹3,500 each = ₹70,000 total sell price

**Rack A-2** (3 products):
- Monitor Samsung: 15 units @ ₹12,000 each = ₹180,000 total sell price
- Webcam Logitech: 30 units @ ₹4,500 each = ₹135,000 total sell price
- Headphones Sony: 40 units @ ₹2,500 each = ₹100,000 total sell price

**Rack B-1** (2 products):
- USB Cable Type-C: 100 units @ ₹200 each = ₹20,000 total sell price
- Power Bank: 60 units @ ₹1,500 each = ₹90,000 total sell price

## Migration Notes

**Important:** The database schema has changed. If you have an existing `retail.db` file, you need to:
1. Backup your existing data
2. Delete the old `retail.db` file
3. Restart the server to create the new schema

The old schema fields (sku, description, category, cost, stock_quantity, reorder_level) have been replaced with the new fields specified in the requirements.

## Testing

The implementation has been tested and verified:
- Database schema created successfully
- Product creation works with all mandatory and optional fields
- API endpoints respond correctly
- Frontend displays products with INR currency
- **Search functionality works for product names and vendors**
- **Rack filtering works correctly (tested with A-1, A-2, B-1)**
- **Total calculations display correctly in table and modals**
- **Live calculation preview works in create/edit form**
- **10 test products created across 3 different racks**

## Usage Instructions

1. **Adding Products**: Click "+ Add Product" button, fill in all mandatory fields
2. **Searching**: Type in search bar to find products by name or vendor
3. **Filtering by Rack**: Select a rack from the dropdown to see products in that location
4. **Viewing Details**: Click the eye icon to see full product details with totals
5. **Editing**: Click the pencil icon to edit product information
6. **Deleting**: Click the trash icon to delete a product (with confirmation)

The system now provides comprehensive inventory management with location tracking and automatic calculation of total values for better financial visibility.
