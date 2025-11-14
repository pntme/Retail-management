# Inventory Transaction System & Document Management

## 🎯 Overview

This system implements a comprehensive **transaction-based inventory management** with **document storage** capabilities. It solves the critical problem of tracking multiple purchases at different prices and maintains a complete audit trail.

## 🚨 Problem Solved

### Previous Issue:
```
Day 1: Buy 10 Mouse @ ₹100 = ₹1,000
Day 5: Buy 5 Mouse @ ₹120 = ₹600

❌ Old System: Updating product overwrites cost history
✅ New System: Creates separate transaction entries
```

## 📊 Database Schema

### 1. Products Table (Master Data)
```sql
- id: Unique identifier
- name: Product name
- sell_price: Current selling price (₹)
- vendor: Default/primary vendor
- rack_id: Storage location
- additional_info: Notes
- created_at, updated_at: Timestamps
```
**Note:** No quantity or purchase_price in this table anymore!

### 2. Inventory Transactions Table (Movement Log)
```sql
- id: Transaction ID
- product_id: Link to product
- transaction_type: PURCHASE, SALE, ADJUSTMENT_IN, ADJUSTMENT_OUT
- quantity: Number of units (+/-)
- unit_cost: Cost per unit (for purchases)
- unit_price: Price per unit (for sales)
- total_amount: Calculated total
- vendor: Vendor for this transaction
- reference_no: Invoice/PO number
- notes: Additional information
- transaction_date: When it happened
- created_by: User who created it
- document_id: Linked document (invoice/bill)
```

### 3. Documents Table (File Storage)
```sql
- id: Document ID
- file_name: Original filename
- file_path: Server storage path
- file_size: Size in bytes
- mime_type: File type (PDF, image, etc.)
- document_type: INVOICE, RECEIPT, BILL, OTHER
- related_entity_type: PRODUCT, TRANSACTION, CUSTOMER, etc.
- related_entity_id: ID of related entity
- uploaded_by: User who uploaded
- upload_date: When uploaded
- notes: Description
```

## 🔄 How It Works

### Purchase Flow (Multiple Prices)

**Scenario: Buying the same product at different prices**

```javascript
// Purchase 1: Day 1
POST /api/inventory-transactions
{
  product_id: "mouse-001",
  transaction_type: "PURCHASE",
  quantity: 10,
  unit_cost: 100,
  vendor: "Logitech",
  reference_no: "INV-001"
}

// Purchase 2: Day 5  
POST /api/inventory-transactions
{
  product_id: "mouse-001",
  transaction_type: "PURCHASE",
  quantity: 5,
  unit_cost: 120,
  vendor: "Dell",
  reference_no: "INV-002"
}

// System Automatically Calculates:
Total Quantity: 10 + 5 = 15 units
Total Cost: (10 × ₹100) + (5 × ₹120) = ₹1,600
Weighted Average Cost: ₹1,600 / 15 = ₹106.67 per unit
```

### Sale Flow (Stock Reduction)

```javascript
// When selling products
POST /api/sales
{
  items: [
    { product_id: "mouse-001", quantity: 3, unit_price: 150 }
  ]
}

// System automatically:
1. Creates sale record
2. Creates SALE inventory transaction (negative quantity)
3. Updates calculated stock: 15 - 3 = 12 units
```

### Stock Calculation Formula

```sql
Current Stock = 
  SUM(PURCHASE + ADJUSTMENT_IN) - 
  SUM(SALE + ADJUSTMENT_OUT)

Weighted Average Cost =
  SUM(PURCHASE quantity × unit_cost) / 
  SUM(PURCHASE quantity)
```

## 📄 Document Management

### Uploading Documents

```javascript
// Upload invoice for a purchase
POST /api/documents/upload
Content-Type: multipart/form-data

{
  file: <file>,
  document_type: "INVOICE",
  related_entity_type: "TRANSACTION",
  related_entity_id: "trans-123",
  notes: "Purchase invoice from Logitech"
}
```

### Linking Documents to Transactions

