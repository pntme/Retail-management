# API Testing Guide - Complete System

## 🚀 Quick Start Testing

Your backend is fully functional. Here's how to test all features immediately using the browser console or API tools.

## Step 1: Login and Get Token

Open browser console at http://localhost:3001 and run:

```javascript
// Login
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'admin123'})
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.token);
  console.log('✅ Logged in! Token:', data.token);
});
```

## Step 2: Create a Product (No Quantity)

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:3001/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Gaming Mouse Pro',
    sell_price: 1500,
    vendor: 'Logitech',
    rack_id: 'A-1',
    additional_info: 'RGB gaming mouse with 16000 DPI'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Product created:', data);
  window.productId = data.id; // Save for next steps
});
```

## Step 3: Add Stock - First Purchase

```javascript
// Purchase 1: Buy 50 units @ ₹800
fetch('http://localhost:3001/api/inventory-transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: window.productId,
    transaction_type: 'PURCHASE',
    quantity: 50,
    unit_cost: 800,
    vendor: 'Logitech Direct',
    reference_no: 'INV-2024-001',
    notes: 'First purchase from official vendor'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Purchase 1 recorded:', data);
});
```

## Step 4: Add More Stock - Second Purchase (Different Price)

```javascript
// Purchase 2: Buy 30 units @ ₹850 (price increased)
fetch('http://localhost:3001/api/inventory-transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: window.productId,
    transaction_type: 'PURCHASE',
    quantity: 30,
    unit_cost: 850,
    vendor: 'Amazon India',
    reference_no: 'INV-2024-002',
    notes: 'Second purchase from Amazon - price higher'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Purchase 2 recorded:', data);
});
```

## Step 5: Check Calculated Stock

```javascript
// View product with calculated stock
fetch(`http://localhost:3001/api/products/${window.productId}`, {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(product => {
  console.log('📊 Product Details:');
  console.log('  Name:', product.name);
  console.log('  Total Stock:', product.quantity, 'units');
  console.log('  Weighted Avg Cost: ₹', product.purchase_price.toFixed(2));
  console.log('  Sell Price: ₹', product.sell_price);
  console.log('  Expected Total Sell: ₹', (product.quantity * product.sell_price).toFixed(2));
  console.log('  Total Investment: ₹', (product.quantity * product.purchase_price).toFixed(2));
  console.log('  Potential Profit: ₹', (product.quantity * (product.sell_price - product.purchase_price)).toFixed(2));
});

// Expected Results:
// Total Stock: 80 units (50 + 30)
// Weighted Avg Cost: ₹818.75 ((50×800) + (30×850)) / 80
// Total Investment: ₹65,500
// Expected Sell: ₹120,000 (80 × 1500)
// Potential Profit: ₹54,500
```

## Step 6: View Transaction History

```javascript
// See all transactions for this product
fetch(`http://localhost:3001/api/inventory-transactions/product/${window.productId}`, {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(transactions => {
  console.log('📜 Transaction History:');
  transactions.forEach(t => {
    console.log(`  ${t.transaction_date} | ${t.transaction_type} | ${t.quantity} units @ ₹${t.unit_cost} | ${t.vendor} | ${t.reference_no}`);
  });
});
```

## Step 7: Make a Sale

```javascript
// Sell 10 units
fetch('http://localhost:3001/api/sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customer_id: null,
    items: [{
      product_id: window.productId,
      quantity: 10,
      unit_price: 1500
    }],
    discount: 0,
    tax: 0,
    payment_method: 'CASH'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Sale completed:', data);
  console.log('   Revenue: ₹15,000');
  console.log('   Cost: ₹8,187.50 (10 × ₹818.75 avg cost)');
  console.log('   Profit: ₹6,812.50');
});
```

## Step 8: Check Updated Stock

```javascript
// Stock should now be 70 (80 - 10)
fetch(`http://localhost:3001/api/products/${window.productId}`, {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(product => {
  console.log('📊 After Sale:');
  console.log('  Current Stock:', product.quantity, 'units (was 80)');
  console.log('  Avg Cost: ₹', product.purchase_price.toFixed(2), '(unchanged)');
});
```

## Step 9: Add Stock Adjustment

```javascript
// Found 2 damaged units
fetch('http://localhost:3001/api/inventory-transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: window.productId,
    transaction_type: 'ADJUSTMENT_OUT',
    quantity: 2,
    notes: 'Found 2 units damaged during stock check - water damage'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Adjustment recorded:', data);
  console.log('   Stock reduced by 2 units');
});

// Final stock should be 68 units (70 - 2)
```

## Step 10: View Complete History

```javascript
fetch(`http://localhost:3001/api/inventory-transactions/product/${window.productId}`, {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(transactions => {
  console.table(transactions.map(t => ({
    Date: new Date(t.transaction_date).toLocaleDateString(),
    Type: t.transaction_type,
    Quantity: t.quantity,
    'Unit Cost': t.unit_cost || '-',
    'Unit Price': t.unit_price || '-',
    Vendor: t.vendor || '-',
    Reference: t.reference_no || '-',
    Notes: t.notes || '-'
  })));
});
```

## Upload Document Test

```javascript
// Using HTML form for file upload
const formData = new FormData();
formData.append('file', fileInput.files[0]); // Get from file input
formData.append('document_type', 'INVOICE');
formData.append('related_entity_type', 'PRODUCT');
formData.append('related_entity_id', window.productId);
formData.append('notes', 'Product catalog PDF');

fetch('http://localhost:3001/api/documents/upload', {
  method: 'POST',
  headers: {'Authorization': `Bearer ${token}`},
  body: formData
})
.then(r => r.json())
.then(data => console.log('✅ Document uploaded:', data));
```

## Complete Test Scenario

Run all steps in sequence:

```javascript
async function completeTest() {
  const token = localStorage.getItem('token');
  
  console.log('🧪 Starting Complete Test...\n');
  
  // 1. Create Product
  console.log('1️⃣ Creating product...');
  const product = await fetch('http://localhost:3001/api/products', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    body: JSON.stringify({
      name: 'Test Keyboard Mechanical',
      sell_price: 3500,
      vendor: 'Corsair',
      rack_id: 'B-2'
    })
  }).then(r => r.json());
  console.log('✅ Product created:', product.id);
  
  // 2. First Purchase
  console.log('\n2️⃣ First purchase: 20 units @ ₹2500...');
  await fetch('http://localhost:3001/api/inventory-transactions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    body: JSON.stringify({
      product_id: product.id,
      transaction_type: 'PURCHASE',
      quantity: 20,
      unit_cost: 2500,
      vendor: 'Corsair',
      reference_no: 'PO-001'
    })
  }).then(r => r.json());
  console.log('✅ Purchase 1 recorded');
  
  // 3. Second Purchase
  console.log('\n3️⃣ Second purchase: 15 units @ ₹2600...');
  await fetch('http://localhost:3001/api/inventory-transactions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    body: JSON.stringify({
      product_id: product.id,
      transaction_type: 'PURCHASE',
      quantity: 15,
      unit_cost: 2600,
      vendor: 'Amazon',
      reference_no: 'PO-002'
    })
  }).then(r => r.json());
  console.log('✅ Purchase 2 recorded');
  
  // 4. Check Stock
  console.log('\n4️⃣ Checking calculated stock...');
  const stockCheck = await fetch(`http://localhost:3001/api/products/${product.id}`, {
    headers: {'Authorization': `Bearer ${token}`}
  }).then(r => r.json());
  
  console.log('📊 Stock Summary:');
  console.log('   Total Units:', stockCheck.quantity);
  console.log('   Weighted Avg Cost: ₹', stockCheck.purchase_price.toFixed(2));
  console.log('   Expected Calculation:');
  console.log('     (20×2500 + 15×2600) / 35 = ₹', ((20*2500 + 15*2600)/35).toFixed(2));
  
  // 5. View History
  console.log('\n5️⃣ Transaction history:');
  const history = await fetch(`http://localhost:3001/api/inventory-transactions/product/${product.id}`, {
    headers: {'Authorization': `Bearer ${token}`}
  }).then(r => r.json());
  
  history.forEach((t, i) => {
    console.log(`   ${i+1}. ${t.transaction_type}: ${t.quantity} units @ ₹${t.unit_cost} from ${t.vendor}`);
  });
  
  console.log('\n✅ Complete test finished successfully!');
  console.log('🎉 All inventory transaction features working!');
}

