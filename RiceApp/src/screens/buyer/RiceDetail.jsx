// RiceDetail.jsx
// Detailed view of a single rice listing with technical specs and reviews.

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import { AuthContext } from '../../context/AuthContext';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';
import { riceService } from '../../api/riceService';
import { negotiationService } from '../../api/negotiationService';
import { useLocation } from '../../context/LocationContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RiceDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { id, isDeal } = route.params || {};
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [negotiating, setNegotiating] = useState(false);
  const { location: userLoc } = useLocation();

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleOrder = () => {
    // Distance check for Best Deals
    if (isDeal && listing?.supplierId?.location?.coordinates) {
      const [shopLng, shopLat] = listing.supplierId.location.coordinates;
      const userLat = userLoc?.lat || user?.address?.lat;
      const userLng = userLoc?.lng || user?.address?.lng;

      if (userLat && userLng) {
        const dist = calculateDistance(userLat, userLng, shopLat, shopLng);
        if (dist > 50) {
          Alert.alert(
            "Service Area Limit",
            "Sincere apologies, but this special Best Deal is limited to customers within 50km of the mill. Since you are located further away, we cannot fulfill this specific direct mill deal at this price.",
            [{ text: "OK" }]
          );
          return;
        }
      }
    }

    if (loading || !listing) return;
    navigation.navigate('OrderConfirm', { 
      shop: listing,
      variety: listing.riceVariety,
      type: listing.riceType,
      size: listing.bagWeightKg,
      qty: 1
    });
  };

  const handleNegotiate = async () => {
    if (user?.role === 'supplier') return;
    
    setNegotiating(true);
    try {
      await negotiationService.createNegotiation({
        listingId: listing._id,
        proposedPrice: listing.pricePerBag,
        proposedQuantity: 50, // Default bulk quantity for start
        initialMessage: `I am interested in ${listing.brandName}. Can we discuss a custom quote for a bulk order?`
      });
      
      Alert.alert(
        'Success', 
        'Negotiation started! You can chat with the trader in your Negotiation Hub.',
        [{ text: 'Go to Hub', onPress: () => navigation.navigate('NegotiationHub') }]
      );
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        navigation.navigate('NegotiationHub');
      } else {
        Alert.alert('Error', err.response?.data?.message || 'Failed to start negotiation');
      }
    } finally {
      setNegotiating(false);
    }
  };

  const supplier = listing.supplierId || {};
  // The backend now populates supplierId.userId to include isVerified 🛡️
  const isSupplierVerified = supplier.userId?.isVerified === true;

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
                 <View style={[styles.tag, { flexDirection: 'row', alignItems: 'center', backgroundColor: isSupplierVerified ? '#ECFDF5' : '#FFF7ED', borderColor: isSupplierVerified ? '#10B981' : '#FED7AA', borderWidth: 1 }]}>
                     <Icon name={isSupplierVerified ? "check-circle" : "clock"} size={10} color={isSupplierVerified ? "#059669" : "#D97706"} style={{ marginRight: 4 }} />
                     <Text style={{ fontSize: 10, fontWeight: 'bold', color: isSupplierVerified ? '#059669' : '#D97706' }}>
                       {isSupplierVerified ? 'Verified Seller' : 'Verification Pending'}
                     </Text>
                 </View>
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
           te="కొనండి / ఆర్డర్ చేయండి" 
           en="Order Now" 
           variant="orange"
           onPress={handleOrder}
         />
         
         {user?.role !== 'supplier' && (
           <TouchableOpacity 
             style={styles.negotiateBtn} 
             onPress={handleNegotiate}
             disabled={negotiating}
           >
              {negotiating ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Icon name="comments" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.negotiateText}>Request Custom Quote / Negotiate</Text>
                </>
              )}
           </TouchableOpacity>
         )}
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
  scroll: { paddingBottom: 180 },
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
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    padding: 20, backgroundColor: Colors.white, 
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    gap: 12
  },
  negotiateBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  negotiateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
