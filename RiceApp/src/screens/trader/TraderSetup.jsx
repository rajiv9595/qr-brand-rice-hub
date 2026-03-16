// TraderSetup.jsx
// Wizard to help new traders set up their shop.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';
import { traderService } from '../../api/traderService';
import { useLocation } from '../../context/LocationContext';

export default function TraderSetup() {
  const navigation = useNavigation();
  const { location, getCurrentLocation } = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [traderType, setTraderType] = useState('retailer'); // wholesaler | retailer
  const [shopPhoto, setShopPhoto] = useState(null);
  const [latLng, setLatLng] = useState(null);

  const handleNext = () => {
    if (step === 2 && (!shopName || !ownerName)) {
      Alert.alert('తప్పు', 'దయచేసి అన్ని వివరాలను నింపండి.');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleGetLocation = async () => {
    setLoading(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setLatLng(loc.coords);
      Alert.alert('విజయం!', 'మీ లొకేషన్ సెట్ చేయబడింది.');
      setStep(4);
    } else {
      Alert.alert('క్షమించండి', 'లొకేషన్ పొందలేకపోయాము. దయచేసి GPS ఆన్ చేయండి.');
    }
    setLoading(false);
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const data = {
        shopName,
        ownerName,
        traderType,
        location: {
          type: 'Point',
          coordinates: [latLng.longitude, latLng.latitude],
        },
      };
      
      await traderService.updateProfile(data);
      navigation.navigate('TraderDashboard');
    } catch (err) {
      console.error('Failed to finish setup', err);
      Alert.alert('Error', 'Failed to save shop details.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
       <Text style={styles.stepLabel}>Step 1/4: Shop Photo</Text>
       <Text style={styles.stepTe}>మీ షాపు ఫోటో తీయండి (Take Shop Photo)</Text>
       <TouchableOpacity style={styles.photoBox}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoText}>Click to take photo</Text>
       </TouchableOpacity>
       <BigButton te="తరువాత (Next)" en="Step 2: Shop Details" onPress={handleNext} style={styles.nextBtn} />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
       <Text style={styles.stepLabel}>Step 2/4: Shop Details</Text>
       
       <Text style={styles.inputLabelTe}>షాపు పేరు (Shop Name):</Text>
       <TextInput 
         style={styles.input} 
         placeholder="e.g. Sri Lakshmi Rice Store" 
         value={shopName}
         onChangeText={setShopName}
       />

       <Text style={styles.inputLabelTe}>యజమాని పేరు (Owner Name):</Text>
       <TextInput 
         style={styles.input} 
         placeholder="e.g. Ramesh Kumar" 
         value={ownerName}
         onChangeText={setOwnerName}
       />

       <Text style={styles.inputLabelTe}>మీరు ఎవరు? (I am a):</Text>
       <View style={styles.typeGrid}>
          <TouchableOpacity 
            style={[styles.typeCard, traderType === 'wholesaler' && styles.typeActive]}
            onPress={() => setTraderType('wholesaler')}
          >
             <Text style={styles.typeIcon}>📦</Text>
             <Text style={styles.typeTe}>హోల్‌సేలర్</Text>
             <Text style={styles.typeEn}>Wholesaler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeCard, traderType === 'retailer' && styles.typeActive]}
            onPress={() => setTraderType('retailer')}
          >
             <Text style={styles.typeIcon}>🏪</Text>
             <Text style={styles.typeTe}>రిటైలర్</Text>
             <Text style={styles.typeEn}>Retailer</Text>
          </TouchableOpacity>
       </View>

       <BigButton te="తరువాత (Next)" en="Step 3: Location" onPress={handleNext} style={styles.nextBtn} />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
       <Text style={styles.stepLabel}>Step 3/4: Location</Text>
       <Text style={styles.stepTe}>మీ షాపు లొకేషన్ సెట్ చేయండి (Set Shop Location)</Text>
       
       <TouchableOpacity style={styles.locationBox} onPress={handleGetLocation} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} size="large" />
          ) : (
            <>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>Use My Current Location</Text>
              <Text style={styles.locationSub}>ఒక్కసారి క్లిక్ చేయండి (Click once)</Text>
            </>
          )}
       </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
       <Text style={styles.stepIconBig}>✅</Text>
       <Text style={styles.finishTe}>అంతా సిద్ధం! (All Set!)</Text>
       <Text style={styles.finishEn}>Your shop setup is complete. You can now start adding products.</Text>
       
       <BigButton te="ముగించు (Finish)" en="Go to Dashboard" onPress={handleFinish} loading={loading} style={styles.nextBtn} />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader te="షాపు సెటప్" en="Shop Setup Wizard" showBack={step > 1} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24 },
  stepContent: { alignItems: 'center' },
  stepLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.primary, marginBottom: 8, textTransform: 'uppercase' },
  stepTe: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 30 },
  photoBox: { width: '100%', height: 200, borderRadius: 24, backgroundColor: Colors.white, borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  photoIcon: { fontSize: 48, marginBottom: 12 },
  photoText: { fontSize: 16, color: Colors.textMuted, fontWeight: 'bold' },
  inputLabelTe: { fontSize: 14, fontWeight: 'bold', color: Colors.textSecondary, alignSelf: 'flex-start', marginBottom: 8 },
  input: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  typeGrid: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  typeCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  typeActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeIcon: { fontSize: 32, marginBottom: 8 },
  typeTe: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  typeEn: { fontSize: 10, color: Colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  locationBox: { width: '100%', padding: 40, borderRadius: 24, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  locationIcon: { fontSize: 48, marginBottom: 12 },
  locationText: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  locationSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  finishTe: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  finishEn: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  stepIconBig: { fontSize: 80, marginBottom: 20 },
  nextBtn: { marginTop: 20 },
});
