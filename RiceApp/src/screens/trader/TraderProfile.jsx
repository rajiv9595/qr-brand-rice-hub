// screens/trader/TraderProfile.jsx
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import { useLocation } from '../../context/LocationContext';
import AppHeader from '../../components/common/AppHeader';

const TraderProfile = () => {
  const navigation = useNavigation();
  const { user, logout, syncUser } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { getCurrentLocation, locLoading } = useLocation();
  const [loading, setLoading] = useState(false);

  // Force Sync on Mount to ensure latest "Green Signal" from server 🛡️
  useEffect(() => {
    syncUser();
  }, []);

  // Address logic
  const address = user?.address;
  // Handle both string and object address formats from backend
  const hasAddress = address && (
    (typeof address === 'object' && (address.street || address.village || address.city)) ||
    (typeof address === 'string' && address.length > 5)
  );

  const handleUpdateLocation = async () => {
    setLoading(true);
    const loc = await getCurrentLocation();
    if (loc) {
      Alert.alert(
        t('Success'), 
        `${loc.name}, ${loc.district}, ${loc.state}\nLocation detected successfully!`
      );
    }
    setLoading(false);
  };

  const renderMenuItem = (icon, title, sub, onPress, color = Colors.primary) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
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

  // Professional Verification Mapping
  const isVerified = user?.isVerified === true;
  const isAutoVerifyTimerActive = user?.autoActivateAt && new Date(user.autoActivateAt) > new Date();

  const getStatusInfo = () => {
    if (isVerified) return { text: 'VERIFIED SELLER', bg: '#DEF7EC', border: '#10B981', textColor: '#03543F' };
    if (isAutoVerifyTimerActive) return { text: 'ACTIVATING AUTOMATICALLY...', bg: '#E3F2FD', border: '#1E88E5', textColor: '#1565C0' };
    return { text: 'PENDING VERIFICATION', bg: '#FFFBEB', border: '#FED7AA', textColor: '#D97706' };
  };

  const status = getStatusInfo();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <AppHeader te="నా వివరాలు" en="My Profile" showBack={false} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
               {user?.shopPhotoUrl ? (
                 <Image source={{ uri: user.shopPhotoUrl }} style={styles.avatarImg} />
               ) : (
                 <Text style={styles.avatarText}>{user?.millName ? user.millName.charAt(0).toUpperCase() : '🏪'}</Text>
               )}
            </View>
            <View style={styles.nameContainer}>
               <Text style={styles.millNameText}>{user?.millName || 'Rice Mill'}</Text>
               <Text style={styles.ownerNameText}>{user?.name || t('noName')}</Text>
               
               <View style={styles.badgeRow}>
                  <View style={[styles.badge, { 
                    backgroundColor: status.bg, 
                    borderWidth: 1, 
                    borderColor: status.border 
                  }]}>
                     <Text style={[styles.badgeText, { color: status.textColor }]}>
                       {status.text}
                     </Text>
                  </View>
                  {user?.trustScore > 0 && (
                     <View style={styles.scoreBadge}>
                        <Icon name="shield-alt" size={10} color="#059669" />
                        <Text style={styles.scoreText}>{user.trustScore}</Text>
                     </View>
                  )}
               </View>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.iconBox}><Icon name="id-card" size={12} color={Colors.primary} /></View>
              <Text style={styles.detailText}>GST: {user?.gstNumber || 'Updating...'}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.iconBox}><Icon name="map-marker-alt" size={12} color={Colors.primary} /></View>
              <Text style={styles.detailText}>{user?.district || 'AP'}, {user?.state || 'India'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
             <Text style={styles.editBtnText}>Manage Business Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionWrap}>
           <Text style={styles.sectionLabel}>TRADER SERVICES</Text>
           {renderMenuItem('comments', 'Negotiations', 'Deals from buyers', () => navigation.navigate('NegotiationHub'), '#F59E0B')}
           {renderMenuItem('headset', 'Support Hub', 'Help & Admin tickets', () => navigation.navigate('SupportHub'), '#10B981')}
           {renderMenuItem('layer-group', 'My Listings', 'Manage products', () => navigation.navigate('MyListings'), '#3B82F6')}
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
              {typeof address === 'object' ? (
                <>
                  <Text style={styles.addressText}>{address.street || ''}</Text>
                  <Text style={styles.addressText}>{address.village}{address.village && ', '}{address.city}</Text>
                  <Text style={styles.addressText}>{address.state} - {address.zipCode}</Text>
                </>
              ) : (
                <Text style={styles.addressText}>{address}</Text>
              )}
              <View style={styles.addrActions}>
                 <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.addrActionText}>Update Address</Text>
                 </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyAddress} onPress={() => navigation.navigate('EditProfile')}>
              <Icon name="map-marker-alt" size={32} color={Colors.textMuted} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyAddressText}>{t('noAddress')}</Text>
              <Text style={styles.tapToSet}>Tap to add shop location</Text>
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
  avatar: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: Colors.primary },
  nameContainer: { flex: 1 },
  millNameText: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary, marginBottom: 2 },
  ownerNameText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#10B981' },
  scoreText: { fontSize: 10, fontWeight: 'bold', color: '#059669' },
  detailsList: { gap: 10, marginBottom: 20, backgroundColor: Colors.bg, padding: 15, borderRadius: 16 },
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
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: Colors.primary },
});

export default TraderProfile;
