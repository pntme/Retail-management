import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import api from '../services/api';
import { useMessage } from '../contexts/MessageContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface JobCard {
  id: number;
  job_number: string;
  customer_name: string;
  vehicle_number: string;
  status: string;
  created_at: string;
  labour_charge?: number;
}

const JobCardsScreen: React.FC = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const { showError } = useMessage();

  useEffect(() => {
    loadJobCards();
  }, [filter]);

  const loadJobCards = async () => {
    try {
      const statusFilter = filter === 'all' ? undefined : filter;
      const data = await api.getJobCards(1, 50, statusFilter);
      setJobCards(data.jobCards || data);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load job cards');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#3b82f6';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      case 'billed':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'open', 'in_progress', 'completed', 'billed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filter === status && styles.filterTabActive,
              ]}
              onPress={() => setFilter(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === status && styles.filterTabTextActive,
                ]}
              >
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Job Cards List */}
      <ScrollView style={styles.list}>
        {jobCards.length === 0 ? (
          <Text style={styles.emptyText}>No job cards found</Text>
        ) : (
          jobCards.map((jobCard) => (
            <TouchableOpacity key={jobCard.id} style={styles.jobCardItem}>
              <View style={styles.jobCardInfo}>
                <Text style={styles.jobNumber}>{jobCard.job_number}</Text>
                <Text style={styles.customerName}>{jobCard.customer_name}</Text>
                <Text style={styles.vehicleNumber}>{jobCard.vehicle_number}</Text>
                <Text style={styles.jobDate}>
                  {new Date(jobCard.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.jobCardMeta}>
                {jobCard.labour_charge && (
                  <Text style={styles.labourCharge}>
                    ₹{jobCard.labour_charge.toFixed(2)}
                  </Text>
                )}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(jobCard.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {jobCard.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Note about full functionality */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          Note: Full job card creation and editing will be available in a future update.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  jobCardItem: {
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
  jobCardInfo: {
    flex: 1,
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  vehicleNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  jobDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  jobCardMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  labourCharge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6b7280',
  },
  noteContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
  },
  noteText: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
  },
});

export default JobCardsScreen;
