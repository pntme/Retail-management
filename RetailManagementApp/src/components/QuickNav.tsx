import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QuickNav: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const navItems = [
    { name: 'Dashboard', screen: 'Dashboard' as const, color: '#3b82f6' },
    { name: 'Customers', screen: 'Customers' as const, color: '#10b981' },
    { name: 'Products', screen: 'Products' as const, color: '#f59e0b' },
    { name: 'Sales', screen: 'Sales' as const, color: '#8b5cf6' },
    { name: 'Job Cards', screen: 'JobCards' as const, color: '#ec4899' },
    { name: 'Bills', screen: 'Bills' as const, color: '#06b6d4' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[styles.navButton, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QuickNav;
