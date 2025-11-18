import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import api from '../services/api';
import { useMessage } from '../contexts/MessageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

interface Product {
  id: number;
  name: string;
  sell_price: number;
  quantity: number;
}

interface SaleItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const SalesScreen: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saving, setSaving] = useState(false);

  const { showError, showSuccess } = useMessage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesData, productsData] = await Promise.all([
        api.getSales(),
        api.getProducts(),
      ]);
      setSales(salesData.sales || salesData);
      setProducts(productsData);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openSaleModal = () => {
    setSaleItems([]);
    setSelectedProduct(null);
    setQuantity('1');
    setPaymentMethod('cash');
    setModalVisible(true);
  };

  const addItemToSale = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      showError('Please select a product and enter valid quantity');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty > product.quantity) {
      showError('Insufficient stock');
      return;
    }

    const existing = saleItems.find((item) => item.product_id === selectedProduct);
    if (existing) {
      setSaleItems(
        saleItems.map((item) =>
          item.product_id === selectedProduct
            ? {
                ...item,
                quantity: item.quantity + qty,
                subtotal: (item.quantity + qty) * item.unit_price,
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          unit_price: product.sell_price,
          subtotal: qty * product.sell_price,
        },
      ]);
    }

    setSelectedProduct(null);
    setQuantity('1');
  };

  const removeItem = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleCompleteSale = async () => {
    if (saleItems.length === 0) {
      showError('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      await api.createSale({
        items: saleItems,
        payment_method: paymentMethod,
        total: calculateTotal(),
      });

      showSuccess('Sale completed successfully');
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="New Sale" onPress={openSaleModal} size="small" />
      </View>

      <ScrollView style={styles.list}>
        {sales.length === 0 ? (
          <Text style={styles.emptyText}>No sales found</Text>
        ) : (
          sales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleId}>Sale #{sale.id}</Text>
                <Text style={styles.saleDate}>
                  {new Date(sale.created_at).toLocaleString()}
                </Text>
                <Text style={styles.salePayment}>
                  Payment: {sale.payment_method}
                </Text>
              </View>
              <Text style={styles.saleTotal}>₹{sale.total.toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Sale</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Add Item Section */}
            <View style={styles.addItemSection}>
              <Text style={styles.sectionTitle}>Add Item</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product</Text>
                <ScrollView horizontal style={styles.productList}>
                  {products.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.productChip,
                        selectedProduct === product.id && styles.productChipSelected,
                      ]}
                      onPress={() => setSelectedProduct(product.id)}
                    >
                      <Text
                        style={[
                          styles.productChipText,
                          selectedProduct === product.id &&
                            styles.productChipTextSelected,
                        ]}
                      >
                        {product.name} - ₹{product.sell_price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholder="Quantity"
                />
              </View>

              <Button
                title="Add to Sale"
                onPress={addItemToSale}
                size="small"
                variant="secondary"
              />
            </View>

            {/* Sale Items */}
            {saleItems.length > 0 && (
              <View style={styles.saleItemsSection}>
                <Text style={styles.sectionTitle}>Sale Items</Text>
                {saleItems.map((item) => (
                  <View key={item.product_id} style={styles.saleItemRow}>
                    <View style={styles.saleItemInfo}>
                      <Text style={styles.saleItemName}>{item.product_name}</Text>
                      <Text style={styles.saleItemQty}>
                        {item.quantity} × ₹{item.unit_price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.saleItemActions}>
                      <Text style={styles.saleItemTotal}>
                        ₹{item.subtotal.toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeItem(item.product_id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    ₹{calculateTotal().toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Payment Method */}
            {saleItems.length > 0 && (
              <View style={styles.paymentSection}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  {['cash', 'card', 'upi', 'other'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentChip,
                        paymentMethod === method && styles.paymentChipSelected,
                      ]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text
                        style={[
                          styles.paymentChipText,
                          paymentMethod === method &&
                            styles.paymentChipTextSelected,
                        ]}
                      >
                        {method.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {saleItems.length > 0 && (
              <Button
                title="Complete Sale"
                onPress={handleCompleteSale}
                loading={saving}
                variant="success"
                style={styles.completeButton}
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  list: {
    flex: 1,
  },
  saleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saleInfo: {
    flex: 1,
  },
  saleId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  salePayment: {
    fontSize: 12,
    color: '#6b7280',
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 36,
    color: '#6b7280',
    fontWeight: '300',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  addItemSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  productList: {
    flexDirection: 'row',
  },
  productChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  productChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  productChipText: {
    fontSize: 12,
    color: '#374151',
  },
  productChipTextSelected: {
    color: '#fff',
  },
  saleItemsSection: {
    marginBottom: 20,
  },
  saleItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  saleItemInfo: {
    flex: 1,
  },
  saleItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  saleItemQty: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  saleItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saleItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
  removeText: {
    fontSize: 24,
    color: '#ef4444',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  paymentSection: {
    marginBottom: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    marginBottom: 8,
  },
  paymentChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  paymentChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  paymentChipTextSelected: {
    color: '#fff',
  },
  completeButton: {
    marginVertical: 20,
  },
});

export default SalesScreen;
