import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../services/api';
import { useMessage } from '../contexts/MessageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';

interface Bill {
  id: number;
  bill_number: string;
  bill_date: string;
  customer_data: string;
  total: number;
  payment_status: string;
  status: string;
}

const BillsScreen: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const { showError, showSuccess } = useMessage();

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await api.getBills();
      setBills(data);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = (bill: Bill) => {
    if (bill.payment_status === 'paid') {
      showError('Bill is already paid');
      return;
    }

    Alert.alert('Mark as Paid', 'Mark this bill as paid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Paid',
        onPress: async () => {
          try {
            await api.markBillPaid(bill.id, 'cash', bill.total);
            showSuccess('Bill marked as paid');
            loadBills();
          } catch (error: any) {
            showError(error.response?.data?.message || 'Failed to mark bill as paid');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'unpaid':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {bills.length === 0 ? (
          <Text style={styles.emptyText}>No bills found</Text>
        ) : (
          bills.map((bill) => {
            let customerName = 'Unknown';
            try {
              const customerData = JSON.parse(bill.customer_data);
              customerName = customerData.name || 'Unknown';
            } catch (e) {
              // Ignore
            }

            return (
              <View key={bill.id} style={styles.billCard}>
                <View style={styles.billInfo}>
                  <Text style={styles.billNumber}>{bill.bill_number}</Text>
                  <Text style={styles.billCustomer}>{customerName}</Text>
                  <Text style={styles.billDate}>
                    {new Date(bill.bill_date).toLocaleDateString()}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(bill.payment_status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {bill.payment_status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.billActions}>
                  <Text style={styles.billTotal}>₹{bill.total.toFixed(2)}</Text>
                  {bill.payment_status === 'unpaid' && (
                    <Button
                      title="Mark Paid"
                      onPress={() => handleMarkPaid(bill)}
                      size="small"
                      variant="success"
                      style={styles.markPaidButton}
                    />
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  billCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  billInfo: {
    flex: 1,
  },
  billNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  billCustomer: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  billDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  billActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  billTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  markPaidButton: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default BillsScreen;
