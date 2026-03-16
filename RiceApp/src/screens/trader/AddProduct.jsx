// AddProduct.jsx
// Trader Product Creation Screen.
// Connected to real backend: POST /api/rice

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import ChipSelector from '../../components/common/ChipSelector';
import BigButton from '../../components/common/BigButton';
import { riceService } from '../../api/riceService';

const RICE_VARIETIES = [
  { value: 'Sona Masuri', te: 'సోనా మసూరి', en: 'Sona Masuri' },
  { value: 'BPT 5204',    te: 'బి.పి.టి 5204', en: 'BPT 5204' },
  { value: 'Basmati',     te: 'బాస్మతి', en: 'Basmati' },
  { value: 'HMT',         te: 'హెచ్.ఎం.టి', en: 'HMT' },
  { value: 'Other',       te: 'ఇతర రకాలు', en: 'Other' },
];

const RICE_TYPES = [
  { value: 'Raw',    te: 'పచ్చి బియ్యం',          en: 'Raw' },
  { value: 'Steam',  te: 'ఉడికిన బియ్యం',         en: 'Steam' },
  { value: 'Boiled', te: 'ఉడకబెట్టిన బియ్యం',     en: 'Boiled' },
  { value: 'Brown',  te: 'బ్రౌన్ రైస్',           en: 'Brown' },
];

const PACK_SIZES = [
  { value: 1,  label: '1 kg' },
  { value: 5,  label: '5 kg' },
  { value: 10, label: '10 kg' },
  { value: 26, label: '26 kg' },
  { value: 50, label: '50 kg' },
];

export default function AddProduct() {
  const navigation = useNavigation();
  const [variety, setVariety] = useState('');
  const [type, setType] = useState('');
  const [prices, setPrices] = useState({}); // { size: price }
  const [loading, setLoading] = useState(false);

  const toggleSize = (size) => {
    const newPrices = { ...prices };
    if (newPrices[size] !== undefined) {
      delete newPrices[size];
    } else {
      newPrices[size] = '';
    }
    setPrices(newPrices);
  };

  const updatePrice = (size, price) => {
    setPrices({ ...prices, [size]: price });
  };

  const handleSave = async () => {
    if (!variety || !type || Object.keys(prices).length === 0) {
      Alert.alert('తప్పు', 'దయచేసి అన్ని వివరాలను నింపండి.');
      return;
    }
    setLoading(true);
    try {
      // Build packPrices array matching backend schema
      const packPrices = Object.entries(prices)
        .filter(([_, price]) => price && Number(price) > 0)
        .map(([size, price]) => ({ size: size + 'kg', price: Number(price) }));

      // Find the main bag price (26kg is standard, fallback to largest)
      const mainPack = packPrices.find(p => p.size === '26kg') || packPrices[packPrices.length - 1];

      const formData = new FormData();
      formData.append('brandName', variety); // Use variety as brand for simplicity
      formData.append('riceVariety', variety);
      formData.append('riceType', type);
      formData.append('pricePerBag', mainPack.price);
      formData.append('bagWeightKg', parseInt(mainPack.size));
      formData.append('usageCategory', 'Daily Cooking');
      formData.append('priceCategory', mainPack.price > 1500 ? 'Premium Rice' : 'Budget Friendly Rice');
      formData.append('stockAvailable', '100');
      formData.append('packPrices', JSON.stringify(packPrices));

      await riceService.createListing(formData);

      Alert.alert('విజయం!', 'ఉత్పత్తి విజయవంతంగా జోడించబడింది.\nAdmin approval pending.');
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create listing', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader te="కొత్త బియ్యం జోడించండి" en="Add New Rice Product" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          
          {/* Variety Selection */}
          <Text style={TextStyles.sectionTitle}>1. బియ్యం రకం (Rice Variety)</Text>
          <ChipSelector 
            options={RICE_VARIETIES} 
            selected={variety} 
            onSelect={setVariety} 
            style={styles.chipScroll}
          />

          {/* Type Selection */}
          <Text style={TextStyles.sectionTitle}>2. ప్రాసెసింగ్ రకం (Rice Type)</Text>
          <ChipSelector 
            options={RICE_TYPES} 
            selected={type} 
            onSelect={setType} 
            style={styles.chipScroll}
          />

          {/* Pricing Section */}
          <Text style={TextStyles.sectionTitle}>3. ధరలు సెట్ చేయండి (Set Prices)</Text>
          <View style={styles.priceSection}>
            <Text style={styles.priceHint}>మీరు అమ్మే సైజులను ఎంచుకుని, వాటి ధరలను నమోదు చేయండి:</Text>
            
            {PACK_SIZES.map((size) => {
              const isActive = prices[size.value] !== undefined;
              return (
                <View key={size.value} style={[styles.priceRow, isActive && styles.priceRowActive]}>
                  <TouchableOpacity 
                    onPress={() => toggleSize(size.value)}
                    style={styles.sizeBtn}
                  >
                    <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                      {isActive && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <Text style={[styles.sizeLabel, isActive && styles.sizeLabelActive]}>{size.label}</Text>
                  </TouchableOpacity>
                  
                  {isActive && (
                    <View style={styles.priceInputWrap}>
                      <Text style={styles.currency}>₹</Text>
                      <TextInput 
                        style={styles.priceInput}
                        keyboardType="numeric"
                        placeholder="0.00"
                        value={prices[size.value]}
                        onChangeText={(val) => updatePrice(size.value, val)}
                        autoFocus={true}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Photos Placeholder (Next Phase) */}
          <Text style={TextStyles.sectionTitle}>4. ఫోటోలు (Photos)</Text>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>📸 ఫోటోలు తీయడానికి క్లిక్ చేయండి</Text>
          </View>

          <BigButton 
            te="ఉత్పత్తిని జోడించండి" 
            en="Add Product" 
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chipScroll: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  priceSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  priceHint: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  priceRowActive: {
    borderBottomColor: Colors.primaryBorder,
  },
  sizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sizeLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  sizeLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    width: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currency: {
    fontSize: Typography.size.base,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    height: 44,
    fontSize: Typography.size.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: Typography.size.base,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  saveBtn: {
    marginTop: 30,
    marginHorizontal: 16,
  },
});
