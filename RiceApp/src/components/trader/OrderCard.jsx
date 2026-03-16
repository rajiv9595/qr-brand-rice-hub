// OrderCard.jsx
// Displays a single order for the trader to manage.

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDistance } from '../../utils/formatDistance';
import StatusBadge from '../common/StatusBadge';

const OrderCard = ({
  order,          // Order object populated with buyerId and listingId
  onAccept,
  onReject,
  onUpdateStatus,
}) => {
  const isPending = order.status === 'Pending';
  const buyer = order.buyerId || {};
  const listing = order.listingId || {};

  const handleCall = () => {
    Linking.openURL(`tel:${buyer.phone}`);
  };

  return (
    <View style={[styles.card, isPending && styles.cardNew]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>ORDER #{order.orderId || order._id?.slice(-6).toUpperCase()}</Text>
          <Text style={styles.customerName}>{buyer.phone || 'Customer'}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.details}>
        <Text style={styles.itemTextTe}>{listing.brandName || listing.riceVariety || 'Rice Order'}</Text>
        <View style={styles.qtyRow}>
           <Text style={styles.qtyTe}>{order.quantity} బ్యాగులు ({order.quantity} Bags)</Text>
           <Text style={styles.totalVal}>{formatCurrency(order.totalPrice)}</Text>
        </View>
        {typeof order.distance === 'number' && (
          <Text style={styles.distanceText}>📍 {formatDistance(order.distance)} away</Text>
        )}
      </View>

      <View style={styles.footer}>
        {isPending ? (
          <View style={styles.newActions}>
            <TouchableOpacity 
              style={[styles.btn, styles.rejectBtn]} 
              onPress={onReject}
            >
              <Text style={styles.rejectText}>❌ తిరస్కరించు (Reject)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.acceptBtn]} 
              onPress={onAccept}
            >
              <Text style={styles.acceptText}>✅ అంగీకరించు (Accept)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.confirmedActions}>
             <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Text style={styles.callIcon}>📞</Text>
                <Text style={styles.callText}>Call {buyer.phone?.slice(-4) || 'Buyer'}</Text>
             </TouchableOpacity>
             {order.status === 'Confirmed' && (
               <TouchableOpacity 
                 style={styles.shipBtn} 
                 onPress={() => onUpdateStatus('Shipped')}
               >
                 <Text style={styles.shipText}>🚚 Mark as Shipped</Text>
               </TouchableOpacity>
             )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardNew: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1 },
  customerName: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, marginTop: 2 },
  details: {
    marginBottom: 20,
  },
  itemTextTe: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  qtyTe: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  totalVal: { fontSize: 20, fontWeight: '900', color: Colors.primaryMid },
  distanceText: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, fontWeight: 'bold' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 16,
  },
  newActions: { flexDirection: 'row', gap: 12 },
  confirmedActions: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: Colors.errorBg },
  rejectText: { color: Colors.error, fontSize: 12, fontWeight: 'bold' },
  acceptBtn: { backgroundColor: Colors.success },
  acceptText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  callIcon: { fontSize: 16 },
  callText: { fontSize: 12, fontWeight: 'bold', color: Colors.textPrimary },
  shipBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  shipText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
});

export default OrderCard;
