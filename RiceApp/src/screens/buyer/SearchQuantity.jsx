// SearchQuantity.jsx
// Step 3 of 3: Pick Pack Size & Quantity
// Designed for extreme simplicity.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';

const SIZES = [
  { value: 1,  te: '1 కేజీ', en: '1 kg' },
  { value: 5,  te: '5 కేజీ', en: '5 kg' },
  { value: 10, te: '10 కేజీ', en: '10 kg' },
  { value: 26, te: '26 కేజీ', en: '26 kg' },
  { value: 50, te: '50 కేజీ', en: '50 kg' },
];

const SearchQuantity = () => {
  const navigation = useNavigation();
  const route      = useRoute();
  const { variety, type } = route.params || {};
  const [selectedSize, setSelectedSize] = useState(26); // Default to most common
  const [quantity, setQuantity] = useState(1);

  const handleSearch = () => {
    navigation.navigate('NearbyShops', { 
      variety, 
      type, 
      size: selectedSize, 
      qty: quantity 
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        te="పరిమాణం ఎంచుకోండి" 
        en={`Step 3: Quantity for ${variety}`} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={TextStyles.sectionTitle}>ఎంత కావాలి? / How much?</Text>
        
        <View style={styles.sizeGrid}>
          {SIZES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.sizeCard, selectedSize === s.value && styles.sizeCardActive]}
              onPress={() => setSelectedSize(s.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sizeTe, selectedSize === s.value && styles.textActive]}>{s.te}</Text>
              <Text style={[styles.sizeEn, selectedSize === s.value && styles.textActive]}>{s.en}</Text>
              {s.value === 26 && !selectedSize && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[TextStyles.sectionTitle, { marginTop: 30 }]}>ఎన్ని బ్యాగులు? / How many bags?</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          
          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyVal}>{quantity}</Text>
            <Text style={styles.qtyUnit}>{quantity === 1 ? 'Bag' : 'Bags'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTe}>మీరు ఎంచుకున్నది:</Text>
          <Text style={styles.summaryVal}>
            {variety} ({type}) — {selectedSize}kg x {quantity} {quantity === 1 ? 'Bag' : 'Bags'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BigButton 
          te="షాపులు చూడండి" 
          en="Find Nearby Shops" 
          variant="orange"
          onPress={handleSearch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: 20 },
  sizeGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  sizeCard:  { 
    width: '30%', 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    paddingVertical: 16, 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: Colors.border,
  },
  sizeCardActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.primaryLight,
  },
  sizeTe: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  sizeEn: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  textActive: { color: Colors.primaryMid },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  qtyBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnText: { fontSize: 28, color: Colors.primary, fontWeight: 'bold' },
  qtyDisplay: { alignItems: 'center', minWidth: 80 },
  qtyVal: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary },
  qtyUnit: { fontSize: 14, color: Colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  summaryCard: {
    marginTop: 40,
    backgroundColor: Colors.primaryLight,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderStyle: 'dashed',
  },
  summaryTe: { fontSize: 14, fontWeight: 'bold', color: Colors.primaryMid, marginBottom: 4 },
  summaryVal: { fontSize: 16, color: Colors.primaryMid },
  footer: { padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});

export default SearchQuantity;
