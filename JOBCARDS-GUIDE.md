# Job Cards Service Management - Complete Guide

## Overview
The Job Cards system allows you to manage vehicle servicing with complete tracking of customer requests, tasks, stock usage, and billing. This system is perfect for automotive service centers, workshops, and repair shops.

## Key Features

### 1. **Customer Search & Selection**
   - Search customers by name, phone number, email, or vehicle number
   - Quick access to customer vehicle information
   - Auto-populate vehicle details from customer records

### 2. **Job Card Creation**
   - Create job cards with multiple service tasks
   - Assign technicians/staff to specific jobs
   - Track vehicle information
   - Add custom notes and instructions

### 3. **Task Management**
   - Add multiple service tasks per job card
   - Tasks provided by customer (e.g., "Change engine oil", "Fix brake system")
   - Track task completion status
   - View all pending tasks at a glance

### 4. **Stock/Parts Tracking**
   - Add parts and products used during service
   - Track quantity and pricing for each item
   - Automatic inventory deduction
   - View complete parts list with totals

### 5. **Job Card Lifecycle**
   - **Open**: Job card is active, work in progress
   - **Closed**: Job completed and billed
   - **Rejected**: Job cancelled with reason

### 6. **Service History**
   - Update last service date when job completes
   - Set next service due date
   - Track complete service history per customer

## How to Use

### Creating a New Job Card

1. **Navigate to Job Cards**
   - Click on "Job Cards" from the main menu
   - Or click "Open Job Cards" from the dashboard banner

2. **Click "Create Job Card"**

3. **Search for Customer**
   - Type customer name, phone, email, or vehicle number
   - Select from search results
   - Vehicle number will auto-populate if available

4. **Enter Job Details**
   - **Vehicle Number**: Required (auto-filled from customer data)
   - **Tasks**: Add all service requests
     - At least one task required
     - Click "+ Add Task" for multiple tasks
     - Examples: "Oil change", "Tire rotation", "Brake inspection"
   - **Assignee**: Optional (technician/staff name)
   - **Notes**: Optional (additional instructions)

5. **Submit**
   - Click "Create Job Card"
   - Job card will be created with unique job number (e.g., JC-1234567890)

### Working on a Job Card

1. **View Job Card Details**
   - Click on any job card from the list
   - View all information:
     - Customer details
     - Vehicle information
     - All tasks
     - Stock items used
     - Current status

2. **Add Stock/Parts**
   - Click "+ Add Stock Item" button
   - Select product from dropdown
   - Enter quantity used
   - Unit price auto-fills (can be modified)
   - Add notes if needed
   - Stock automatically deducted from inventory

3. **Track Progress**
   - View all tasks assigned
   - Check task status
   - Monitor parts used and costs

### Completing a Job Card

1. **When Work is Complete**
   - Click "Complete & Bill" button
   - System prompts for service dates:
     - **Last Service Date**: Date of current service (optional)
     - **Next Service Date**: When customer should return (optional)
   
2. **System Actions**
   - Job card status changes to "Closed"
   - Billing timestamp recorded
   - Customer service dates updated
   - Job card becomes read-only

### Rejecting a Job Card

1. **If Job Cannot Be Completed**
   - Click "Reject Job Card" button
   - Enter rejection reason
   - Confirm rejection

2. **System Actions**
   - Job card status changes to "Rejected"
   - Reason saved in notes
   - Job card becomes read-only

## Search & Filters

### Search Bar
- Search by:
  - Job number (e.g., JC-1234567890)
  - Vehicle number
  - Customer name

### Status Filter
- **All Status**: View all job cards
- **Open**: Active jobs in progress
- **Closed**: Completed and billed jobs
- **Rejected**: Cancelled jobs

## Job Card Information

### Job Card displays:
- **Job Number**: Unique identifier
- **Status**: Open/Closed/Rejected
- **Customer Name**: Who owns the vehicle
- **Vehicle Number**: Registration number
- **Assignee**: Technician/staff assigned
- **Created Date**: When job card was opened
- **Closed Date**: When job was completed (if applicable)

### Task Information:
- Task description
- Task status (Pending/Completed)
- Order of tasks

### Stock Items Used:
- Product name
- Quantity used
- Unit price
- Total cost per item
- Rack location
- **Grand Total**: Sum of all parts

## Integration with Other Modules

### 1. **Customers Module**
   - Job cards linked to customer records
   - Service history tracked per customer
   - Vehicle information synchronized

### 2. **Stock Management**
   - Parts automatically deducted when added to job card
   - Inventory transactions created
   - Tracks which products used in which job

### 3. **Billing (Future)**
   - Job cards can be converted to invoices
   - All parts and labor costs included
   - Customer billing history

## Best Practices

