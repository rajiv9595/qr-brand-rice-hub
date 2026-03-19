import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Image, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import { traderService } from '../../api/traderService';
import { useLocation } from '../../context/LocationContext';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';

const TraderSetup = () => {
  const navigation = useNavigation();
  const { lang, t } = useLang();
  const { getCurrentLocation } = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    millName: '',
    ownerName: '',
    traderType: 'Retailer',
    gstNumber: '',
    gstRegistrationYears: '',
    address: '',
    district: '',
    state: '',
    lat: null,
    lng: null,
    upiId: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branchName: '',
    },
  });

  const [shopPhoto, setShopPhoto] = useState(null);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleBankChange = (field, value) => setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));

  const pickImage = async () => {
    const options = { mediaType: 'photo', quality: 0.7 };
    const result = await launchImageLibrary(options);
    if (result.assets?.length > 0) setShopPhoto(result.assets[0]);
  };

  const handleGetLocation = async () => {
    setLoading(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setFormData(v => ({ 
        ...v, 
        lat: loc.lat, 
        lng: loc.lng,
        district: loc.district || v.district,
        state: loc.state || v.state,
      }));
      Alert.alert(t('Success'), `${loc.name}, ${loc.district} (${loc.pincode || 'Pincode Auto-filled'})\nLocation detected and set!`);
    } else {
      Alert.alert(t('Error'), 'GPS error or permission denied');
    }
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1 && (!formData.millName || !formData.ownerName)) return Alert.alert('Error', 'Fill details');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => {
        if (k === 'bankDetails') data.append(k, JSON.stringify(formData[k]));
        else data.append(k, formData[k]);
      });
      if (shopPhoto) data.append('shopPhoto', { uri: shopPhoto.uri, type: shopPhoto.type || 'image/jpeg', name: 'shop.jpg' });

      await traderService.updateProfile(data);
      navigation.navigate('TraderDashboard');
    } catch (err) {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader te="షాపు సెటప్" hi="शॉप सेटअप" en="Shop Setup" showBack={step > 1} onBack={() => setStep(step - 1)} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          <View style={styles.progBar}>
             {[1, 2, 3, 4].map(s => <View key={s} style={[styles.progDot, step >= s && styles.progDotActive]} />)}
          </View>

          {step === 1 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>1. Shop Identity</Text>
              <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
                 {shopPhoto ? <Image source={{ uri: shopPhoto.uri }} style={styles.photoPreview} /> : (
                   <View style={styles.photoPlaceholder}>
                      <Icon name="camera" size={40} color="#666" />
                      <Text style={styles.photoLabel}>Take Shop Photo</Text>
                   </View>
                 )}
              </TouchableOpacity>
              <Text style={styles.inputLabel}>Shop/Mill Name*</Text>
              <TextInput style={styles.input} placeholder="e.g. Sri Lakshmi Rice Mill" placeholderTextColor="#777" value={formData.millName} onChangeText={v => handleInputChange('millName', v)} />
              <Text style={styles.inputLabel}>Owner Name*</Text>
              <TextInput style={styles.input} placeholder="e.g. Ramesh Reddy" placeholderTextColor="#777" value={formData.ownerName} onChangeText={v => handleInputChange('ownerName', v)} />
              <BigButton te="తరువాత" en="Next Step" onPress={nextStep} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>2. Location & Business</Text>
              <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation}>
                <Icon name="map-marker" size={20} color="#fff" />
                <Text style={styles.locationBtnText}>{formData.lat ? 'Location Set ✅' : 'Set My Current Location'}</Text>
              </TouchableOpacity>
              <Text style={styles.inputLabel}>GST Number</Text>
              <TextInput style={styles.input} placeholder="29ABCDE1234F1Z5" placeholderTextColor="#777" value={formData.gstNumber} onChangeText={v => handleInputChange('gstNumber', v)} />
              <Text style={styles.inputLabel}>District*</Text>
              <TextInput style={styles.input} placeholder="e.g. Guntur" placeholderTextColor="#777" value={formData.district} onChangeText={v => handleInputChange('district', v)} />
              <Text style={styles.inputLabel}>Full Address*</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Flat No, Street, Landmark..." placeholderTextColor="#777" value={formData.address} onChangeText={v => handleInputChange('address', v)} />
              <BigButton te="తరువాత" en="Next Step" onPress={nextStep} />
            </View>
          )}

          {step === 3 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>3. Payment Info</Text>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Bank Account No" placeholderTextColor="#777" value={formData.bankDetails.accountNumber} onChangeText={v => handleBankChange('accountNumber', v)} />
              <Text style={styles.inputLabel}>IFSC Code</Text>
              <TextInput style={styles.input} placeholder="SBIN0001" placeholderTextColor="#777" autoCapitalize="characters" value={formData.bankDetails.ifscCode} onChangeText={v => handleBankChange('ifscCode', v)} />
              <Text style={styles.inputLabel}>UPI ID (Very Important)*</Text>
              <TextInput style={[styles.input, { borderColor: Colors.primary }]} placeholder="mobile@upi" placeholderTextColor="#777" value={formData.upiId} onChangeText={v => handleInputChange('upiId', v)} />
              <BigButton te="తరువాత" en="Finish Step" onPress={nextStep} />
            </View>
          )}

          {step === 4 && (
            <View style={styles.step}>
               <Icon name="check-circle" size={80} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 20 }} />
               <Text style={styles.finishTitle}>Ready to Go!</Text>
               <BigButton te="పూర్తి చేసి వెబ్" en="Finish Setup" onPress={handleSubmit} loading={loading} />
            </View>
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  progBar: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 25 },
  progDot: { width: 35, height: 5, borderRadius: 3, backgroundColor: '#DDD' },
  progDotActive: { backgroundColor: Colors.primary },
  stepTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 20 },
  photoBox: { width: '100%', height: 180, borderRadius: 20, backgroundColor: '#fff', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CCC', overflow: 'hidden', marginBottom: 20 },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { fontSize: 13, fontWeight: 'bold', color: '#888', marginTop: 10 },
  photoPreview: { width: '100%', height: '100%' },
  inputLabel: { fontSize: 14, fontWeight: '900', color: '#333', marginBottom: 8 },
  input: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 14, 
    padding: 15, 
    fontSize: 16, 
    borderWidth: 1.5, 
    borderColor: '#AAA', 
    marginBottom: 18, 
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 15, marginBottom: 20 },
  locationBtnText: { color: '#fff', fontWeight: 'bold' },
  finishTitle: { fontSize: 24, fontWeight: '900', color: '#333', textAlign: 'center', marginBottom: 30 },
});

export default TraderSetup;
