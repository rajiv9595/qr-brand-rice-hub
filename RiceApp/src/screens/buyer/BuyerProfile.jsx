// screens/buyer/BuyerProfile.jsx
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import { useLocation } from '../../context/LocationContext';
import AppHeader from '../../components/common/AppHeader';
import client from '../../api/client';
const BuyerProfile = () => {
  const navigation = useNavigation();
  const { user, logout, syncUser } = useContext(AuthContext);

  // Sync profile when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      syncUser();
    }, [])
  );
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { getCurrentLocation, locLoading } = useLocation();
  const [loading, setLoading] = useState(false);

  // Address logic
  const address = user?.address;
  const hasAddress = address && Object.keys(address).length > 0 && (address.street || address.village || address.city);

  const handleUpdateLocation = async () => {
    setLoading(true);
    const loc = await getCurrentLocation();
    
    if (loc) {
      // Map detected GPS data to backend Address schema 🛡️
      const addrData = {
        address: {
          village: loc.name || '',
          city:    loc.district || '',
          state:   loc.state || '',
          zipCode: loc.pincode || '',
          street:  '', // Placeholder or keep current
        }
      };

      try {
        const res = await syncUser(); // Refresh first
        // Call backend API to save this as the default address
        const updateRes = await client.put('/auth/profile', addrData);
        if (updateRes.data.success) {
           await syncUser(); // Sync again to refresh UI with state from DB
           Alert.alert(t('Success'), `${loc.name}, ${loc.district}\n${t('locationUpdated') || 'Location updated successfully!'}`);
        }
      } catch (err) {
        console.error('Save location error:', err);
        Alert.alert(t('Error'), 'Failed to save location to profile.');
      }
    }
    setLoading(false);
  };

  const renderMenuItem = (icon, title, sub, onPress, color = Colors.primary) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
       <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
          <Icon name={icon} size={18} color={color} />
       </View>
       <View style={styles.menuTxtBox}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSub}>{sub}</Text>
       </View>
       <Icon name="chevron-right" size={14} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <AppHeader te="నా వివరాలు" en="My Profile" showBack={false} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : '👤'}</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user?.name || t('noName')}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {user?.role === 'supplier' ? 'TRADER' : 'CUSTOMER'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.iconBox}><Icon name="envelope" size={14} color={Colors.primary} /></View>
              <Text style={styles.detailText}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.iconBox}><Icon name="phone" size={16} color={Colors.primary} /></View>
              <Text style={styles.detailText}>{user?.phone || 'N/A'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
             <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionWrap}>
           <Text style={styles.sectionLabel}>ACCOUNT & SERVICES</Text>
           {renderMenuItem('comments', 'Negotiations', 'View active price deals', () => navigation.navigate('NegotiationHub'), '#F59E0B')}
           {renderMenuItem('headset', 'Support Hub', 'Expert help & tickets', () => navigation.navigate('SupportHub'), '#10B981')}
           {renderMenuItem('shopping-bag', 'My Orders', 'Check order status', () => navigation.navigate('Orders'), '#3B82F6')}
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addrHeader}>
             <Text style={styles.sectionTitle}>{t('defaultAddress')}</Text>
             <TouchableOpacity 
               style={styles.locationUpdateBtn} 
               onPress={handleUpdateLocation}
               disabled={loading || locLoading}
             >
                {loading || locLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Icon name="map-marker-alt" size={14} color={Colors.primary} />
                    <Text style={styles.updateLocText}>Update GPS</Text>
                  </>
                )}
             </TouchableOpacity>
          </View>
          
          {hasAddress ? (
            <View style={styles.addressDetails}>
              <Text style={[styles.addressText, { fontWeight: 'bold', color: '#000' }]}>{user?.name}</Text>
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>{address.village}{address.village && ', '}{address.city}</Text>
              <Text style={styles.addressText}>{address.state} - {address.zipCode}</Text>
              <View style={styles.addrActions}>
                 <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.addrActionText}>Change Address</Text>
                 </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyAddress} onPress={() => navigation.navigate('EditProfile')}>
              <Icon name="map-marker-alt" size={32} color={Colors.textMuted} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyAddressText}>{t('noAddress')}</Text>
              <Text style={styles.tapToSet}>Tap to add your address</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Icon name="sign-out-alt" size={18} color="#FF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Support Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('SupportHub')}
        activeOpacity={0.9}
      >
         <Icon name="headset" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20 },
  profileCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  nameContainer: { flex: 1 },
  name: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 6 },
  badge: { backgroundColor: '#DEF7EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  detailsList: { gap: 12, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 28, alignItems: 'center' },
  detailText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  editBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.borderLight, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  editBtnText: { fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary },
  sectionWrap: { marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: Colors.textMuted, marginBottom: 12, letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 10, elevation: 1 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  menuTxtBox: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.textPrimary },
  menuSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  addressCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 25, elevation: 4 },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locationUpdateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  updateLocText: { fontSize: 11, fontWeight: 'bold', color: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  addressDetails: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12 },
  addressText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4, lineHeight: 22 },
  addrActions: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  addrActionText: { fontSize: 13, fontWeight: 'bold', color: Colors.primary },
  emptyAddress: { backgroundColor: Colors.surface, padding: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderLight, borderStyle: 'dashed' },
  emptyAddressText: { fontSize: 14, color: Colors.textMuted },
  tapToSet: { fontSize: 10, color: Colors.primary, marginTop: 4, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FF4444' },
  logoutText: { color: '#FF4444', fontWeight: 'bold', fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});

export default BuyerProfile;
