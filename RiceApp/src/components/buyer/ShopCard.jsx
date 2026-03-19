// ShopCard.jsx
// Displays a single shop result for a rice search.
// High contrast, bilingual, and thumb-friendly.

import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDistance } from '../../utils/formatDistance';
import BigButton from '../common/BigButton';

const ShopCard = ({
  shop,           // RiceListing object from backend
  onPress,        // View details
  onOrder,        // Quick order
}) => {
  const supplier = shop?.supplierId || {};
  const isWholesaler = supplier.traderType === 'Wholesaler';
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.infoSide}>
          <View style={styles.badgeRow}>
             <View style={[styles.roleBadge, isWholesaler ? styles.wholesaler : styles.retailer]}>
                <Text style={styles.roleText}>{isWholesaler ? 'WHOLESALER' : 'RETAILER'}</Text>
             </View>
             {shop.usageCategory && (
               <View style={styles.ratingBadge}>
                 <Text style={[styles.ratingText, { color: Colors.primary }]}>{shop.usageCategory.toUpperCase()}</Text>
               </View>
             )}
          </View>
          
          <Text style={styles.shopName} numberOfLines={1}>
            {supplier.millName || shop.brandName || 'Rice Shop'}
          </Text>
          <Text style={styles.distanceText}>
            📍 {supplier.district || ''} · {typeof shop.distance === 'number' ? formatDistance(shop.distance) : 'Nearby'}
          </Text>
        </View>

        <View style={styles.imageSide}>
          {shop.bagImageUrl ? (
            <Image source={{ uri: shop.bagImageUrl }} style={styles.shopImg} />
          ) : (
            <View style={styles.imgPlaceholder}>
              <Text style={styles.placeholderIcon}>🌾</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabelTe}>{shop.riceVariety} ({shop.riceType})</Text>
          <Text style={TextStyles.priceMain}>{formatCurrency(shop.pricePerBag || shop.price)}</Text>
        </View>
        <View style={styles.btnWrap}>
          <BigButton 
            te="ఆర్డర్ చేయండి" 
            en="Order Now" 
            variant="orange"
            onPress={onOrder}
            style={styles.orderBtn}
          />
        </View>
      </View>
    </TouchableOpacity>
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
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoSide: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  wholesaler: {
    backgroundColor: Colors.primaryLight,
  },
  retailer: {
    backgroundColor: Colors.infoBg,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryMid,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FBC02D',
  },
  shopName: {
    fontSize: Typography.size.lg,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  distanceText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  imageSide: {
    width: 80,
    height: 80,
  },
  shopImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceLabelTe: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  btnWrap: {
    width: '50%',
  },
  orderBtn: {
    minHeight: 52,
    paddingVertical: 10,
  },
});

export default ShopCard;
