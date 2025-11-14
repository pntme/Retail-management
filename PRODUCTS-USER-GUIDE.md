# Products Module - Quick Reference Guide

## Overview
The Products module manages inventory with unit pricing, automatic total calculations, search functionality, and rack-based filtering.

## Key Features

### 1. Unit Price Based System
- **Unit Sell Price**: Price per single item (₹)
- **Unit Purchase Price**: Cost per single item (₹)
- **Automatic Calculations**: System calculates totals automatically

### 2. Calculated Fields (Read-Only)
```
Total Purchase Price = Unit Purchase Price × Quantity
Expected Total Sell Price = Unit Sell Price × Quantity
Potential Profit = Expected Total Sell - Total Purchase
```

### 3. Search & Filter
- **Search Bar**: Search by product name or vendor
- **Rack Filter**: Filter products by location (A-1, A-2, B-1, etc.)
- **Combined**: Use both filters together
- **Clear Filters**: Reset all filters at once

### 4. Mandatory Fields
✅ Product Name
✅ Unit Sell Price (₹)
✅ Quantity
✅ Unit Purchase Price (₹)

### 5. Optional Fields
⭕ Vendor
⭕ Rack ID
⭕ Additional Info

## User Workflows

### Adding a New Product
1. Click "+ Add Product" button
2. Enter product name (required)
3. Enter unit sell price (required)
4. Enter quantity (required)
5. Enter unit purchase price (required)
6. Optionally add vendor, rack ID, additional info
7. Review calculated totals in the preview section
8. Click "Create"

### Searching Products
1. Type in the search bar to find by name or vendor
2. Results filter automatically as you type

### Filtering by Rack
1. Select a rack from the dropdown (e.g., A-1)
2. Only products in that rack are shown
3. Useful for physical inventory checks

### Viewing Product Details
1. Click the eye icon (👁️) on any product
2. View complete details including:
   - Unit prices
   - Quantity
   - Calculated totals (purchase, sell, profit)
   - Vendor and rack information
   - Additional notes

### Editing a Product
1. Click the pencil icon (✏️)
2. Modify any fields
3. See live calculation preview as you change values
4. Click "Update"

### Deleting a Product
1. Click the trash icon (🗑️)
2. Confirm deletion

## Table Columns Explained

| Column | Description |
|--------|-------------|
| Actions | View, Edit, Delete buttons |
| Product Name | Name of the product |
| Unit Sell Price (₹) | Price per unit for selling |
| Quantity | Number of units in stock |
| Unit Purchase Price (₹) | Cost per unit |
| **Total Purchase (₹)** | **Calculated**: Purchase price × Quantity (Orange) |
| **Expected Total Sell (₹)** | **Calculated**: Sell price × Quantity (Green) |
| Vendor | Supplier name |
| Rack ID | Storage location |

## Customer Discounts

⚠️ **Important**: The "Expected Total Sell Price" is the maximum price before any discounts.

- Individual customers may receive different discount amounts
- Discounts are applied during the sales transaction
- The product module shows potential profit before discounts
- Actual profit is calculated after sale with customer-specific discount

## Examples

### Example 1: Laptop in Rack A-1
```
Product: Laptop Dell XPS
Unit Sell Price: ₹75,000
Quantity: 5
Unit Purchase Price: ₹65,000
Rack: A-1

Calculations:
Total Purchase: ₹65,000 × 5 = ₹325,000
Expected Total Sell: ₹75,000 × 5 = ₹375,000
Potential Profit: ₹375,000 - ₹325,000 = ₹50,000
```

### Example 2: Mouse in Rack A-1
```
Product: Mouse Logitech
Unit Sell Price: ₹800
Quantity: 50
Unit Purchase Price: ₹500
Rack: A-1

Calculations:
Total Purchase: ₹500 × 50 = ₹25,000
Expected Total Sell: ₹800 × 50 = ₹40,000
Potential Profit: ₹40,000 - ₹25,000 = ₹15,000
```

## Rack Management

### Why Use Racks?
- Organize products by physical location
- Quick inventory checks by location
- Easy to find products in warehouse

### Rack Naming Convention
Use format: `LETTER-NUMBER`
- A-1, A-2, A-3 (First aisle)
- B-1, B-2, B-3 (Second aisle)
- C-1, C-2, C-3 (Third aisle)

### Current Test Data
- **Rack A-1**: 4 products (175 units) - Computer peripherals
- **Rack A-2**: 4 products (1085 units) - Monitors and audio
- **Rack B-1**: 2 products (160 units) - Accessories

## Tips

1. **Use Descriptive Names**: Make product names clear and searchable
2. **Keep Racks Organized**: Use consistent rack naming
3. **Regular Updates**: Update quantities after receiving stock
4. **Vendor Tracking**: Add vendor names for reordering
5. **Additional Info**: Use for warranty, expiry, or special notes
6. **Profit Monitoring**: Review potential profits regularly
7. **Filter by Location**: Use rack filter for physical inventory counts

## Access
- **URL**: http://localhost:3001
- **Login**: admin / admin123
- **Navigate**: Click "Products" in the sidebar

## Support
Refer to PRODUCT-SCHEMA-UPDATE.md for detailed technical information.
