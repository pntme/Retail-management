# Retail Management System - Bill Generation Strategy Analysis

## 1. DATABASE SCHEMA

### Job Card Related Tables

#### `job_cards` (Main Job Card Table)
```sql
CREATE TABLE job_cards (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  job_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'open',
  assignee TEXT,
  notes TEXT,
  labour_charge REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  billed_at DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
)
```
- **Key Fields**: 
  - `labour_charge`: Service charge for labor
  - `discount`: Discount amount applied
  - `billed_at`: Timestamp when bill was generated (currently NOT used in completion)
  - `status`: open, in_progress, closed, rejected

#### `job_card_tasks` (Tasks within a Job Card)
```sql
CREATE TABLE job_card_tasks (
  id TEXT PRIMARY KEY,
  job_card_id TEXT NOT NULL,
  task_description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_card_id) REFERENCES job_cards(id)
)
```

#### `job_card_stock_items` (Stock/Parts Used in Job)
```sql
CREATE TABLE job_card_stock_items (
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
)
```

### Related Tables

#### `customers` (Customer Information)
```sql
CREATE TABLE customers (
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
)
```

#### `products` (Master Data - Parts/Materials)
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sell_price REAL NOT NULL,
  vendor TEXT,
  rack_id TEXT,
  additional_info TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### `inventory_transactions` (Stock Ledger)
```sql
CREATE TABLE inventory_transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,  -- PURCHASE, SALE, ADJUSTMENT_IN, ADJUSTMENT_OUT
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
)
```

#### `sales` & `sale_items` (For Direct Sales)
```sql
CREATE TABLE sales (
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
)

CREATE TABLE sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
```

#### `recurring_bills` (For Periodic Billing)
```sql
CREATE TABLE recurring_bills (
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
)
```

---

## 2. API ENDPOINTS FOR JOB CARDS

### Job Card CRUD Operations
**Base URL**: `http://localhost:3001/api`

#### **GET /job-cards**
- Lists all job cards with optional filters
- Query Parameters:
  - `status` (optional): open, closed, rejected
  - `search` (optional): Search by job number, vehicle number, or customer name
- Returns: Array of job cards with customer details
- Authentication: Required (Bearer token)

**Example Response**:
```json
[
  {
    "id": "uuid",
    "job_number": "JC-1731670000000",
    "customer_id": "uuid",
    "customer_name": "John Doe",
    "vehicle_number": "DL-01-AB-1234",
    "status": "open",
    "assignee": "Mechanic Name",
    "labour_charge": 500,
    "discount": 0,
    "created_at": "2025-11-15T10:30:00Z",
    "closed_at": null
  }
]
```

#### **POST /job-cards**
- Create new job card
- Request Body:
  ```json
  {
    "customer_id": "uuid",
    "vehicle_number": "DL-01-AB-1234",
    "tasks": ["Task 1", "Task 2", ...],
    "assignee": "Name (optional)",
    "notes": "Additional notes (optional)"
  }
  ```
- Returns: `{ id, job_number, message }`
- Authentication: Required

#### **GET /job-cards/:id**
- Get single job card with all details
- Returns:
  ```json
  {
    "id": "uuid",
    "job_number": "JC-xxx",
    "customer_id": "uuid",
    "customer_name": "John Doe",
    "vehicle_number": "DL-01-AB-1234",
    "status": "open",
    "assignee": "Name",
    "labour_charge": 500,
    "discount": 0,
    "notes": "...",
    "created_at": "...",
    "closed_at": null,
    "tasks": [
      {
        "id": "uuid",
        "task_description": "Replace oil",
        "status": "pending"
      }
    ],
    "stock_items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Engine Oil",
        "quantity": 2,
        "unit_price": 250,
        "total_price": 500,
        "notes": "Optional notes"
      }
    ]
  }
  ```
- Authentication: Required

#### **PUT /job-cards/:id**
- Update job card details
- Request Body:
  ```json
  {
    "status": "closed",
    "assignee": "New Assignee",
    "labour_charge": 500,
    "discount": 100,
    "notes": "Updated notes",
    "last_service_date": "2025-11-15",
    "next_service_date": "2026-02-15",
    "tasks": ["Task 1", "Task 2"]
  }
  ```
- All fields optional except `tasks` (requires at least one)
- Authentication: Required

#### **POST /job-cards/:id/complete**
- Complete job card and mark as billed
- Request Body:
  ```json
  {
    "labour_charge": 500,
    "discount": 50,
    "last_service_date": "2025-11-15",
    "next_service_date": "2026-02-15"
  }
  ```
- Actions:
  1. Sets status to "closed"
  2. Sets closed_at timestamp
  3. Updates labour_charge and discount
  4. Auto-generates service dates if not provided
  5. Deletes associated call logs
  6. Updates customer's service dates
