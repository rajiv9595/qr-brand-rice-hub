import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, 
  Platform, Image, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { traderService } from '../../api/traderService';
import { useLocation } from '../../context/LocationContext';
import { useLang } from '../../context/LangContext';
import AppHeader from '../../components/common/AppHeader';

const TraderEditProfile = () => {
  const navigation = useNavigation();
  const { user, setUser, logout } = useContext(AuthContext);
  const { lang, t } = useLang();
  const { getCurrentLocation, locLoading } = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    millName: '',
    traderType: 'Retailer',
    gstNumber: '',
    gstRegistrationYears: '',
    address: '',
    district: '',
    state: '',
    lat: null,
    lng: null,
    upiId: '',
    phone: user?.phone || '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branchName: '',
    },
  });

  const [shopPhoto, setShopPhoto] = useState(null);
  const [initialPhotoUrl, setInitialPhotoUrl] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await traderService.getProfile();
      if (res.data.success) {
        const p = res.data.data;
        setFormData({
          millName: p.millName || '',
          traderType: p.traderType || 'Retailer',
          gstNumber: p.gstNumber || '',
          gstRegistrationYears: p.gstRegistrationYears?.toString() || '',
          address: p.address || '',
          district: p.district || '',
          state: p.state || '',
          lat: p.location?.coordinates?.[1] || null,
          lng: p.location?.coordinates?.[0] || null,
          upiId: p.upiId || '',
          phone: p.userId?.phone || user?.phone || '',
          bankDetails: {
            accountHolderName: p.bankDetails?.accountHolderName || '',
            accountNumber: p.bankDetails?.accountNumber || '',
            bankName: p.bankDetails?.bankName || '',
            ifscCode: p.bankDetails?.ifscCode || '',
            branchName: p.bankDetails?.branchName || '',
          },
        });
        setInitialPhotoUrl(p.shopPhotoUrl);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again to continue.', [
          { text: 'Login', onPress: () => logout() }
        ]);
      } else if (err.response?.status !== 404) {
        console.warn('Profile load error:', err);
      }
      // If 404, it's a new user, so we just keep empty form
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleBankChange = (field, value) => setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));

  const pickImage = async () => {
    const options = { mediaType: 'photo', quality: 0.7 };
    const result = await launchImageLibrary(options);
    if (result.assets?.length > 0) setShopPhoto(result.assets[0]);
  };

  const handleGetLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setFormData(v => ({ 
        ...v, 
        lat: loc.lat, 
        lng: loc.lng,
        district: loc.district || v.district,
        state: loc.state || v.state,
        address: loc.name ? `${loc.name}, ${loc.district}` : v.address
      }));
      Alert.alert(t('Success'), 'Location detected successfully!');
    } else {
      Alert.alert(t('Error'), 'GPS error or permission denied');
    }
  };

  const handleSave = async () => {
    if (!formData.millName || !formData.district || !formData.state) {
      return Alert.alert('Error', 'Mill Name, District and State are required');
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => {
        if (k === 'bankDetails') {
           data.append(k, JSON.stringify(formData[k]));
        } else if (formData[k] !== null && formData[k] !== undefined) {
           data.append(k, formData[k]);
        }
      });

      if (shopPhoto) {
        data.append('shopPhoto', { 
          uri: shopPhoto.uri, 
          type: shopPhoto.type || 'image/jpeg', 
          name: 'shop.jpg' 
        });
      }

      const res = await traderService.updateProfile(data);
      if (res.data.success) {
        const p = res.data.data;
        const updatedUser = {
          ...user,
          millName: p.millName,
          gstNumber: p.gstNumber,
          gstRegistrationYears: p.gstRegistrationYears,
          district: p.district,
          state: p.state,
          address: p.address,
          shopPhotoUrl: p.shopPhotoUrl,
          trustScore: p.trustScore,
          isVerified: p.userId?.isVerified ?? user?.isVerified
        };
        setUser(updatedUser);
        await require('@react-native-async-storage/async-storage').default.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <AppHeader te="ప్రొఫైల్ సవరించండి" en="Edit Professional Profile" showBack={true} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Section: Business Identity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <Icon name="store" size={18} color={Colors.primary} />
               <Text style={styles.sectionTitle}>Edit Business Details</Text>
            </View>
            <Text style={styles.sectionSub}>Update your mill information and location</Text>

            <Text style={styles.label}>Shop / Mill Name *</Text>
            <TextInput 
              style={styles.input} 
              value={formData.millName} 
              onChangeText={v => handleInputChange('millName', v)}
              placeholder="e.g., Sri Ram Rice Shop"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Trader Type</Text>
                <View style={styles.pickerContainer}>
                   <TouchableOpacity 
                     style={[styles.pickerBtn, formData.traderType === 'Retailer' && styles.pickerBtnActive]}
                     onPress={() => handleInputChange('traderType', 'Retailer')}
                   >
                      <Text style={[styles.pickerTxt, formData.traderType === 'Retailer' && styles.pickerTxtActive]}>Retailer</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     style={[styles.pickerBtn, formData.traderType === 'Wholesaler' && styles.pickerBtnActive]}
                     onPress={() => handleInputChange('traderType', 'Wholesaler')}
                   >
                      <Text style={[styles.pickerTxt, formData.traderType === 'Wholesaler' && styles.pickerTxtActive]}>Wholesaler</Text>
                   </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                 <Text style={styles.label}>Shop Photograph</Text>
                 <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage}>
                    {shopPhoto ? (
                      <Image source={{ uri: shopPhoto.uri }} style={styles.photoPreview} />
                    ) : initialPhotoUrl ? (
                      <Image source={{ uri: initialPhotoUrl }} style={styles.photoPreview} />
                    ) : (
                      <Icon name="camera" size={20} color={Colors.textMuted} />
                    )}
                    <Text style={styles.photoUploadTxt}>{shopPhoto || initialPhotoUrl ? 'Change' : 'Upload'}</Text>
                 </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1.5, marginRight: 10 }}>
                <Text style={styles.label}>GST Number</Text>
                <TextInput 
                   style={styles.input} 
                   value={formData.gstNumber} 
                   onChangeText={v => handleInputChange('gstNumber', v)}
                   placeholder="e.g., 29ABCDE1234F1Z"
                   placeholderTextColor={Colors.textMuted}
                   autoCapitalize="characters"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>GST Years</Text>
                <TextInput 
                   style={styles.input} 
                   value={formData.gstRegistrationYears} 
                   onChangeText={v => handleInputChange('gstRegistrationYears', v)}
                   placeholder="e.g., 5"
                   placeholderTextColor={Colors.textMuted}
                   keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>State *</Text>
                <TextInput style={styles.input} value={formData.state} onChangeText={v => handleInputChange('state', v)} placeholder="Andhra Pradesh" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>District *</Text>
                <TextInput style={styles.input} value={formData.district} onChangeText={v => handleInputChange('district', v)} placeholder="Guntur" />
              </View>
            </View>

            <Text style={styles.label}>Set Location Coordinates *</Text>
            <TouchableOpacity 
              style={[styles.locBtn, formData.lat && styles.locBtnSet]} 
              onPress={handleGetLocation}
              disabled={locLoading}
            >
               {locLoading ? <ActivityIndicator size="small" color="#fff" /> : (
                 <>
                   <Icon name="location-arrow" size={14} color="#fff" />
                   <Text style={styles.locBtnTxt}>{formData.lat ? 'Location Updated ✅' : 'USE CURRENT LOCATION'}</Text>
                 </>
               )}
            </TouchableOpacity>
          </View>

          {/* Section: Bank & Payments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <Icon name="university" size={18} color={Colors.primary} />
               <Text style={styles.sectionTitle}>Bank & Payment Verification</Text>
            </View>
            
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.bankDetails.accountHolderName} 
              onChangeText={v => handleBankChange('accountHolderName', v)}
              placeholder="Proper name as per bank"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Bank Account Number</Text>
            <TextInput 
              style={styles.input} 
              value={formData.bankDetails.accountNumber} 
              onChangeText={v => handleBankChange('accountNumber', v)}
              placeholder="e.g., 50100012345678"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                 <Text style={styles.label}>Bank Name</Text>
                 <TextInput style={styles.input} value={formData.bankDetails.bankName} onChangeText={v => handleBankChange('bankName', v)} placeholder="HDFC Bank" />
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={styles.label}>IFSC Code</Text>
                 <TextInput style={styles.input} value={formData.bankDetails.ifscCode} onChangeText={v => handleBankChange('ifscCode', v)} placeholder="HDFC0001" autoCapitalize="characters" />
              </View>
            </View>

            <Text style={styles.label}>UPI ID for Payments</Text>
            <TextInput 
              style={[styles.input, { borderColor: Colors.primary }]} 
              value={formData.upiId} 
              onChangeText={v => handleInputChange('upiId', v)}
              placeholder="mobile-number@upi"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.note}>Note: These details will be shown to buyers after order confirmation.</Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
             {loading ? <ActivityIndicator color="#fff" /> : (
               <>
                 <Icon name="save" size={18} color="#fff" style={{ marginRight: 10 }} />
                 <Text style={styles.saveBtnTxt}>Save Changes</Text>
               </>
             )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  section: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 8, marginTop: 10 },
  input: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 15, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    marginBottom: 5, 
    color: '#111827' 
  },
  row: { flexDirection: 'row' },
  pickerContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4, height: 46 },
  pickerBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  pickerBtnActive: { backgroundColor: '#fff', elevation: 2 },
  pickerTxt: { fontSize: 13, color: '#6B7280', fontWeight: 'bold' },
  pickerTxtActive: { color: Colors.primary },
  photoUploadBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    height: 46, 
    backgroundColor: '#F9FAFB',
    gap: 8
  },
  photoPreview: { width: 30, height: 30, borderRadius: 15 },
  photoUploadTxt: { fontSize: 12, fontWeight: 'bold', color: Colors.textPrimary },
  locBtn: { 
    backgroundColor: '#6B7280', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    padding: 14, 
    borderRadius: 10, 
    marginTop: 10 
  },
  locBtnSet: { backgroundColor: Colors.primary },
  locBtnTxt: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  note: { fontSize: 11, color: Colors.textMuted, marginTop: 5, fontStyle: 'italic' },
  saveBtn: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderRadius: 12, 
    elevation: 4 
  },
  saveBtnTxt: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default TraderEditProfile;
