# Quick Reference - Bill Generation System

## File Structure

```
/home/user/Retail-management/
├── server.js (1540 lines)
│   ├── Database initialization (lines 54-292)
│   ├── Job Card routes (lines 1005-1534)
│   │   ├── GET /api/job-cards - List with filters
│   │   ├── POST /api/job-cards - Create new
│   │   ├── GET /api/job-cards/:id - Get details
│   │   ├── PUT /api/job-cards/:id - Update
│   │   ├── POST /api/job-cards/:id/complete - Complete & bill
│   │   ├── GET /api/job-cards/:id/bill - Get bill data
│   │   ├── POST /api/job-cards/:id/stock-items - Add items
│   │   └── DELETE /api/job-cards/:id/stock-items/:id - Remove items
│   ├── Sales routes (lines 819-899)
│   ├── Services routes (lines 771-817)
│   └── Dashboard routes (lines 901-1003)
│
├── public/jobcards.html (1976 lines)
│   ├── UI for job card management
│   ├── Create Job Card modal (line ~573)
│   ├── View Job Card modal (line 627)
│   ├── Add Stock Item modal (line 641)
│   ├── Complete & Bill modal (line 678)
│   ├── Edit Job Card modal (line 713)
│   ├── JavaScript functions
│   │   ├── loadJobCards() - line 850
│   │   ├── createJobCard() - line 991
│   │   ├── viewJobCard() - line 1202
│   │   ├── addStockItem() - line 1284
│   │   ├── completeJobCard() - line 1319
│   │   ├── submitCompleteAndBill() - line 1324
│   │   ├── printJobCard() - line 1368
│   │   └── printBill() - line 1493
│   └── Print templates (inline HTML)
│
└── public/index.html (3991 lines)
    ├── Dashboard
    ├── Customers section
    ├── Products section
    └── Sales section
```

## Database Table Summary

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `job_cards` | Main job card records | id, job_number, customer_id, labour_charge, discount, status |
| `job_card_tasks` | Tasks within job cards | id, job_card_id, task_description, status |
| `job_card_stock_items` | Parts/materials used | id, job_card_id, product_id, quantity, unit_price, total_price |
| `customers` | Customer master | id, name, phone, vehicle_number, last_service_date, next_service_date |
| `products` | Product master | id, name, sell_price, vendor, rack_id |
| `inventory_transactions` | Stock movements | id, product_id, transaction_type, quantity, unit_cost, unit_price |
| `sales` | Direct sales records | id, customer_id, total_amount, discount, tax, payment_method |
| `sale_items` | Items in sales | id, sale_id, product_id, quantity, unit_price |
| `services` | Recurring services | id, customer_id, service_name, price, billing_cycle |
| `recurring_bills` | Recurring billing records | id, service_id, customer_id, amount, due_date, status |

## API Quick Reference

### Authentication
```
Header: Authorization: Bearer <token>
Login: POST /api/auth/login
  Body: { username, password }
  Returns: { token, user }
```

### Job Cards - Core APIs
```
List:      GET /api/job-cards?status=open&search=term
Create:    POST /api/job-cards
           { customer_id, vehicle_number, tasks[], assignee?, notes? }
Get:       GET /api/job-cards/:id
Update:    PUT /api/job-cards/:id
           { status?, assignee?, labour_charge?, discount?, notes?, tasks[] }
Complete:  POST /api/job-cards/:id/complete
           { labour_charge?, discount?, last_service_date?, next_service_date? }
Bill Data: GET /api/job-cards/:id/bill
Reject:    POST /api/job-cards/:id/reject
           { reason? }
```

### Stock Items
```
Add:       POST /api/job-cards/:id/stock-items
           { product_id, quantity, unit_price, notes? }
Delete:    DELETE /api/job-cards/:jobCardId/stock-items/:itemId
```

### Sales (Direct)
```
Create:    POST /api/sales
           { customer_id?, items[{product_id, quantity, unit_price}], discount?, tax?, payment_method }
List:      GET /api/sales
Get:       GET /api/sales/:id
```

