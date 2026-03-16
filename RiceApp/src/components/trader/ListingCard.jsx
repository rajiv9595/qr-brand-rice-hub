// ListingCard.jsx
// Displays a trader's own rice listing in MyListings screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';

const ListingCard = ({ item }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EditProduct', { listing: item })}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.imageWrap}>
          {item.bagImageUrl ? (
            <Image source={{ uri: item.bagImageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>🌾</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.statusRow}>
             <View style={[styles.statusBadge, item.status === 'Approved' ? styles.approved : styles.pending]}>
                <Text style={styles.statusText}>{item.status?.toUpperCase() || 'PENDING'}</Text>
             </View>
             {item.usageCategory && (
               <View style={styles.catBadge}>
                 <Text style={styles.catText}>{item.usageCategory}</Text>
               </View>
             )}
          </View>

          <Text style={styles.title} numberOfLines={1}>{item.brandName || item.riceVariety}</Text>
          <Text style={styles.subtitle}>{item.riceVariety} · {item.riceType}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(item.pricePerBag)}</Text>
            <Text style={styles.stock}>Stock: {item.stockAvailable || 0}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.editLink}>Edit Details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pending: { backgroundColor: '#FFF3E0' },
  approved: { backgroundColor: '#E8F5E9' },
  statusText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#888',
  },
  catBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryUnderline,
  },
  stock: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  editLink: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default ListingCard;
