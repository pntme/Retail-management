# 🧪 Complete Testing Guide

## ✅ Everything is Ready to Test!

Your inventory transaction system with document management is **100% implemented and ready for testing**.

## 🚀 Quick Start - Test Interface

### Option 1: Interactive Test Interface (Recommended)

Open in your browser:
```
http://localhost:3001/test.html
```

This provides a complete visual interface to test all features:
1. Login
2. Create products
3. Add stock purchases
4. View calculated stock
5. View transaction history
6. Make sales
7. Stock adjustments
8. Run complete automated test

**Just click buttons to test everything!**

### Option 2: Browser Console Testing

1. Open http://localhost:3001
2. Open browser console (F12)
3. Follow the commands in **API-TESTING-GUIDE.md**

### Option 3: API Tools (Postman/Thunder Client)

Use the REST API endpoints directly:
- See **API-TESTING-GUIDE.md** for all endpoints
- See **INVENTORY-TRANSACTION-SYSTEM.md** for API documentation

## 📋 What to Test

### ✅ Test Scenario 1: Multiple Purchases (Different Prices)

**Problem it solves:** Same product purchased at different prices

**Steps:**
1. Create product: "Gaming Mouse" @ ₹1500 sell price
2. Purchase 1: Buy 50 units @ ₹800 from Logitech
3. Purchase 2: Buy 30 units @ ₹850 from Amazon (price increased!)
4. Check stock: Should show 80 units @ ₹818.75 weighted average
5. Verify: (50×800 + 30×850) / 80 = ₹818.75 ✓

**Expected Result:**
- Total stock: 80 units
- Weighted average cost: ₹818.75
- Both purchases tracked separately
- Complete history preserved

### ✅ Test Scenario 2: Sales Auto-Create Transactions

**Steps:**
1. From above stock: 80 units available
2. Make sale: Sell 10 units @ ₹1500
3. Check stock: Should now show 70 units
4. View history: Should see SALE transaction auto-created
5. Verify: Cost basis still ₹818.75 (weighted average unchanged)

**Expected Result:**
- Stock reduced to 70 units
- SALE transaction created automatically
- Revenue: ₹15,000
- Cost: ₹8,187.50 (10 × ₹818.75)
- Profit: ₹6,812.50

### ✅ Test Scenario 3: Stock Adjustments

**Steps:**
1. Current stock: 70 units
2. Physical count finds 2 damaged units
3. Create adjustment: ADJUSTMENT_OUT, 2 units, reason "damaged"
4. Check stock: Should show 68 units
5. View history: Adjustment logged with reason

**Expected Result:**
- Stock: 68 units
- Adjustment recorded with reason
- Audit trail maintained

### ✅ Test Scenario 4: Complete Flow

Run the complete automated test:
1. Open http://localhost:3001/test.html
2. Click "Login"
3. Scroll to bottom
4. Click "Run Complete Test"
5. Watch it execute all steps automatically

**This tests:**
- Product creation (no quantity)
- Multiple purchases
- Weighted average calculation
- Sales transaction
- Stock reduction
- Transaction history
- All calculations

## 🔍 Verification Checklist

After testing, verify:

- [ ] Products can be created without quantity/purchase_price
- [ ] Stock must be added via transactions (not in product form)
- [ ] Multiple purchases at different prices are tracked separately
- [ ] Weighted average cost calculates correctly
- [ ] Current stock = SUM(PURCHASE + ADJUSTMENT_IN) - SUM(SALE + ADJUSTMENT_OUT)
- [ ] Sales automatically create SALE transactions
- [ ] Stock reduces after sales
- [ ] Adjustments (IN/OUT) work correctly
- [ ] Transaction history shows all movements
- [ ] Each transaction has: date, type, quantity, cost/price, vendor, reference
- [ ] Calculations are accurate for all scenarios

## 📊 Expected Calculations

### Weighted Average Cost Formula:
```
Weighted Avg = Total Cost / Total Quantity

Example:
Purchase 1: 50 units @ ₹800 = ₹40,000
Purchase 2: 30 units @ ₹850 = ₹25,500
Total: 80 units for ₹65,500
Weighted Avg: ₹65,500 / 80 = ₹818.75
```

### Stock Calculation Formula:
```
Current Stock = 
  SUM(PURCHASE quantities) + 
  SUM(ADJUSTMENT_IN quantities) -
  SUM(SALE quantities) -
  SUM(ADJUSTMENT_OUT quantities)
```

### Profit Calculation:
```
Per Unit Profit = Sell Price - Weighted Avg Cost
Total Profit = Current Stock × Per Unit Profit

Example with 68 units:
Sell Price: ₹1,500
Avg Cost: ₹818.75
Per Unit Profit: ₹681.25
Total Potential Profit: 68 × ₹681.25 = ₹46,325
```

