// TraderOrders.jsx
// Management screen for traders to view and process customer orders.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import OrderCard from '../../components/trader/OrderCard';
import { orderService } from '../../api/orderService';

export default function TraderOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getTraderOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch trader orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      // Refresh list after update
      fetchOrders();
      
      const statusMsg = status === 'Confirmed' ? 'అంగీకరించబడింది (Accepted)' : 'రద్దు చేయబడింది (Cancelled)';
      Alert.alert('విజయం!', `ఆర్డర్ ${statusMsg}.`);
    } catch (err) {
      console.error('Failed to update order status', err);
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader te="కస్టమర్ ఆర్డర్లు" en="Customer Orders" />
      
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              onAccept={() => handleUpdateStatus(item._id || item.id, 'Confirmed')}
              onReject={() => handleUpdateStatus(item._id || item.id, 'Cancelled')}
              onUpdateStatus={(status) => handleUpdateStatus(item._id || item.id, status)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} color={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTe}>ఇంకా కొత్త ఆర్డర్లు లేవు.</Text>
              <Text style={styles.emptyEn}>No new orders yet. They will appear here when customers buy your rice.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list:      { padding: 20 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTe: { fontSize: Typography.size.md, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  emptyEn: { fontSize: Typography.size.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 40 },
});
