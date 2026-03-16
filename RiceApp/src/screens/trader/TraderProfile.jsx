// screens/trader/TraderProfile.jsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useLang } from '../../context/LangContext';
import AppHeader from '../../components/common/AppHeader';

const TraderProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const { t } = useLang();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <AppHeader te="ప్రొఫైల్" en="Profile" showBack={false} />
      
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🏪</Text>
          </View>
          <Text style={styles.phone}>{user?.phone || 'No phone'}</Text>
          <Text style={styles.role}>{user?.role === 'supplier' ? 'Trader' : 'Customer'}</Text>
          <View style={styles.shopBadge}>
            <Text style={styles.shopBadgeText}>{user?.shopName || 'Shop Not Setup'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>లాగ్ అవుట్ / Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, flex: 1, justifyContent: 'center' },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 40 },
  phone: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  role: { fontSize: 14, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  shopBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shopBadgeText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  logoutBtn: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  logoutText: { color: '#FF4444', fontWeight: '700', fontSize: 16 },
});

export default TraderProfile;