```javascript
// Create purchase with document
1. Upload document first → get document_id
2. Create transaction with document_id

POST /api/inventory-transactions
{
  product_id: "mouse-001",
  transaction_type: "PURCHASE",
  quantity: 10,
  unit_cost: 100,
  document_id: "doc-456"  // Link to uploaded invoice
}
```

### Retrieving Documents

```javascript
// Get all documents for a transaction
GET /api/documents/TRANSACTION/trans-123

// Download a document
GET /api/documents/download/doc-456
```

## 🎮 Transaction Types

### 1. PURCHASE
- **Purpose**: Adding new stock from vendors
- **Effect**: Increases quantity, records cost
- **Fields**: quantity, unit_cost, vendor, reference_no

### 2. SALE
- **Purpose**: Selling products to customers
- **Effect**: Decreases quantity
- **Fields**: quantity, unit_price, reference_no (sale_id)
- **Auto-created**: When making a sale

### 3. ADJUSTMENT_IN
- **Purpose**: Manual stock increase
- **Use Cases**: Found missing stock, returned from customer, error correction
- **Effect**: Increases quantity

### 4. ADJUSTMENT_OUT
- **Purpose**: Manual stock decrease
- **Use Cases**: Damaged goods, theft, expired items, error correction
- **Effect**: Decreases quantity

## 📈 API Endpoints

### Products
```
GET    /api/products              - List all with calculated stock
GET    /api/products/:id          - Get single product with stock
POST   /api/products              - Create product (no quantity/cost)
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
```

### Inventory Transactions
```
GET    /api/inventory-transactions                  - Recent transactions
GET    /api/inventory-transactions/product/:id      - Product history
POST   /api/inventory-transactions                  - Create transaction
```

### Documents
```
POST   /api/documents/upload                        - Upload file
GET    /api/documents/:entityType/:entityId         - List documents
GET    /api/documents/download/:id                  - Download file
DELETE /api/documents/:id                           - Delete document
```

## 💡 Real-World Examples

### Example 1: Multiple Vendor Purchases

```
Laptop Dell XPS:

Transaction 1 (Jan 1):
- Vendor: Dell Direct
- Quantity: 5
- Unit Cost: ₹65,000
- Total: ₹3,25,000
- Document: invoice-dell-001.pdf

Transaction 2 (Jan 15):
- Vendor: Amazon
- Quantity: 3
- Unit Cost: ₹62,000
- Total: ₹1,86,000
- Document: invoice-amazon-002.pdf

Result:
- Total Stock: 8 laptops
- Total Investment: ₹5,11,000
- Average Cost: ₹63,875 per laptop
- Can see both invoices attached
```

### Example 2: Price Fluctuation Over Time

```
USB Cable Type-C:

Month 1: Buy 100 @ ₹120
Month 2: Buy 100 @ ₹130 (price increased)
Month 3: Buy 100 @ ₹115 (got discount)

System tracks:
- 3 separate purchase transactions
- Total: 300 units
- Average cost: (100×120 + 100×130 + 100×115) / 300 = ₹121.67
- All 3 invoices stored
- Can see price trend over time
```

### Example 3: Stock Adjustment

```
Physical Count Found:
- System shows: 50 units
- Actual count: 47 units
- Difference: 3 units missing

Create Adjustment:
POST /api/inventory-transactions
{
  product_id: "prod-123",
  transaction_type: "ADJUSTMENT_OUT",
  quantity: 3,
  notes: "Stock reconciliation - 3 units damaged in storage"
}
```

## 🔍 Transaction History View

For each product, you can see complete history:

```
Mouse Logitech - Transaction History:

2024-01-15 | PURCHASE    | +50 | ₹500  | Logitech  | INV-123 | [invoice.pdf]
2024-01-20 | SALE        | -5  | ₹800  | Customer  | SALE-45 |
2024-01-22 | PURCHASE    | +30 | ₹520  | Dell      | INV-124 | [invoice.pdf]
2024-01-25 | SALE        | -10 | ₹800  | Customer  | SALE-46 |
2024-01-28 | ADJUSTMENT  | -2  | -     | -         | Damaged |

Current Stock: 50 + 30 - 5 - 10 - 2 = 63 units
Average Cost: [(50×500) + (30×520)] / 80 = ₹508.75
```

