// RiceDetail.jsx
// Detailed view of a single rice listing with technical specs and reviews.

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';
import { riceService } from '../../api/riceService';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RiceDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await riceService.getListing(id);
        setListing(res.data.data);
      } catch (err) {
        console.error('Failed to fetch listing detail', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found.</Text>
      </View>
    );
  }

  const handleOrder = () => {
    navigation.navigate('OrderConfirm', { 
      shop: listing,
      variety: listing.riceVariety,
      type: listing.riceType,
      size: listing.bagWeightKg,
      qty: 1
    });
  };

  const supplier = listing.supplierId || {};

  return (
    <View style={styles.container}>
      <AppHeader te={listing.brandName || listing.riceVariety} en="Rice Details" />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageCard}>
          {listing.bagImageUrl ? (
            <Image source={{ uri: listing.bagImageUrl }} style={styles.mainImg} />
          ) : (
            <View style={styles.placeholderImg}>
              <Text style={{ fontSize: 64 }}>🌾</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceTe}>ధర (Price):</Text>
              <Text style={styles.priceVal}>{formatCurrency(listing.pricePerBag)}</Text>
              <Text style={styles.priceUnit}>Per {listing.bagWeightKg}kg Bag</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>{listing.stockAvailable > 0 ? 'IN STOCK' : 'OUT OF STOCK'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
           <Text style={styles.sectionTitle}>బియ్యం రకం / Rice Specs</Text>
           <View style={styles.specGrid}>
              <SpecItem label="Variety" value={listing.riceVariety} />
              <SpecItem label="Type" value={listing.riceType} />
              <SpecItem label="Age" value={listing.ageOfRice || '6 Months'} />
              <SpecItem label="Usage" value={listing.usageCategory} />
           </View>
        </View>

        <View style={styles.shopSection}>
           <Text style={styles.sectionTitle}>షాపు వివరాలు / Shop Details</Text>
           <View style={styles.shopCard}>
              <Text style={styles.shopName}>{supplier.millName || 'Rice Mill'}</Text>
              <Text style={styles.shopLoc}>📍 {supplier.district}, {supplier.state}</Text>
              <View style={styles.tagRow}>
                 <Text style={styles.tag}>{supplier.traderType}</Text>
                 <Text style={styles.tag}>Verified</Text>
              </View>
           </View>
        </View>

        {listing.description && (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>వివరణ / Description</Text>
            <Text style={styles.descText}>{listing.description}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
         <BigButton 
           te="ఆర్డర్ ప్రక్రియ ప్రారంభించండి" 
           en="Start Order Process" 
           variant="orange"
           onPress={handleOrder}
         />
      </View>
    </View>
  );
}

const SpecItem = ({ label, value }) => (
  <View style={styles.specItem}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 100 },
  imageCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  mainImg: { width: '100%', height: 250, borderRadius: 20, resizeMode: 'contain' },
  placeholderImg: { width: '100%', height: 250, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 },
  priceTe: { fontSize: 13, color: Colors.textSecondary, fontWeight: 'bold' },
  priceVal: { fontSize: 32, fontWeight: '900', color: Colors.primaryUnderline },
  priceUnit: { fontSize: 12, color: Colors.textMuted },
  stockBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  stockText: { color: Colors.primary, fontWeight: 'bold', fontSize: 10 },
  infoSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary, marginBottom: 16 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  specItem: { width: '47%', backgroundColor: Colors.white, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight },
  specLabel: { fontSize: 10, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  specValue: { fontSize: 15, fontWeight: 'bold', color: Colors.textPrimary },
  shopSection: { padding: 20, paddingTop: 0 },
  shopCard: { backgroundColor: '#E3F2FD', padding: 20, borderRadius: 20 },
  shopName: { fontSize: 19, fontWeight: '900', color: '#1565C0' },
  shopLoc: { fontSize: 14, color: '#1565C0', opacity: 0.8, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tag: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: 'bold', color: '#1565C0' },
  descSection: { padding: 20, paddingTop: 0 },
  descText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
