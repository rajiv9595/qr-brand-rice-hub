// OrderConfirm.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../../theme/colors';
import AppHeader from '../../components/common/AppHeader';
import BigButton from '../../components/common/BigButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { orderService } from '../../api/orderService';
import { openWhatsApp } from '../../utils/openWhatsApp';
import { AuthContext } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useLocation } from '../../context/LocationContext';
import { negotiationService } from '../../api/negotiationService';

export default function OrderConfirm() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const { t } = useLang();
  const { getCurrentLocation, locLoading } = useLocation();
  const { shop, variety, type, size } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState('1');
  
  const hasSavedAddress = !!(user?.address?.street && user?.address?.city);
  const [useSavedAddress, setUseSavedAddress] = useState(hasSavedAddress);

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    village: user?.address?.village || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const pricePerBag = shop?.pricePerBag || shop?.price || 0;
  const quantityNum = parseInt(qty) || 0;
  const total = pricePerBag * quantityNum;

  const handleConfirm = async () => {
    if (quantityNum < 1) {
      Alert.alert('Invalid', 'Please enter a valid quantity.');
      return;
    }
    if (!address.phone || address.phone.length < 10) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!address.street || !address.city) {
      Alert.alert('Invalid', 'Please fill in your complete shipping address.');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        listingId: shop._id || shop.id,
        quantity: quantityNum,
        shippingAddress: address,
      };
      
      const res = await orderService.createOrder(orderData);
      
      if (res.data.success) {
        Alert.alert(
          'Order Successful! ✅',
          `Order ID: ${res.data.data?.orderId || 'N/A'}\nYour order has been placed successfully.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Orders') }]
        );
      }
    } catch (err) {
      console.error('Failed to place order', err);
      Alert.alert('Order Failed', err.response?.data?.message || 'There was a problem placing your order.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hello, I want to order ${qty} bags of ${variety} (${type}, ${size}kg) from your shop on QR Brands Rice Hub.`;
    const phone = shop?.supplierId?.userId?.phone || '91XXXXXXXXXX';
    openWhatsApp(phone, message);
  };

  const handleNegotiate = async () => {
    setLoading(true);
    try {
      await negotiationService.createNegotiation({
        listingId: shop._id || shop.id,
        proposedPrice: pricePerBag,
        proposedQuantity: quantityNum > 1 ? quantityNum : 50,
        initialMessage: `I want to order ${quantityNum} bags of ${variety}, but I'd like to negotiate the price.`
      });
      Alert.alert('Success', 'Negotiation started! You can chat with the trader in your Negotiation Hub.', [
        { text: 'Go to Hub', onPress: () => navigation.navigate('NegotiationHub') }
      ]);
    } catch (err) {
      if (err.response?.status === 400) {
        navigation.navigate('NegotiationHub');
      } else {
        Alert.alert('Error', 'Failed to start negotiation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setAddress(prev => ({
        ...prev,
        village: loc.name || '',
        city: loc.district || '',
        state: loc.state || '',
        zipCode: loc.pincode || prev.zipCode,
      }));
      Alert.alert('Location Detected', `${loc.name}, ${loc.district} (${loc.pincode}) set automatically.`);
    }
  };

  const toggleAddress = () => {
    const switchingToSaved = !useSavedAddress;
    setUseSavedAddress(switchingToSaved);
    
    if (switchingToSaved && hasSavedAddress) {
      setAddress({
        street: user.address.street || '',
        village: user.address.village || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zipCode: user.address.zipCode || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    } else {
      setAddress({
        street: '', village: '', city: '', state: '', zipCode: '', 
        phone: user?.phone || '', email: user?.email || '' 
      });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <AppHeader te="ప్లేస్ ఆర్డర్" en="Place Order" />
        
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.summaryCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemIconWrap}>
                 <Text style={styles.itemIcon}>🍚</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNameTe}>{variety}</Text>
                <Text style={styles.itemNameEn}>{type} · {size}kg Box</Text>
                <Text style={styles.pricePerBag}>{formatCurrency(pricePerBag)} / bag</Text>
              </View>
            </View>

            <View style={styles.qtyContainer}>
              <Text style={styles.qtyLabel}>Quantity (Bags)</Text>
              <View style={styles.qtyInputRow}>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="number-pad"
                  value={qty}
                  onChangeText={setQty}
                  maxLength={4}
                  placeholder="1"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.shippingSection}>
            <View style={styles.shippingHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="truck" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Shipping Details</Text>
              </View>
              {hasSavedAddress && (
                <TouchableOpacity onPress={toggleAddress} style={styles.toggleBtn}>
                  <Text style={styles.toggleBtnText}>{useSavedAddress ? 'New Address' : 'Saved Address'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {!useSavedAddress && (
              <View style={styles.locationPrompt}>
                 <Text style={styles.promptText}>Getting it delivered somewhere else?</Text>
                 <TouchableOpacity style={styles.locationBtn} onPress={handleDetectLocation}>
                    {locLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : (
                      <>
                        <Icon name="location-arrow" size={14} color={Colors.primary} />
                        <Text style={styles.locationBtnText}>Use Current Location</Text>
                      </>
                    )}
                 </TouchableOpacity>
              </View>
            )}

            {useSavedAddress && hasSavedAddress ? (
              <View style={styles.savedAddressBox}>
                <View style={styles.savedHeader}>
                   <View style={styles.greenDot} />
                   <Text style={styles.savedTitle}>Delivering to Saved Address</Text>
                </View>
                <Text style={styles.savedText}>{user.address.street}</Text>
                <Text style={styles.savedSub}>
                  {user.address.village ? user.address.village + ', ' : ''}
                  {user.address.city}, {user.address.state} - {user.address.zipCode}
                </Text>
                <View style={styles.rowInputs}>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Confirm Phone</Text>
                    <TextInput style={styles.inputField} value={address.phone} onChangeText={t => setAddress({...address, phone: t})} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Confirm Email</Text>
                    <TextInput style={styles.inputField} value={address.email} onChangeText={t => setAddress({...address, email: t})} keyboardType="email-address" autoCapitalize="none" placeholder="Email" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.newAddressBox}>
                <View style={styles.inputGroupFull}>
                  <Text style={styles.inputLabel}>Door No, Street, Landmark*</Text>
                  <TextInput style={[styles.inputField, { height: 60 }]} value={address.street} onChangeText={t => setAddress({...address, street: t})} multiline placeholder="e.g. D.No 12-1, Gandhi Nagar" placeholderTextColor="#999" />
                </View>
                <View style={styles.rowInputs}>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Village / Area</Text>
                    <TextInput style={styles.inputField} value={address.village} onChangeText={t => setAddress({...address, village: t})} placeholder="Village" placeholderTextColor="#999" />
                  </View>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>City / District*</Text>
                    <TextInput style={styles.inputField} value={address.city} onChangeText={t => setAddress({...address, city: t})} placeholder="City" placeholderTextColor="#999" />
                  </View>
                </View>
                <View style={styles.rowInputs}>
                   <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>State*</Text>
                    <TextInput style={styles.inputField} value={address.state} onChangeText={t => setAddress({...address, state: t})} placeholder="State" placeholderTextColor="#999" />
                  </View>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Pincode*</Text>
                    <TextInput style={styles.inputField} value={address.zipCode} onChangeText={t => setAddress({...address, zipCode: t})} keyboardType="number-pad" placeholder="533xxx" placeholderTextColor="#999" />
                  </View>
                </View>
                <View style={styles.inputGroupFull}>
                   <Text style={styles.inputLabel}>Mobile Number*</Text>
                   <TextInput style={styles.inputField} value={address.phone} onChangeText={t => setAddress({...address, phone: t})} keyboardType="phone-pad" placeholder="10-digit number" placeholderTextColor="#999" />
                </View>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <BigButton 
              te={`ఆర్డర్ కన్ఫర్మ్ (₹${total.toLocaleString()})`}
              en={`Confirm Order (₹${total.toLocaleString()})`}
              variant="orange"
              onPress={handleConfirm}
              loading={loading}
              style={styles.confirmBtn}
            />
            <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
              <Icon name="whatsapp" size={24} color={Colors.whatsapp} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.whatsappTe}>WhatsApp లో మాట్లాడండి</Text>
                <Text style={styles.whatsappEn}>Message Supplier on WhatsApp</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.negotiateLink} onPress={handleNegotiate}>
               <Icon name="comments" size={18} color={Colors.primary} />
               <Text style={styles.negotiateLinkText}>బేరసారాలు చేయండి / Negotiate Price Instead</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: 20 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  itemIconWrap: { width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  itemIcon: { fontSize: 32 },
  itemInfo: { flex: 1 },
  itemNameTe: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  itemNameEn: { fontSize: 13, color: Colors.textSecondary, fontWeight: 'bold', marginTop: 2 },
  pricePerBag: { fontSize: 16, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  qtyContainer: { backgroundColor:Colors.bg, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderLight },
  qtyLabel: { fontSize: 11, fontWeight: 'bold', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  qtyInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyInput: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, borderBottomWidth: 3, borderBottomColor: Colors.primary, padding: 0, width: '40%' },
  totalBox: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.primary, textTransform: 'uppercase' },
  totalVal: { fontSize: 24, fontWeight: '900', color: Colors.primaryDark },
  shippingSection: { marginBottom: 30 },
  shippingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 },
  toggleBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  toggleBtnText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
  locationPrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0F9FF', padding: 14, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  promptText: { fontSize: 11, fontWeight: 'bold', color: '#0369A1', flex: 1 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, elevation: 1 },
  locationBtnText: { fontSize: 11, fontWeight: 'bold', color: Colors.primary },
  savedAddressBox: { backgroundColor: '#F0FDF4', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#DCFCE7' },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  savedTitle: { fontSize: 12, fontWeight: 'bold', color: Colors.success, textTransform: 'uppercase' },
  savedText: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  savedSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  newAddressBox: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.borderLight },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  inputGroupHalf: { flex: 1 },
  inputGroupFull: { width: '100%', marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 6, marginLeft: 4 },
  inputField: { backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontWeight: '600', color: Colors.textPrimary, borderWidth: 1, borderColor: '#E9ECEF' },
  actions: { gap: 16 },
  confirmBtn: { shadowColor: Colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: Colors.whatsapp },
  whatsappTe: { fontSize: 15, fontWeight: 'bold', color: Colors.whatsapp },
  whatsappEn: { fontSize: 11, color: Colors.whatsapp, opacity: 0.8 },
  negotiateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 10
  },
  negotiateLinkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    textDecorationLine: 'underline'
  },
});
