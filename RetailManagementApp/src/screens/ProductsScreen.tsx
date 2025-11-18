import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import api from '../services/api';
import { useMessage } from '../contexts/MessageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

interface Product {
  id: number;
  name: string;
  sku?: string;
  sell_price: number;
  cost?: number;
  quantity: number;
  reorder_level?: number;
  vendor?: string;
  rack_id?: string;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    sell_price: '',
    cost: '',
    quantity: '',
    reorder_level: '',
    vendor: '',
    rack_id: '',
  });
  const [saving, setSaving] = useState(false);

  const { showError, showSuccess } = useMessage();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      sku: '',
      sell_price: '',
      cost: '',
      quantity: '',
      reorder_level: '',
      vendor: '',
      rack_id: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      sell_price: product.sell_price.toString(),
      cost: product.cost?.toString() || '',
      quantity: product.quantity.toString(),
      reorder_level: product.reorder_level?.toString() || '',
      vendor: product.vendor || '',
      rack_id: product.rack_id || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sell_price) {
      showError('Name and sell price are required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        sku: formData.sku,
        sell_price: parseFloat(formData.sell_price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        reorder_level: formData.reorder_level ? parseInt(formData.reorder_level) : 10,
        vendor: formData.vendor,
        rack_id: formData.rack_id,
      };

      if (selectedProduct) {
        await api.updateProduct(selectedProduct.id, data);
        showSuccess('Product updated successfully');
      } else {
        await api.createProduct(data);
        showSuccess('Product created successfully');
      }

      setModalVisible(false);
      loadProducts();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteProduct(product.id);
              showSuccess('Product deleted successfully');
              loadProducts();
            } catch (error: any) {
              showError(error.response?.data?.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const getStockColor = (product: Product) => {
    if (!product.reorder_level) return '#10b981';
    const percentage = (product.quantity / product.reorder_level) * 100;
    if (percentage <= 25) return '#ef4444';
    if (percentage <= 50) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Add Product" onPress={openCreateModal} size="small" />
      </View>

      <ScrollView style={styles.list}>
        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products found</Text>
        ) : (
          products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => openEditModal(product)}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.sku && (
                  <Text style={styles.productDetail}>SKU: {product.sku}</Text>
                )}
                <Text style={styles.productDetail}>
                  Price: ₹{product.sell_price.toFixed(2)}
                </Text>
                <View style={styles.stockRow}>
                  <Text style={styles.productDetail}>
                    Stock: {product.quantity}
                  </Text>
                  <View
                    style={[
                      styles.stockBadge,
                      { backgroundColor: getStockColor(product) },
                    ]}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(product)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>
              {selectedProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Product name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SKU</Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
                placeholder="Stock keeping unit"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sell Price *</Text>
              <TextInput
                style={styles.input}
                value={formData.sell_price}
                onChangeText={(text) =>
                  setFormData({ ...formData, sell_price: text })
                }
                placeholder="Selling price"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cost Price</Text>
              <TextInput
                style={styles.input}
                value={formData.cost}
                onChangeText={(text) => setFormData({ ...formData, cost: text })}
                placeholder="Cost price"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(text) =>
                  setFormData({ ...formData, quantity: text })
                }
                placeholder="Stock quantity"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reorder Level</Text>
              <TextInput
                style={styles.input}
                value={formData.reorder_level}
                onChangeText={(text) =>
                  setFormData({ ...formData, reorder_level: text })
                }
                placeholder="Minimum stock level"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vendor</Text>
              <TextInput
                style={styles.input}
                value={formData.vendor}
                onChangeText={(text) => setFormData({ ...formData, vendor: text })}
                placeholder="Vendor name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rack Location</Text>
              <TextInput
                style={styles.input}
                value={formData.rack_id}
                onChangeText={(text) =>
                  setFormData({ ...formData, rack_id: text })
                }
                placeholder="Rack/bin location"
              />
            </View>

            <Button
              title={selectedProduct ? 'Update Product' : 'Create Product'}
              onPress={handleSave}
              loading={saving}
              style={styles.saveButton}
            />
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
  productCard: {
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
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stockBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
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
  inputGroup: {
    marginBottom: 16,
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
  },
  saveButton: {
    marginVertical: 20,
  },
});

export default ProductsScreen;