## 📦 Document Types

Supported document types:
- **INVOICE**: Purchase invoices from vendors
- **RECEIPT**: Payment receipts
- **BILL**: Bill of materials
- **DELIVERY_NOTE**: Delivery challan
- **CREDIT_NOTE**: Credit notes for returns
- **OTHER**: Any other document

Supported file formats:
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)
- Excel (.xlsx, .xls)
- Word (.docx, .doc)
- Max size: 10MB

## 🎯 Benefits

### 1. Accurate Cost Tracking
- Know exact cost basis for each product
- Calculate true profit margins
- Weighted average costing

### 2. Complete Audit Trail
- See every stock movement
- Who, what, when, why
- Link to supporting documents

### 3. Document Management
- Store all invoices digitally
- Quick access during audits
- Reduce paper storage

### 4. Price Analysis
- Track vendor price trends
- Identify price increases
- Make better purchasing decisions

### 5. Stock Reconciliation
- Easy to reconcile physical vs system stock
- Track adjustments with reasons
- Prevent inventory shrinkage

### 6. Multi-vendor Support
- Buy from different vendors
- Compare vendor prices
- Track vendor performance

### 7. Financial Accuracy
- Accurate inventory valuation
- Proper COGS calculation
- Better financial reporting

## 🔒 Data Integrity

### Immutable Transactions
- Transactions are never edited
- Only created or deleted (with reason)
- Complete history preserved

### Calculated Fields
- Stock quantity is always calculated
- Cannot be manually edited
- Always accurate and consistent

### Document Links
- Documents linked to transactions
- Cannot orphan documents
- Easy traceability

## 🚀 Migration from Old System

If you have existing products with quantity and purchase_price:

```javascript
// For each existing product:
1. Create product without quantity/price
2. Create initial PURCHASE transaction with existing values
3. Mark as "INITIAL_STOCK" in notes

POST /api/products
{ name, sell_price, vendor, rack_id }

POST /api/inventory-transactions
{
  product_id: <new_id>,
  transaction_type: "PURCHASE",
  quantity: <old_quantity>,
  unit_cost: <old_purchase_price>,
  notes: "Initial stock from migration",
  vendor: <old_vendor>
}
```

## 📊 Reporting Capabilities

With transaction data, you can generate:

1. **Purchase History Report**: All purchases by date, vendor, cost
2. **Sales Analysis**: Revenue, margins, best sellers
3. **Stock Movement Report**: All transactions for a period
4. **Vendor Analysis**: Compare vendor prices, performance
5. **Inventory Valuation**: Current stock value at cost
6. **Profit Analysis**: Actual profit per product
7. **Stock Aging**: Identify slow-moving inventory
8. **Price Trend**: Track cost price changes over time

## 🎓 Best Practices

### 1. Always Attach Documents
- Upload invoice when receiving stock
- Keep digital copies of all documents
- Use clear naming conventions

### 2. Use Reference Numbers
- Enter PO numbers, invoice numbers
- Makes tracking easier
- Helps in reconciliation

### 3. Add Notes
- Explain adjustments
- Record reasons for stock changes
- Document any issues

### 4. Regular Reconciliation
- Do physical stock counts
- Compare with system
- Record adjustments properly

### 5. Vendor Management
- Record correct vendor names
- Track vendor-wise purchases
- Compare prices before buying

## 🔧 Next Steps

To use this system:

1. **Create Products** (without quantity)
2. **Record Purchases** (add stock via transactions)
3. **Upload Invoices** (attach documents)
4. **Make Sales** (auto-creates transactions)
5. **Adjust Stock** (when needed with reasons)
6. **Review History** (analyze transactions)

The system is now ready for real-world inventory management with accurate costing and complete traceability!