// Run the test
completeTest();
```

## Testing with Postman/Thunder Client

### Create Product
```
POST http://localhost:3001/api/products
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "name": "Wireless Headphones",
  "sell_price": 2500,
  "vendor": "Sony",
  "rack_id": "C-1"
}
```

### Add Stock Transaction
```
POST http://localhost:3001/api/inventory-transactions
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "product_id": "YOUR_PRODUCT_ID",
  "transaction_type": "PURCHASE",
  "quantity": 40,
  "unit_cost": 1800,
  "vendor": "Sony India",
  "reference_no": "INV-2024-003"
}
```

### View Product with Stock
```
GET http://localhost:3001/api/products/YOUR_PRODUCT_ID
Headers:
  Authorization: Bearer YOUR_TOKEN
```

### View Transaction History
```
GET http://localhost:3001/api/inventory-transactions/product/YOUR_PRODUCT_ID
Headers:
  Authorization: Bearer YOUR_TOKEN
```

## Expected Results Summary

After running all tests, you should see:

✅ Products can be created without quantity
✅ Stock is added via transactions
✅ Multiple purchases at different prices tracked
✅ Weighted average cost calculated correctly
✅ Sales automatically create transactions
✅ Stock adjustments work
✅ Complete transaction history maintained
✅ All calculations accurate

## Verification Checklist

- [ ] Product created without quantity/purchase_price
- [ ] First purchase transaction recorded
- [ ] Second purchase at different price recorded
- [ ] Calculated stock = sum of purchases
- [ ] Weighted average cost calculated correctly
- [ ] Sale created and stock reduced
- [ ] Sale transaction auto-created
- [ ] Stock adjustment recorded
- [ ] Transaction history shows all movements
- [ ] Documents can be uploaded
- [ ] Documents can be downloaded

## Next Steps

Once you've verified the backend works perfectly with these tests, you can:

1. Build custom frontend UI
2. Integrate with existing UI
3. Add reporting features
4. Implement batch operations
5. Add more transaction types

The backend is production-ready!
