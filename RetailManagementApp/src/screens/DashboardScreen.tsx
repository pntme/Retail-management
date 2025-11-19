import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useMessage } from '../contexts/MessageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import QuickNav from '../components/QuickNav';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  todaySales: number;
  todayRevenue: number;
  activeServices: number;
}

interface LowStockItem {
  id: number;
  name: string;
  quantity: number;
  reorder_level: number;
}

const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { showError } = useMessage();
  const navigation = useNavigation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, lowStockData, salesData] = await Promise.all([
        api.getDashboardStats(),
        api.getLowStockItems(),
        api.getRecentSales(),
      ]);

      setStats(statsData);
      setLowStock(lowStockData);
      setRecentSales(salesData);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const getStockColor = (item: LowStockItem) => {
    const percentage = item.reorder_level > 0 ? (item.quantity / item.reorder_level) * 100 : 100;
    if (percentage <= 25) return '#ef4444'; // Red
    if (percentage <= 50) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <View style={{ flex: 1 }}>
      <QuickNav />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
          <Text style={styles.statValue}>{stats?.totalCustomers || 0}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statValue}>{stats?.todaySales || 0}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
          <Text style={styles.statValue}>₹{stats?.todayRevenue?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#ec4899' }]}>
          <Text style={styles.statValue}>{stats?.activeServices || 0}</Text>
          <Text style={styles.statLabel}>Active Services</Text>
        </View>
      </View>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Low Stock Alert</Text>
          {lowStock.map((item) => (
            <View key={item.id} style={styles.lowStockItem}>
              <View style={styles.lowStockInfo}>
                <Text style={styles.lowStockName}>{item.name}</Text>
                <Text style={styles.lowStockQty}>
                  Qty: {item.quantity} / {item.reorder_level}
                </Text>
              </View>
              <View
                style={[
                  styles.lowStockBadge,
                  { backgroundColor: getStockColor(item) },
                ]}
              />
            </View>
          ))}
        </View>
      )}

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          {recentSales.map((sale) => (
            <View key={sale.id} style={styles.saleItem}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleCustomer}>
                  {sale.customer_name || 'Walk-in Customer'}
                </Text>
                <Text style={styles.saleDate}>
                  {new Date(sale.created_at).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.saleAmount}>₹{sale.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
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
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  lowStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  lowStockQty: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  lowStockBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  saleInfo: {
    flex: 1,
  },
  saleCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  saleDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

export default DashboardScreen;
