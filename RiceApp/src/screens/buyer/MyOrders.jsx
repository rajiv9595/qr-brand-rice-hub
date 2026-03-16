// MyOrders.jsx
// Displays a list of orders placed by the buyer.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import { orderService } from '../../api/orderService';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch my orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrderItem = ({ item }) => {
    // Backend populates: listingId → { brandName, riceVariety, bagImageUrl }
    //                     supplierId → { millName, userId: { phone, email } }
    const listing  = item.listingId || {};
    const supplier = item.supplierId || {};

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.varietyTe}>{listing.brandName || 'Rice Order'}</Text>
            <Text style={styles.varietyEn}>{listing.riceVariety || ''} · {item.orderId}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.shopName}>🏪 {supplier.millName || 'Rice Shop'}</Text>
          <View style={styles.priceRow}>
             <Text style={styles.qtyText}>{item.quantity} Bags</Text>
             <Text style={styles.totalPrice}>{formatCurrency(item.totalPrice)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader te="నా ఆర్డర్లు" en="My Orders" showBack={false} />
      
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} color={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTe}>మీరు ఇంకా ఏమీ ఆర్డర్ చేయలేదు.</Text>
              <Text style={styles.emptyEn}>You haven't placed any orders yet.</Text>
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
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  varietyTe: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  varietyEn: { fontSize: 12, color: Colors.textSecondary, fontWeight: 'bold' },
  cardBody: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 },
  shopName: { fontSize: 14, color: Colors.textPrimary, fontWeight: 'bold', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyText: { fontSize: 14, color: Colors.textSecondary },
  totalPrice: { fontSize: 18, fontWeight: '900', color: Colors.primaryMid },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTe: { fontSize: Typography.size.md, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  emptyEn: { fontSize: Typography.size.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
});