### Services (Recurring)
```
List:      GET /api/services
Create:    POST /api/services
           { customer_id, service_name, description, price, billing_cycle, start_date, end_date? }
Update:    PUT /api/services/:id
```

## Bill Calculation

```
BILL TOTAL CALCULATION:

stock_total = SUM(stock_item.total_price for each stock item)
              where total_price = quantity × unit_price

subtotal = stock_total + labour_charge

grand_total = subtotal - discount

Example:
  Parts:
    Item 1: 2 × 250 = 500
    Item 2: 1 × 1000 = 1000
    Stock Total = 1500
  
  Labour Charge = 500
  Subtotal = 1500 + 500 = 2000
  
  Discount = 100
  Grand Total = 2000 - 100 = 1900
```

## Bill Generation Workflow

```
FRONTEND:
┌─────────────────────────────────────────┐
│ View Job Card (GET /job-cards/:id)      │
│ Shows: tasks, stock items, customer     │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ Click "Complete & Bill" button           │
│ Opens modal for labour_charge & discount │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ Submit (POST /job-cards/:id/complete)    │
│ Updates: status=closed, labour, discount │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ Click "Print Bill" (GET /job-cards/:id/bill)
│ Fetches: tasks, stock_items, calculations
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ Display Bill HTML & Open Print Dialog    │
│ Shows formatted invoice with totals      │
└─────────────────────────────────────────┘

BACKEND (Complete):
1. Get customer_id from job_cards
2. Update job_cards: status='closed', closed_at=NOW
3. Set labour_charge, discount
4. DELETE call_logs WHERE customer_id
5. UPDATE customers: last_service_date, next_service_date
6. Return: { message, last_service_date, next_service_date }

BACKEND (Get Bill):
1. SELECT job_card + customer details
2. SELECT job_card_tasks
3. SELECT job_card_stock_items with product names
4. Calculate: stock_total, subtotal, grand_total
5. Return: { ...job_card, tasks, stock_items, calculations }
```

## Key Implementation Details

### Stock Item Auto-Inventory Tracking
When a stock item is added to a job card (POST /job-cards/:id/stock-items):
```javascript
// Creates inventory transaction automatically:
INSERT INTO inventory_transactions (
  id, product_id, 'SALE', quantity, unit_price, total_amount,
  notes='Used in Job Card xxx', reference_no=jobCardId
)
```

### Service Date Auto-Population
When job card is completed:
- If `last_service_date` not provided: Uses today's date
- If `next_service_date` not provided: Uses today + 3 months
- If `next_service_date` falls on Saturday (day 6): Adds 1 day to avoid Saturday

### Call Log Cleanup
When job card is completed:
```sql
DELETE FROM call_logs WHERE customer_id = ?
```
Automatically removes all call logs for the customer.

## Important Notes

1. **Bill Status Field**: The `billed_at` field exists in the job_cards table but is NOT used in the current implementation. Use `status='closed'` and `closed_at` timestamp instead.

2. **No Separate Bill Records**: Bills are NOT stored separately. They're generated on-demand from job card data.

3. **Discount Format**: Discount is stored as a flat amount (₹), not percentage.

4. **No Tax in Job Bills**: GST/tax is only used in direct sales, not job card bills.

5. **Inventory Impact**: Adding stock items to a job card automatically creates SALE transactions that decrease stock quantity.

6. **Currency**: All prices stored as REAL numbers; displayed with ₹ symbol and .toFixed(2) formatting.

7. **Job Number Format**: "JC-" + timestamp (e.g., "JC-1731670000000")

## Related Documentation Files

- `/home/user/Retail-management/BILL-GENERATION-ANALYSIS.md` - Comprehensive analysis
- `/home/user/Retail-management/server.js` - Main API implementation
- `/home/user/Retail-management/public/jobcards.html` - Frontend UI & logic
- `/home/user/Retail-management/public/index.html` - Dashboard & main UI
