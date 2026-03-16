// OrderConfirm.jsx
// Final screen for buyer to confirm their order.

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { orderService } from '../../api/orderService';
import { openWhatsApp } from '../../utils/openWhatsApp';

export default function OrderConfirm() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { shop, variety, type, size, qty } = route.params || {};

  const [loading, setLoading] = useState(false);

  // shop is a RiceListing object from backend — price is pricePerBag
  const pricePerBag = shop?.pricePerBag || shop?.price || 0;
  const total = pricePerBag * qty;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // Backend requires: { listingId, quantity, shippingAddress: { phone, ... } }
      const orderData = {
        listingId: shop._id || shop.id,
        quantity:  qty,
        shippingAddress: {
          phone: 'N/A', // Will be replaced with real user phone from auth
          city:  shop?.supplierId?.district || '',
          state: shop?.supplierId?.state || 'Andhra Pradesh',
        },
      };
      
      const res = await orderService.createOrder(orderData);
      
      if (res.data.success) {
        Alert.alert(
          'ఆర్డర్ పూర్తయింది! ✅',
          `ఆర్డర్ ID: ${res.data.data?.orderId || 'N/A'}\nమీ ఆర్డర్ విజయవంతంగా పంపబడింది.`,
          [{ text: 'సరే (OK)', onPress: () => navigation.navigate('MyOrders') }]
        );
      }
    } catch (err) {
      console.error('Failed to place order', err);
      Alert.alert('క్షమించండి', err.response?.data?.message || 'ఆర్డర్ చేయడంలో సమస్య వచ్చింది.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hello, I want to order ${qty} bags of ${variety} (${type}, ${size}kg) from your shop on QR Brands Rice App.`;
    const phone = shop?.supplierId?.userId?.phone || '91XXXXXXXXXX';
    openWhatsApp(phone, message);
  };

  return (
    <View style={styles.container}>
      <AppHeader te="ఆర్డర్ నిర్ధారణ" en="Confirm Your Order" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabelTe}>మీ ఆర్డర్ వివరాలు (Order Details):</Text>
          
          <View style={styles.itemRow}>
            <View style={styles.itemIconWrap}>
              <Text style={styles.itemIcon}>🍚</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNameTe}>{variety}</Text>
              <Text style={styles.itemNameEn}>{type} · {size}kg</Text>
            </View>
            <Text style={styles.itemQty}>x{qty}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.shopRow}>
             <Text style={styles.shopLabelTe}>షాపు (Shop):</Text>
             <Text style={styles.shopName}>{shop?.supplierId?.millName || shop?.brandName || 'Rice Shop'}</Text>
             <Text style={styles.shopLocation}>📍 {shop?.supplierId?.district || 'AP'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
             <Text style={styles.totalLabelTe}>మొత్తం ధర (Total):</Text>
             <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
           <Text style={styles.infoText}>
             ✅ ఉచిత డెలివరీ (Free Delivery) {'\n'}
             🏠 ఇంటి వద్దే పేమెంట్ (Cash on Delivery)
           </Text>
        </View>

        <View style={styles.actions}>
          <BigButton 
            te="ఆర్డర్ చేయండి" 
            en="Place Order" 
            variant="orange"
            onPress={handleConfirm}
            loading={loading}
            style={styles.confirmBtn}
          />

          <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
            <Text style={styles.whatsappIcon}>💬</Text>
            <View>
              <Text style={styles.whatsappTe}>WhatsApp లో అడగండి</Text>
              <Text style={styles.whatsappEn}>Chat on WhatsApp</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: 20 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLabelTe: { fontSize: 14, fontWeight: '900', color: Colors.textSecondary, marginBottom: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  itemIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  itemIcon: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemNameTe: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary },
  itemNameEn: { fontSize: 14, color: Colors.textSecondary, fontWeight: 'bold' },
  itemQty: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 20 },
  shopRow: {},
  shopLabelTe: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 4 },
  shopName: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  shopLocation: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabelTe: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  totalVal: { fontSize: 28, fontWeight: '900', color: Colors.accent },
  infoBox: { marginTop: 20, backgroundColor: Colors.successBg, padding: 16, borderRadius: 16, alignItems: 'center' },
  infoText: { fontSize: 14, fontWeight: 'bold', color: Colors.success, textAlign: 'center', lineHeight: 22 },
  actions: { marginTop: 30, gap: 16 },
  confirmBtn: { shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.whatsappBg,
    borderWidth: 1,
    borderColor: Colors.whatsapp,
  },
  whatsappIcon: { fontSize: 24 },
  whatsappTe: { fontSize: 16, fontWeight: 'bold', color: Colors.whatsapp },
  whatsappEn: { fontSize: 12, color: Colors.whatsapp, opacity: 0.8 },
});
