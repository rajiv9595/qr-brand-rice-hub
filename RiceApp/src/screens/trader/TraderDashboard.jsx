// RiceApp/src/screens/trader/TraderDashboard.jsx
// Premium Business Hub with Strict Profile Enforcement
// Redesigned to match the professional 100cr company standard

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { Typography } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import StatCard from '../../components/trader/StatCard';
import { riceService } from '../../api/riceService';
import { orderService } from '../../api/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TraderDashboard() {
  const { user, logout, syncUser } = useContext(AuthContext);
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalSales: 0,
    newOrders: 0,
    activeProducts: 0,
    pendingNegotiations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Unified Backend Logic: 100% match with Website
  const isVerified = user?.isVerified === true;
  const isAutoVerifyTimerActive = user?.autoActivateAt && new Date(user.autoActivateAt) > new Date();
  
  // Strict Check: Backend requires full entity details for business operations
  const isProfileComplete = user?.gstNumber && user?.millName && user?.district && user?.upiId && user?.ifscCode;
  
  const getStatusDisplay = () => {
    if (isVerified) return { text: "VERIFIED SELLER", color: "#059669", border: "#10B981", icon: "check-decagram" };
    if (isAutoVerifyTimerActive) return { text: "VERIFYING BUSINESS...", color: "#2563EB", border: "#60A5FA", icon: "clock-fast" };
    return { text: "PENDING APPROVAL", color: "#D97706", border: "#F59E0B", icon: "clock-check-outline" };
  };

  const status = getStatusDisplay();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [listingsRes, ordersRes] = await Promise.allSettled([
        riceService.getMyListings(),
        orderService.getTraderOrders(),
      ]);

      const listings = listingsRes.status === 'fulfilled' ? (listingsRes.value.data?.data || []) : [];
      const orders   = ordersRes.status === 'fulfilled'   ? (ordersRes.value.data?.data || [])   : [];

      const activeProducts = listings.filter(l => l.isActive).length;
      const pendingOrders  = orders.filter(o => o.status === 'Pending').length;
      const totalSales     = orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        totalSales,
        newOrders: pendingOrders,
        activeProducts,
        pendingNegotiations: 0,
      });
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchStats(); 
    syncUser(); 
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        te="వ్యాపార డాష్‌బోర్డ్" 
        en="Business Hub" 
        showBack={false} 
        rightContent={
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        }
      />
      
      <LoadingSpinner visible={loading && !refreshing} inline />

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />}
      >
        {/* WELCOME SECTION */}
        <View style={styles.welcomeBox}>
            <Text style={styles.namaste}>నమస్తే, {user?.name || 'Trader'} 🙏</Text>
            <View style={[styles.statusChip, { borderColor: status.border }]}>
                <Icon name={status.icon} size={14} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>
                    {status.text}
                </Text>
            </View>
        </View>

        {/* PROFILE GUARD: Mandatory Actions */}
        {!isProfileComplete && (
          <TouchableOpacity 
            style={styles.mandatoryCard} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.mandatoryIcon}>
                <Icon name="shield-alert-outline" size={32} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mandatoryTitle}>Action Required: Business Identity</Text>
              <Text style={styles.mandatorySub}>Complete your Mill profile & GST to list rice products for sale.</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#D97706" />
          </TouchableOpacity>
        )}

        {/* STATS SECTION */}
        <View style={styles.statsGrid}>
           <View style={styles.statsRow}>
              <StatCard labelTe="మొత్తం అమ్మకాలు" labelEn="Total Revenue" value={formatCurrency(stats.totalSales)} icon="currency-inr" color="#0891B2" />
              <StatCard labelTe="కొత్త ఆర్డర్లు" labelEn="New Orders" value={stats.newOrders} icon="package-variant-closed" color="#7C3AED" />
           </View>
           <View style={styles.statsRow}>
              <StatCard labelTe="ఉత్పత్తులు" labelEn="Active Ads" value={stats.activeProducts} icon="store-outline" color="#059669" />
              <StatCard labelTe="చర్చలు" labelEn="Chats" value={stats.pendingNegotiations} icon="chat-processing-outline" color="#EA580C" />
           </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleTe}>త్వరిత చర్యలు</Text>
            <Text style={styles.sectionTitleEn}>Quick Actions</Text>
        </View>

        <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, !isProfileComplete && styles.actionLocked]}
              onPress={() => isProfileComplete ? navigation.navigate('AddProduct') : Alert.alert("Profile Incomplete", "Please add your GST and Mill details first.")}
              disabled={!isProfileComplete}
            >
                <View style={[styles.actionIconBox, { backgroundColor: '#F0F9FF' }]}>
                    <Icon name={isProfileComplete ? "plus-circle" : "lock-outline"} size={32} color={isProfileComplete ? "#0284C7" : "#94A3B8"} />
                </View>
                <Text style={styles.actionLabel}>Add Rice</Text>
                <Text style={styles.actionSub}>Create Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Orders')}
            >
                <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
                    <Icon name="clipboard-text-outline" size={32} color="#7C3AED" />
                </View>
                <Text style={styles.actionLabel}>Orders</Text>
                <Text style={styles.actionSub}>Manage Sales</Text>
            </TouchableOpacity>
        </View>

        {/* ANALYTICS PREVIEW */}
        <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
                <Icon name="trending-up" size={24} color={Colors.primary} />
                <Text style={styles.insightTitle}>Market Performance</Text>
            </View>
            <Text style={styles.insightDesc}>Your listings have been viewed 42 times this week. Add clear photos to improve engagement!</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20 },
  
  welcomeBox: { marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  namaste: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  statusChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5, elevation: 1 },
  statusText: { fontSize: 10, fontWeight: '900' },
  
  mandatoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    gap: 16,
    elevation: 4,
    shadowColor: '#D97706',
    shadowOpacity: 0.1,
  },
  mandatoryIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  mandatoryTitle: { fontSize: 15, fontWeight: '900', color: '#92400E' },
  mandatorySub: { fontSize: 11, color: '#B45309', marginTop: 4, lineHeight: 16 },
  
  statsGrid: { gap: 12, marginBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 12 },
  
  sectionHeader: { marginBottom: 16 },
  sectionTitleTe: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
  sectionTitleEn: { fontSize: 10, color: Colors.textMuted, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  
  actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
  },
  actionLocked: { opacity: 0.6, backgroundColor: '#F1F5F9' },
  actionIconBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontWeight: '900', color: Colors.textPrimary },
  actionSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  
  insightCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6' },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  insightTitle: { fontSize: 15, fontWeight: '900', color: Colors.textPrimary },
  insightDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  
  profileBtn: { padding: 4 },
});
