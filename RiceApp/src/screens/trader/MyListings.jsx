// screens/trader/MyListings.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import { riceService } from '../../api/riceService';
import { formatCurrency } from '../../utils/formatCurrency';
import ListingCard from '../../components/trader/ListingCard';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await riceService.getMyListings();
      setListings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch listings', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader te="నా బియ్యం రకాలు" en="My Rice Listings" showBack={false} />
      
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ListingCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} color={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌾</Text>
              <Text style={styles.emptyTe}>బియ్యం రకాలను ఇంకా చేర్చలేదు.</Text>
              <Text style={styles.emptyEn}>No listings added yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTe: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  emptyEn: { fontSize: 14, color: Colors.textSecondary },
});

export default MyListings;
