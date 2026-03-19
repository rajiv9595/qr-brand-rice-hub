// NearbyShops.jsx
// Displays a list of shops matching the search criteria.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import ShopCard from '../../components/buyer/ShopCard';
import { riceService } from '../../api/riceService';
import { useLocation } from '../../context/LocationContext';

export default function NearbyShops() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { variety, type, size, qty } = route.params || {};
  const { location } = useLocation();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShops = async () => {
    try {
      setLoading(true);
      // Use the REAL backend search endpoint: GET /api/rice/search
      // Backend params: riceVariety, riceType, packSize, lat, lng, distance, sortBy
      const params = {
        riceVariety: variety,
        riceType:    type,
        lat:         location?.lat,
        lng:         location?.lng,
        distance:    10, // 10km radius
      };
      if (size) params.packSize = size + 'kg';
      
      const res = await riceService.searchListings(params);
      // Backend returns { success, totalResults, results } for search
      const results = res.data?.results || res.data?.data || [];
      setShops(results);
    } catch (err) {
      console.error('Failed to fetch nearby shops', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [variety, type, size, location]);

  const handleOrder = (shop) => {
    navigation.navigate('OrderConfirm', { 
      shop, 
      variety, 
      type, 
      size, 
      qty 
    });
  };

  const renderHeader = () => (
    <View style={styles.resultsHeader}>
      <Text style={TextStyles.sectionTitle}>
        {shops.length} షాపులు దొరికాయి / {shops.length} shops found
      </Text>
      <View style={styles.filterPill}>
        <Text style={styles.filterText}>{variety} · {size}kg</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader te="సమీపంలోని షాపులు" en="Nearby Rice Shops" />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>షాపుల కోసం వెతుకుతున్నాము...</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <ShopCard 
              shop={item} 
              onOrder={() => handleOrder(item)}
              onPress={() => navigation.navigate('RiceDetail', { id: item._id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchShops();
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTe}>క్షమించండి, మీ ప్రాంతంలో షాపులు లేవు.</Text>
              <Text style={styles.emptyEn}>No shops found in your area for this rice.</Text>
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
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontWeight: 'bold' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: { fontSize: 10, fontWeight: 'bold', color: Colors.primary },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTe: { fontSize: Typography.size.md, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  emptyEn: { fontSize: Typography.size.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
});