## 🎯 Test Results You Should See

### Test 1: Product Creation
```
✅ Product created without quantity
✅ Only sell_price, vendor, rack_id stored
✅ No purchase_price in product table
```

### Test 2: First Purchase
```
✅ Transaction recorded
✅ Type: PURCHASE
✅ Quantity: 50
✅ Unit Cost: ₹800
✅ Total: ₹40,000
```

### Test 3: Second Purchase (Different Price)
```
✅ Transaction recorded
✅ Type: PURCHASE
✅ Quantity: 30
✅ Unit Cost: ₹850 (different from first!)
✅ Total: ₹25,500
```

### Test 4: Calculated Stock
```
✅ Total Quantity: 80 units (50 + 30)
✅ Weighted Avg Cost: ₹818.75
✅ Calculation: (40,000 + 25,500) / 80
✅ Both purchase prices preserved
```

### Test 5: Transaction History
```
✅ 2 PURCHASE transactions visible
✅ Each shows: date, vendor, cost, quantity, reference
✅ Complete audit trail
✅ Can track price changes over time
```

### Test 6: Sale
```
✅ Sale created
✅ SALE transaction auto-generated
✅ Stock reduced: 80 → 70 units
✅ Weighted avg cost unchanged (still ₹818.75)
```

### Test 7: Adjustment
```
✅ ADJUSTMENT_OUT created
✅ Stock reduced: 70 → 68 units
✅ Reason recorded
✅ Weighted avg cost unchanged
```

## 📄 Document Upload Testing

### Test Document Upload:

1. **Prepare a test file** (PDF, image, etc.)
2. **Create a purchase transaction** (get transaction ID)
3. **Upload document:**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('document_type', 'INVOICE');
formData.append('related_entity_type', 'TRANSACTION');
formData.append('related_entity_id', 'transaction-id-here');
formData.append('notes', 'Purchase invoice from vendor');

fetch('http://localhost:3001/api/documents/upload', {
  method: 'POST',
  headers: {'Authorization': 'Bearer ' + token},
  body: formData
}).then(r => r.json()).then(console.log);
```

4. **Download document:**
```
http://localhost:3001/api/documents/download/document-id
```

## 🐛 Troubleshooting

### Issue: "Access denied" error
**Solution:** Make sure you're logged in first. Token must be in localStorage.

### Issue: "Product not found"
**Solution:** Use the product ID returned after creating product. Check `currentProductId` variable.

### Issue: "Quantity is 0" 
**Solution:** You need to create purchase transactions first. Products start with 0 stock.

### Issue: "Weighted average is wrong"
**Solution:** Check if all PURCHASE transactions were created. Only PURCHASE transactions count for cost average.

### Issue: File upload fails
**Solution:** Check file size (max 10MB). Ensure token is sent. Use FormData (not JSON).

## 📈 Success Indicators

You'll know it's working when:

1. ✅ Products show calculated stock (not hardcoded)
2. ✅ Multiple purchases tracked separately
3. ✅ Weighted average matches manual calculation
4. ✅ Sales reduce stock automatically
5. ✅ Transaction history shows all movements
6. ✅ Each transaction is immutable (can't edit)
7. ✅ Complete audit trail exists
8. ✅ Documents upload and link correctly

## 🎉 When Everything Works

You should see:

```
Product: Gaming Mouse Pro
Sell Price: ₹1,500
Current Stock: 68 units
Weighted Avg Cost: ₹818.75
Total Investment: ₹55,675 (68 × 818.75)
Expected Revenue: ₹102,000 (68 × 1,500)
Potential Profit: ₹46,325

Transaction History:
1. PURCHASE: +50 @ ₹800 from Logitech (INV-001)
2. PURCHASE: +30 @ ₹850 from Amazon (INV-002)
3. SALE: -10 @ ₹1,500 (Customer purchase)
4. ADJUSTMENT_OUT: -2 (Damaged units)

Final Stock: 68 units ✓
Average Cost: ₹818.75 ✓
Complete History: 4 transactions ✓
```

## 🚀 Next Steps After Testing

Once verified:

1. **Build custom UI** for your specific needs
2. **Add reporting** features
3. **Implement barcode scanning**
4. **Add batch/lot tracking**
5. **Integrate with accounting software**
6. **Add user permissions**
7. **Implement approval workflows**

## 📞 Need Help?

Check these documents:
- **INVENTORY-TRANSACTION-SYSTEM.md** - Complete system documentation
- **API-TESTING-GUIDE.md** - Detailed API examples
- **IMPLEMENTATION-SUMMARY.md** - Technical details

The backend is production-ready. All features are fully functional!

---

**Start testing now:**
1. Open http://localhost:3001/test.html
2. Click "Login"
3. Click "Run Complete Test"
4. Watch it work! 🎉