### 1. **Creating Job Cards**
   - Always enter complete vehicle number
   - Add all known tasks upfront
   - Assign technician immediately if known
   - Use notes field for special instructions

### 2. **Adding Stock Items**
   - Add parts as soon as they're used
   - Verify quantities before adding
   - Check unit prices match current rates
   - Add notes for special circumstances

### 3. **Completing Jobs**
   - Review all tasks are complete
   - Verify all parts are added
   - Always update service dates
   - Double-check before completing

### 4. **Service Dates**
   - Use last service date for record keeping
   - Set next service based on:
     - Vehicle type
     - Service performed
     - Manufacturer recommendations
     - Customer usage patterns

## Database Schema

### Job Cards Table
```
- id: Unique identifier
- customer_id: Link to customer
- vehicle_number: Vehicle registration
- job_number: Human-readable job ID
- status: open/closed/rejected
- assignee: Technician name
- notes: Additional information
- created_by: User who created job
- created_at: Creation timestamp
- closed_at: Completion timestamp
- billed_at: Billing timestamp
```

### Job Card Tasks Table
```
- id: Unique identifier
- job_card_id: Parent job card
- task_description: What needs to be done
- status: pending/completed
- created_at: When task was added
```

### Job Card Stock Items Table
```
- id: Unique identifier
- job_card_id: Parent job card
- product_id: Product used
- quantity: Amount used
- unit_price: Price per unit
- total_price: Calculated total
- notes: Additional info
- created_at: When added
```

## API Endpoints

### Search Customers
```
GET /api/job-cards/search-customer?search={term}
```

### Create Job Card
```
POST /api/job-cards
Body: {
  customer_id, 
  vehicle_number, 
  tasks[], 
  assignee, 
  notes
}
```

### Get All Job Cards
```
GET /api/job-cards?status={status}&search={term}
```

### Get Job Card Details
```
GET /api/job-cards/:id
```

### Update Job Card
```
PUT /api/job-cards/:id
Body: { assignee, notes, status }
```

### Add Stock Item
```
POST /api/job-cards/:id/stock-items
Body: {
  product_id,
  quantity,
  unit_price,
  notes
}
```

### Complete Job Card
```
POST /api/job-cards/:id/complete
Body: {
  last_service_date,
  next_service_date
}
```

### Reject Job Card
```
POST /api/job-cards/:id/reject
Body: { reason }
```

## Reports & Analytics (Future Enhancements)

Potential features to add:
- Job completion time tracking
- Technician performance metrics
- Popular services/tasks analysis
- Parts usage statistics
- Revenue per job card
- Customer service frequency
- Pending jobs overview
- Monthly service reports

## Troubleshooting

### Issue: Cannot find customer
**Solution**: 
- Verify customer exists in Customers module
- Check spelling of search terms
- Try searching by phone or vehicle number

### Issue: Stock item not available
**Solution**:
- Verify product exists in Stock Management
- Check if product has sufficient quantity
- Add product to inventory first

### Issue: Cannot complete job card
**Solution**:
- Verify job card status is "open"
- Check all required fields are filled
- Ensure you have proper permissions

### Issue: Service dates not updating
**Solution**:
- Dates must be in YYYY-MM-DD format
- Both dates are optional
- Check customer record for updates

## Access Control

Currently all authenticated users can:
- View all job cards
- Create new job cards
- Add stock items
- Complete/reject job cards

Future: Role-based access:
- **Admin**: Full access
- **Manager**: View and manage all jobs
- **Technician**: View assigned jobs, add parts
- **Receptionist**: Create and view jobs

## Tips for Efficiency

1. **Prepare Customer Data**
   - Ensure customers have complete vehicle info
   - Keep phone numbers updated
   - Maintain accurate vehicle numbers

2. **Stock Management**
   - Keep inventory updated
   - Set proper unit prices
   - Organize products by rack/location

3. **Standard Task Lists**
   - Create common service packages
   - Use consistent task descriptions
   - Build service templates

4. **Service Intervals**
   - Set realistic next service dates
   - Consider seasonal factors
   - Track customer service patterns

## Next Steps

After implementing job cards, consider:
1. **Service Packages**: Pre-defined service bundles
2. **Labor Charges**: Track time and labor costs
3. **Appointment Scheduling**: Book service appointments
4. **Customer Notifications**: SMS/email reminders
5. **Mobile App**: Technician mobile interface
6. **Photo Upload**: Document vehicle condition
7. **Digital Signatures**: Customer approval
8. **Invoice Generation**: Automatic billing

## Support

For questions or issues:
- Check this documentation first
- Review API endpoints
- Test with sample data
- Contact system administrator

---

**Version**: 1.0
**Last Updated**: November 14, 2024
**Module**: Job Cards Service Management
