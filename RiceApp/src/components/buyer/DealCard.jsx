// DealCard.jsx
// High-fidelity banner for "Today's Best Deals" in the native app.

import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';

const { width } = Dimensions.get('window');

const DealCard = ({ deal, onPress }) => {
  if (!deal) return null;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Left Side: Info */}
        <View style={styles.info}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TODAY'S BEST DEALS</Text>
          </View>
          <Text style={styles.teTitle}>(ఈ రోజు ఉత్తమ డీల్స్)</Text>
          
          <Text style={styles.variety} numberOfLines={1}>{deal.riceVariety}</Text>
          <Text style={styles.type}>{deal.riceType || 'Premium'} ({deal.bagWeightKg || 26}kg Bag)</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(deal.pricePerBag)}</Text>
            <Text style={styles.oldPrice}>{formatCurrency(Math.round(deal.pricePerBag * 1.15))}</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 15%</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.shopBtn} onPress={onPress}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side: Image */}
        <View style={styles.imageWrap}>
           <Image 
             source={{ uri: deal.imageUrl || 'https://res.cloudinary.com/dmv6l9j9x/image/upload/v1/rice-hub/default-bag' }} 
             style={styles.image}
             resizeMode="contain"
           />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    alignSelf: 'center',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#2D3A26',
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#1a2418',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  info: {
    flex: 1.2,
    zIndex: 2,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeText: {
    color: '#FDBA74',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  teTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  variety: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  type: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  oldPrice: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textDecorationLine: 'line-through',
    fontWeight: 'bold',
  },
  saveBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  shopBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  shopBtnText: {
    color: '#2D3A26',
    fontSize: 14,
    fontWeight: '900',
  },
  imageWrap: {
    flex: 0.8,
    height: 140,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 150,
    transform: [{ rotate: '-10deg' }],
  },
});

export default DealCard;
