// SearchType.jsx
// Step 2 of 3: Pick Rice Type (Raw, Steam, Boiled, etc.)
// Designed for quick visual selection.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';

const TYPES = [
  { key: 'Raw',    te: 'పచ్చి బియ్యం',          icon: '🌾' },
  { key: 'Steam',  te: 'ఉడికిన బియ్యం',         icon: '♨️' },
  { key: 'Boiled', te: 'ఉడకబెట్టిన బియ్యం',     icon: '🫕' },
  { key: 'Brown',  te: 'బ్రౌన్ రైస్',           icon: '🟤' },
];

const SearchType = () => {
  const navigation = useNavigation();
  const route      = useRoute();
  const { variety } = route.params || {};
  const [selected, setSelected] = useState(null);

  const handleNext = () => {
    if (!selected) return;
    navigation.navigate('SearchQuantity', { variety, type: selected });
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        te="రకం ఎంచుకోండి" 
        en={`Step 2: Pick type for ${variety}`} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={TextStyles.sectionTitle}>ఏ రకం కావాలి? / Which type?</Text>
        
        <View style={styles.grid}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.card, selected === t.key && styles.cardActive]}
              onPress={() => setSelected(t.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, selected === t.key && styles.iconWrapActive]}>
                <Text style={styles.icon}>{t.icon}</Text>
              </View>
              <Text style={styles.cardTe}>{t.te}</Text>
              <Text style={styles.cardEn}>{t.key}</Text>
              
              {selected === t.key && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BigButton 
          te="తరువాత (Next)" 
          en="Choose Quantity" 
          disabled={!selected}
          onPress={handleNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: 20 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  card:      { 
    width: '47%', 
    backgroundColor: Colors.white, 
    borderRadius: 24, 
    padding: 20, 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  cardActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.primaryLight,
    elevation: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconWrapActive: {
    backgroundColor: Colors.white,
  },
  icon: { fontSize: 32 },
  cardTe: { 
    fontSize: Typography.size.base, 
    fontWeight: 'bold', 
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cardEn: { 
    fontSize: Typography.size.xs, 
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  checkText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  footer: { padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});

export default SearchType;
