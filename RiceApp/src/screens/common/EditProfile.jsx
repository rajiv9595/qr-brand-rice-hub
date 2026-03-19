// RiceApp/src/screens/common/EditProfile.jsx
// Premium Role-Aware Profile Management
// Upgraded to handle strict Trader (Supplier) business requirements (GST, Mill Name, etc.)

import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../api/authService';
import { useLocation } from '../../context/LocationContext';
import AppHeader from '../../components/common/AppHeader';

const EditProfile = () => {
  const navigation = useNavigation();
  const { user, setUser } = useContext(AuthContext);
  const { getCurrentLocation, locLoading } = useLocation();
  const [loading, setLoading] = useState(false);

  const isTrader = user?.role === 'supplier';

  // State handles both User and SupplierProfile (for Traders)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    millName: user?.millName || '',
    gstNumber: user?.gstNumber || '',
    traderType: user?.traderType || 'Retailer',
    upiId: user?.upiId || '',
    ifscCode: user?.ifscCode || '',
  });

  const [address, setAddress] = useState({
    village: user?.address?.village || '',
    city:    user?.address?.city    || user?.district || '',
    state:   user?.address?.state   || 'Andhra Pradesh',
    zipCode: user?.address?.zipCode || '',
    street:  user?.address?.street  || '',
  });

  const handleProfileChange = (field, val) => setProfile(prev => ({ ...prev, [field]: val }));
  const handleAddressChange = (field, val) => setAddress(prev => ({ ...prev, [field]: val }));

  const handleDetectLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setAddress(prev => ({
        ...prev,
        village: loc.name || '',
        city: loc.district || '',
        state: loc.state || '',
        zipCode: loc.pincode || prev.zipCode
      }));
    }
  };

  const validate = () => {
    if (!profile.name) { Alert.alert('Error', 'Full Name is required'); return false; }
    if (isTrader) {
      if (!profile.millName?.trim()) { Alert.alert('Error', 'Mill/Shop Name is mandatory for Traders'); return false; }
      if (!profile.gstNumber?.trim()) { Alert.alert('Error', 'GST Number is mandatory for Traders'); return false; }
      
      // STRICT GST VALIDATION: Indian Standard is exactly 15 chars
      const gstClean = profile.gstNumber.trim().toUpperCase();
      if (gstClean.length !== 15) {
          Alert.alert('Invalid GST', 'A professional GST number must be exactly 15 characters long.');
          return false;
      }

      if (!profile.upiId?.trim()) { Alert.alert('Error', 'UPI ID is required for receiving payments.'); return false; }
      if (!profile.ifscCode?.trim()) { Alert.alert('Error', 'Bank IFSC Code is mandatory for verification.'); return false; }

      if (!address.city) { Alert.alert('Error', 'District/City is required'); return false; }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Backend handles unified profile update
      const res = await authService.updateProfile({
        ...profile,
        address,
        district: address.city // Backend SupplierProfile uses district
      });

      if (res.data.success) {
        setUser(res.data.data);
        Alert.alert('Success', 'Business Profile updated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      Alert.alert('Sync Error', err.response?.data?.message || 'Failed to update professional profile');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, value, onChange, placeholder, icon, keyboard = 'default', multiline = false) => (
    <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
            <Icon name={icon} size={14} color={Colors.textSecondary} />
            <Text style={styles.label}>{label}</Text>
        </View>
        <TextInput 
          style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]} 
          value={value} 
          onChangeText={onChange} 
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboard}
          multiline={multiline}
        />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader te="ప్రొఫైల్ సవరించండి" en="Edit Profile" showBack={true} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* PERSONAL INFO */}
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Identity Details</Text>
             {renderInput("Full Name*", profile.name, v => handleProfileChange('name', v), "Your display name", "account-outline")}
             {renderInput("Phone Number", profile.phone, v => handleProfileChange('phone', v), "Active mobile number", "phone-outline", "phone-pad")}
          </View>

          {/* TRADER SPECIFIC: BUSINESS INFO */}
          {isTrader && (
             <View style={[styles.section, { borderLeftWidth: 4, borderLeftColor: Colors.primary }]}>
                <Text style={[styles.sectionTitle, { color: Colors.primary }]}>Business Profile (Mandatory)</Text>
                {renderInput("Mill/Shop Name*", profile.millName, v => handleProfileChange('millName', v), "e.g. Sri Rama Rice Mill", "store-outline")}
                {renderInput("GST Number*", profile.gstNumber, v => handleProfileChange('gstNumber', v), "15-digit GSTIN", "card-account-details-outline")}
                
                <View style={styles.halfRow}>
                  <View style={{ flex: 1 }}>
                    {renderInput("UPI ID*", profile.upiId, v => handleProfileChange('upiId', v), "e.g. name@upi", "rhombus-outline")}
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    {renderInput("IFSC Code*", profile.ifscCode, v => handleProfileChange('ifscCode', v), "e.g. SBIN00...", "bank-outline", "default")}
                  </View>
                </View>
             </View>
          )}

          {/* ADDRESS INFO */}
          <View style={styles.section}>
             <View style={styles.row}>
                <Text style={styles.sectionTitle}>Location & Address</Text>
                <TouchableOpacity style={styles.gpsBtn} onPress={handleDetectLocation} disabled={locLoading}>
                   {locLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : (
                     <>
                        <Icon name="crosshairs-gps" size={14} color={Colors.primary} />
                        <Text style={styles.gpsText}>AUTO DETECT</Text>
                     </>
                   )}
                </TouchableOpacity>
             </View>

             {renderInput("Village/Area", address.village, v => handleAddressChange('village', v), "Village name", "map-marker-outline")}
             {renderInput("City/District*", address.city, v => handleAddressChange('city', v), "e.g. Guntur", "city-variant-outline")}
             
             <View style={styles.halfRow}>
                <View style={{ flex: 1 }}>
                   {renderInput("Pincode*", address.zipCode, v => handleAddressChange('zipCode', v), "6 digits", "mailbox-outline", "numeric")}
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                   {renderInput("State*", address.state, v => handleAddressChange('state', v), "e.g. Andhra", "map-outline")}
                </View>
             </View>

             {renderInput("Full Street Address*", address.street, v => handleAddressChange('street', v), "H.No, Street, Landmark", "home-outline", "default", true)}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                    <Text style={styles.saveBtnText}>Save Final Profile</Text>
                    <Icon name="check-all" size={20} color="#FFF" />
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20 },
  section: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  
  inputGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, marginLeft: 2 },
  label: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase' },
  input: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    borderWidth: 1.5, 
    borderColor: '#F3F4F6', 
    color: Colors.textPrimary,
    fontWeight: '600'
  },
  
  halfRow: { flexDirection: 'row' },
  gpsBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: Colors.primaryLight, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  gpsText: { fontSize: 10, fontWeight: '900', color: Colors.primary },
  
  saveBtn: {
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  saveBtnText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
});

export default EditProfile;