- Returns: Success message with dates
- **Note**: Does NOT set billed_at field (available but unused)
- Authentication: Required

#### **POST /job-cards/:id/reject**
- Reject/cancel a job card
- Request Body:
  ```json
  {
    "reason": "Optional rejection reason"
  }
  ```
- Sets status to "rejected" and closed_at timestamp
- Authentication: Required

#### **GET /job-cards/:id/bill**
- Get bill data for job card (for printing)
- Returns:
  ```json
  {
    "id": "uuid",
    "job_number": "JC-xxx",
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "customer_email": "john@example.com",
    "customer_address": "...",
    "vehicle_number": "DL-01-AB-1234",
    "status": "open/closed",
    "labour_charge": 500,
    "discount": 50,
    "tasks": [...],
    "stock_items": [...],
    "stock_total": 1500,      // Sum of all stock items total_price
    "subtotal": 2000,         // stock_total + labour_charge
    "grand_total": 1950       // subtotal - discount
  }
  ```
- Authentication: Required

### Stock Item Management

#### **POST /job-cards/:id/stock-items**
- Add stock item (part/material) to job card
- Request Body:
  ```json
  {
    "product_id": "uuid",
    "quantity": 2,
    "unit_price": 250,
    "notes": "Optional notes"
  }
  ```
- Also creates inventory transaction automatically
- Returns: `{ id, message }`
- Authentication: Required

#### **DELETE /job-cards/:jobCardId/stock-items/:stockItemId**
- Remove stock item from job card
- Returns: Success message
- Authentication: Required

### Task Management

#### **PUT /job-cards/:jobCardId/tasks/:taskId**
- Update task status
- Request Body:
  ```json
  {
    "status": "pending/completed"
  }
  ```
- Authentication: Required

### Customer Search

#### **GET /job-cards/search-customer**
- Search customers for job card creation
- Query Parameters:
  - `search`: Search term (min 2 characters)
- Returns: Array of matching customers
- Authentication: Required

---

## 3. BILL DATA STRUCTURE

### Current Bill Calculation Flow
```
Bill Total = (Stock Items Total) + (Labour Charge) - (Discount)

Where:
  Stock Items Total = SUM(quantity × unit_price for each stock_item)
  Labour Charge = User-entered labour charges
  Discount = User-entered discount amount
```

### Bill Display Information
The `/job-cards/:id/bill` endpoint returns a comprehensive bill object:

```javascript
{
  // Identifiers
  id: string (uuid),
  job_number: string (e.g., "JC-1731670000000"),
  
  // Customer Information
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  customer_address: string,
  vehicle_number: string,
  
  // Bill Status
  status: string ("open", "closed", "rejected"),
  created_at: datetime,
  closed_at: datetime,
  
  // Line Items
  stock_items: [
    {
      id: uuid,
      product_id: uuid,
      product_name: string,
      quantity: number,
      unit_price: number,
      total_price: number,
      notes: string
    }
  ],
  stock_total: number,
  
  // Charges
  labour_charge: number (default 0),
  subtotal: number (stock_total + labour_charge),
  
  // Discounts
  discount: number (default 0),
  
  // Final Total
  grand_total: number (subtotal - discount),
  
  // Service Details
  tasks: [
    {
      id: uuid,
      task_description: string,
      status: string
    }
  ],
  
  // Additional Info
  notes: string,
  assignee: string
}
```

---

## 4. SALES/INVOICE FUNCTIONALITY

### Direct Sales (Counter Sales)

#### **POST /api/sales**
- Create a direct sale transaction
- Request Body:
  ```json
  {
    "customer_id": "uuid (optional)",
    "items": [
      {
        "product_id": "uuid",
        "quantity": 2,
        "unit_price": 250
      }
    ],
    "discount": 100,
    "tax": 100,
    "payment_method": "cash/card/check"
  }
  ```
- Automatically creates:
  1. Sales record
  2. Sale_items records
  3. Inventory transactions (SALE type)
- Returns: `{ id, message, total }`
- Authentication: Required

#### **GET /api/sales**
- List all sales (limited to 100 most recent)
- Returns: Array of sales with customer names
- Authentication: Required

#### **GET /api/sales/:id**
- Get detailed sale with line items
- Returns: Sale object with sale_items array and product details
- Authentication: Required

### Services (Recurring Billing)

#### **GET /api/services**
- List all services with customer details
- Returns: Array of services
- Authentication: Required

#### **POST /api/services**
- Create a recurring service
- Request Body:
  ```json
  {
    "customer_id": "uuid",
    "service_name": "Monthly Maintenance",
    "description": "Regular service description",
    "price": 500,
    "billing_cycle": "monthly/quarterly/yearly",
    "start_date": "2025-11-15",
    "end_date": "2026-11-15 (optional)"
  }
  ```
