// EditProduct.jsx
// Trader Product Edit Screen.
// Connected to backend: PUT /api/rice/:id

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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

export default function EditProduct() {
  const navigation = useNavigation();
  const route = useRoute();
  const { listing } = route.params || {};

  const [variety, setVariety] = useState(listing?.riceVariety || '');
  const [type, setType] = useState(listing?.riceType || '');
  const [prices, setPrices] = useState({});
  const [stock, setStock] = useState(listing?.stockAvailable?.toString() || '100');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (listing?.packPrices) {
      const pMap = {};
      listing.packPrices.forEach(p => {
        pMap[parseInt(p.size)] = p.price.toString();
      });
      setPrices(pMap);
    } else if (listing?.pricePerBag) {
      setPrices({ [listing.bagWeightKg || 26]: listing.pricePerBag.toString() });
    }
  }, [listing]);

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

  const handleUpdate = async () => {
    if (!variety || !type || Object.keys(prices).length === 0) {
      Alert.alert('తప్పు', 'దయచేసి అన్ని వివరాలను నింపండి.');
      return;
    }
    setLoading(true);
    try {
      const packPrices = Object.entries(prices)
        .filter(([_, price]) => price && Number(price) > 0)
        .map(([size, price]) => ({ size: size + 'kg', price: Number(price) }));

      const mainPack = packPrices.find(p => p.size === '26kg') || packPrices[packPrices.length - 1];

      const formData = new FormData();
      formData.append('brandName', variety);
      formData.append('riceVariety', variety);
      formData.append('riceType', type);
      formData.append('pricePerBag', mainPack.price);
      formData.append('bagWeightKg', parseInt(mainPack.size));
      formData.append('stockAvailable', stock);
      formData.append('packPrices', JSON.stringify(packPrices));

      await riceService.updateListing(listing._id, formData);

      Alert.alert('విజయం!', 'వివరాలు నవీకరించబడ్డాయి.');
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update listing', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'తొలగించు?',
      'ఈ ఉత్పత్తిని నిజంగా తొలగించాలనుకుంటున్నారా?',
      [
        { text: 'లేదు (No)', style: 'cancel' },
        { 
          text: 'అవును (Yes)', 
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await riceService.deleteListing(listing._id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete product.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader te="వివరాలను సవరించండి" en="Edit Product Details" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          
          <Text style={TextStyles.sectionTitle}>1. బియ్యం రకం (Rice Variety)</Text>
          <ChipSelector 
            options={RICE_VARIETIES} 
            selected={variety} 
            onSelect={setVariety} 
          />

          <Text style={TextStyles.sectionTitle}>2. ప్రాసెసింగ్ రకం (Rice Type)</Text>
          <ChipSelector 
            options={RICE_TYPES} 
            selected={type} 
            onSelect={setType} 
          />

          <Text style={TextStyles.sectionTitle}>3. స్టాక్ (Stock Available)</Text>
          <View style={styles.stockSection}>
            <TextInput 
              style={styles.stockInput}
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
              placeholder="100"
            />
            <Text style={styles.unitText}>Bags</Text>
          </View>

          <Text style={TextStyles.sectionTitle}>4. ధరలు (Prices)</Text>
          <View style={styles.priceSection}>
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
                        placeholder="0"
                        value={prices[size.value]}
                        onChangeText={(val) => updatePrice(size.value, val)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.actions}>
            <BigButton 
              te="మార్పులను సేవ్ చేయండి" 
              en="Save Changes" 
              onPress={handleUpdate}
              loading={loading}
              style={styles.saveBtn}
            />

            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#FF4444" size="small" />
              ) : (
                <Text style={styles.deleteText}>ఉత్పత్తిని తొలగించండి / Delete Product</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  stockSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stockInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  unitText: { fontSize: 16, fontWeight: 'bold', color: Colors.textSecondary },
  priceSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  priceRowActive: { borderBottomColor: Colors.primaryBorder },
  sizeBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  sizeLabel: { fontSize: 16, color: Colors.textPrimary },
  sizeLabelActive: { color: Colors.primary, fontWeight: 'bold' },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    width: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currency: { fontSize: 14, fontWeight: 'bold', color: Colors.textSecondary, marginRight: 4 },
  priceInput: { flex: 1, height: 40, fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  actions: { paddingHorizontal: 16, marginTop: 30, gap: 16 },
  saveBtn: { marginBottom: 10 },
  deleteBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF4444',
  },
  deleteText: { color: '#FF4444', fontWeight: 'bold', fontSize: 14 },
});
