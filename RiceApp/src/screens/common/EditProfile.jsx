import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../api/authService';
import { useLocation } from '../../context/LocationContext';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';

const EditProfile = () => {
  const navigation = useNavigation();
  const { user, setUser } = useContext(AuthContext);
  const { getCurrentLocation, locLoading } = useLocation();
  const [loading, setLoading] = useState(false);

  // Profile Data
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Address Data
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    village: user?.address?.village || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Andhra Pradesh',
    zipCode: user?.address?.zipCode || '',
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
      Alert.alert('Success', `Location detected: ${loc.name}, ${loc.district} (${loc.pincode || 'Auto-set'})`);
    } else {
      Alert.alert('Error', 'Could not fetch location. Please check GPS permissions.');
    }
  };

  const handleSave = async () => {
    if (!profile.name) return Alert.alert('Error', 'Name is required');
    setLoading(true);
    try {
      const res = await authService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        address: address
      });

      if (res.data.success) {
        setUser(res.data.data);
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

  return (
    <View style={styles.container}>
      <AppHeader te="ప్రొఫైల్ సవరించండి" en="Edit Profile" showBack={true} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Personal Information</Text>
             <Text style={styles.label}>Full Name*</Text>
             <TextInput 
               style={styles.input} 
               value={profile.name} 
               onChangeText={v => handleProfileChange('name', v)}
               placeholder="Enter your name"
               placeholderTextColor={Colors.textMuted}
             />
             <Text style={styles.label}>Phone Number</Text>
             <TextInput 
               style={styles.input} 
               value={profile.phone} 
               onChangeText={v => handleProfileChange('phone', v)}
               keyboardType="phone-pad"
               placeholder="Enter mobile number"
               placeholderTextColor={Colors.textMuted}
             />
          </View>

          <View style={styles.section}>
             <View style={styles.row}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <TouchableOpacity style={styles.gpsBtn} onPress={handleDetectLocation} disabled={locLoading}>
                   {locLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : (
                     <>
                        <Icon name="map-marker" size={12} color={Colors.primary} />
                        <Text style={styles.gpsText}>Detect GPS</Text>
                     </>
                   )}
                </TouchableOpacity>
             </View>

             <Text style={styles.label}>Village / Area</Text>
             <TextInput 
               style={styles.input} 
               value={address.village} 
               onChangeText={v => handleAddressChange('village', v)}
               placeholder="e.g. Mellempudi"
               placeholderTextColor={Colors.textMuted}
             />

             <Text style={styles.label}>House No / Street*</Text>
             <TextInput 
               style={[styles.input, { height: 80 }]} 
               multiline
               value={address.street} 
               onChangeText={v => handleAddressChange('street', v)}
               placeholder="Door No, Street name, Landmark"
               placeholderTextColor={Colors.textMuted}
             />

             <View style={styles.halfRow}>
               <View style={{ flex: 1, marginRight: 10 }}>
                 <Text style={styles.label}>City/District*</Text>
                 <TextInput style={styles.input} value={address.city} onChangeText={v => handleAddressChange('city', v)} placeholder="Guntur" placeholderTextColor={Colors.textMuted} />
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.label}>Pincode*</Text>
                 <TextInput style={styles.input} value={address.zipCode} onChangeText={v => handleAddressChange('zipCode', v)} keyboardType="numeric" placeholder="522xxx" placeholderTextColor={Colors.textMuted} />
               </View>
             </View>

             <Text style={styles.label}>State*</Text>
             <TextInput style={styles.input} value={address.state} onChangeText={v => handleAddressChange('state', v)} placeholder="Andhra Pradesh" placeholderTextColor={Colors.textMuted} />
          </View>

          <BigButton te="సేవ్ చేయండి" en="Save Changes" onPress={handleSave} loading={loading} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  section: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '900', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' },
  input: { 
    backgroundColor: Colors.surface, 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    borderWidth: 1, 
    borderColor: Colors.borderLight, 
    marginBottom: 16, 
    color: '#000' 
  },
  halfRow: { flexDirection: 'row' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  gpsText: { fontSize: 10, fontWeight: 'bold', color: Colors.primary },
});

export default EditProfile;