- Returns: `{ id, message }`
- Authentication: Required

#### **PUT /api/services/:id**
- Update service details
- Request Body: Same as POST (all fields optional)
- Returns: Success message
- Authentication: Required

### Recurring Bills Table
```sql
recurring_bills:
  - id, service_id, customer_id, amount
  - due_date, status (pending/paid), paid_date
  - created_at
```

---

## 5. CURRENT BILL GENERATION WORKFLOW

### Frontend Flow (jobcards.html)

1. **View Job Card** (`viewJobCard(jobCardId)`)
   - Fetches job card details via GET `/job-cards/:id`
   - Displays: customer info, tasks, stock items

2. **Complete & Bill Modal** (`completeJobCard()`)
   - Shows form for:
     - Labour charge (required)
     - Discount (optional)
     - Last service date (auto-filled with today)
     - Next service date (auto-filled with today + 3 months)

3. **Submit Bill** (`submitCompleteAndBill()`)
   - POST to `/job-cards/:id/complete`
   - Sends: labour_charge, discount, dates
   - Job card status changes to "closed"

4. **Print Bill** (`printBill()`)
   - Fetches bill data via GET `/job-cards/:id/bill`
   - Generates HTML bill with:
     - Service bill header
     - Customer & vehicle details
     - Services performed (tasks)
     - Parts & materials table (stock items)
     - Billing summary:
       ```
       Parts Total:    ₹xxxx
       Subtotal:       ₹xxxx
       Labour Charge:  ₹xxxx
       Discount:       -₹xxxx
       GRAND TOTAL:    ₹xxxx
       ```
   - Opens in new window for printing

### Backend Flow (server.js)

#### GET /api/job-cards/:id/bill (Line 1280-1338)
1. Fetches job card and customer details
2. Gets all tasks for the job card
3. Gets all stock items with product names
4. Calculates:
   - `stock_total` = SUM(stock_item.total_price)
   - `labour_charge` = jc.labour_charge || 0
   - `subtotal` = stock_total + labour_charge
   - `discount` = jc.discount || 0
   - `grand_total` = subtotal - discount
5. Returns complete bill object

#### POST /api/job-cards/:id/complete (Line 1341-1414)
1. Gets customer_id from job card
2. Updates job_cards:
   - Sets status = "closed"
   - Sets closed_at = CURRENT_TIMESTAMP
   - Sets labour_charge = provided value
   - Sets discount = provided value
3. Deletes call logs for customer (auto-cleanup)
4. Updates customer service dates:
   - last_service_date = provided or today
   - next_service_date = provided or (today + 3 months)
   - Avoids Saturday (adds 1 day if Saturday)
5. Returns success with populated dates

---

## 6. KEY FEATURES & CONSIDERATIONS

### Bill Composition
- **Parts/Materials**: Stock items added to job card
- **Labour**: User-entered labour charge
- **Discount**: User-entered discount (flat amount, not percentage)
- **Tax**: Not currently used in job card bills (only in direct sales)

### Data Relationships
```
Customer
  ├── Job Cards
  │   ├── Tasks
  │   ├── Stock Items (references Products)
  │   └── Inventory Transactions (auto-created)
  ├── Services (Recurring)
  │   └── Recurring Bills
  └── Call Logs
```

### Automatic Actions
1. When stock item added to job card:
   - Creates inventory transaction (SALE type)
   - Decreases stock count

2. When job card completed:
   - Deletes associated call logs
   - Updates customer service dates
   - Sets closed timestamp

3. Service dates auto-population:
   - Last service: Today (if not provided)
   - Next service: Today + 3 months (if not provided)
   - Saturday correction: +1 day if falls on Saturday

### Bill Status Tracking
- `billed_at` field exists in database but is **NOT used** currently
- Status alone tracks job card state (open → closed)
- Call logs auto-cleanup when job completed

### Currency & Formatting
- Currency: Indian Rupees (₹)
- Number format: .toFixed(2) for prices
- Database stores as REAL numbers

---

## 7. MISSING FEATURES FOR FULL BILL MANAGEMENT

1. **Bill History/Archive**: No separate bills table - bills are generated on-demand from job cards
2. **Bill Number Generation**: Uses job number, no separate bill invoice numbering
3. **PDF Generation**: Currently browser print-to-PDF only
4. **Email Invoices**: No email delivery functionality
5. **Payment Tracking**: No payment records table
6. **Taxes/GST**: Not integrated in job card bills (only in direct sales)
7. **Bill Templates**: Hard-coded HTML template only
8. **Audit Trail**: No billed_at tracking in use
9. **Multiple Bill Generation**: Cannot generate multiple bills per job card
10. **Bill Amendments**: No bill modification/reversal system

