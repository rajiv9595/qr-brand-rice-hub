// screens/trader/TraderDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import StatCard from '../../components/trader/StatCard';
import { riceService } from '../../api/riceService';
import { orderService } from '../../api/orderService';
import { formatCurrency } from '../../utils/formatCurrency';

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

  // Status mapping for the welcome box 🛡️
  const isVerified = user?.isVerified === true;
  const autoActivateAt = user?.autoActivateAt;
  const isAutoVerifyTimerActive = autoActivateAt && new Date(autoActivateAt) > new Date();
  
  // Strict Profile Check
  const isProfileIncomplete = !user?.gstNumber || !user?.millName || !user?.upiId;
  
  const getStatusDisplay = () => {
    if (isVerified) return { text: "VERIFIED SELLER", color: "#059669", border: "#10B981", icon: "check-decagram" };
    if (isAutoVerifyTimerActive) return { text: "ACTIVATING AUTOMATICALLY...", color: "#2563EB", border: "#60A5FA", icon: "clock-fast" };
    return { text: "PENDING APPROVAL", color: "#D97706", border: "#F59E0B", icon: "clock-check-outline" };
  };

  const status = getStatusDisplay();

  // Smart Banner Logic
  const getBannerConfig = () => {
    if (isVerified) return null; // Success - cleaner dashboard

    if (isProfileIncomplete) {
      return {
        title: "Profile Incomplete",
        sub: "Please add your Mill details, GST and Banking info to start selling.",
        bg: '#FFFBEB',
        borderColor: '#FEF3C7',
        icon: 'alert-decagram',
        iconColor: '#D97706',
        textColor: '#92400E',
        subColor: '#B45309',
        action: 'SETUP'
      };
    }

    return {
      title: "Identity Under Verification",
      sub: "Your business details are being audited. You'll be ready to sell once approved.",
      bg: '#E3F2FD',
      borderColor: '#BBDEFB',
      icon: 'shield-sync',
      iconColor: '#1565C0',
      textColor: '#0D47A1',
      subColor: '#1976D2',
      action: 'VIEW'
    };
  };

  const banner = getBannerConfig();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [listingsRes, ordersRes] = await Promise.allSettled([
        riceService.getMyListings(),
        orderService.getTraderOrders(),
      ]);

      const listings = listingsRes.status === 'fulfilled' ? (listingsRes.value.data?.data || []) : [];
      const orders   = ordersRes.status === 'fulfilled'   ? (ordersRes.value.data?.data || [])   : [];

      const activeProductCount = listings.filter(l => l.isActive).length;
      const pendingOrderCount  = orders.filter(o => o.status === 'Pending').length;
      const totalRevenue     = orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        totalSales: totalRevenue,
        newOrders: pendingOrderCount,
        activeProducts: activeProductCount,
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
    if (syncUser) syncUser();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
    if (syncUser) syncUser();
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        te="వ్యాపార డాష్‌బోర్డ్" 
        en="Trader Dashboard" 
        showBack={false} 
        rightContent={
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <MaterialIcon name="account-circle" size={32} color="#fff" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />}
      >
        {/* WELCOME SECTION */}
        <View style={styles.welcomeBox}>
            <Text style={styles.namaste}>నమస్తే, {user?.name || 'Trader'} 🙏</Text>
            <View style={[styles.statusChip, { borderColor: status.border }]}>
                <MaterialIcon name={status.icon} size={14} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>
                    {status.text}
                </Text>
            </View>
        </View>

        {/* SMART BANNER */}
        {banner && (
          <TouchableOpacity 
            style={[styles.alertBanner, { backgroundColor: banner.bg, borderColor: banner.borderColor }]} 
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.alertIconBox, { backgroundColor: banner.borderColor }]}>
                <MaterialIcon name={banner.icon} size={24} color={banner.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: banner.textColor }]}>{banner.title}</Text>
              <Text style={[styles.alertSub, { color: banner.subColor }]}>{banner.sub}</Text>
            </View>
            <Text style={styles.alertLink}>{banner.action}</Text>
          </TouchableOpacity>
        )}

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard 
                labelTe="మొత్తం అమ్మకాలు" 
                labelEn="Total Sales" 
                value={formatCurrency(stats.totalSales)} 
                color="#059669" 
              />
              <StatCard 
                labelTe="కొత్త ఆర్డర్లు" 
                labelEn="New Orders" 
                value={stats.newOrders} 
                color="#F59E0B" 
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard 
                labelTe="ఉత్పత్తులు" 
                labelEn="Products" 
                value={stats.activeProducts} 
                color="#2563EB" 
              />
              <StatCard 
                labelTe="చర్చలు (Pending)" 
                labelEn="Negotiations" 
                value={stats.pendingNegotiations} 
                color="#7C3AED" 
              />
            </View>
        </View>

        {/* Quick Actions */}
        <Text style={TextStyles.sectionTitle}>త్వరిత చర్యలు (QUICK ACTIONS)</Text>
        <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#ECFDF5' }]}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                <MaterialIcon name="plus" size={24} color="#fff" />
              </View>
              <Text style={styles.actionTe}>బియ్యం చేర్చండి</Text>
              <Text style={styles.actionEn}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#FFF7ED' }]}
              onPress={() => navigation.navigate('Orders')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F59E0B' }]}>
                <MaterialIcon name="package-variant" size={24} color="#fff" />
              </View>
              <Text style={styles.actionTe}>ఆర్డర్లు చూడండి</Text>
              <Text style={styles.actionEn}>View Orders</Text>
            </TouchableOpacity>
        </View>

        {/* Business Tips */}
        <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
                <MaterialIcon name="lightbulb-on" size={20} color={Colors.primary} />
                <Text style={styles.tipsTitleTe}>వ్యాపార చిట్కా (Business Tip)</Text>
            </View>
            <Text style={styles.tipsTextTe}>మీ బియ్యం ఫోటోలు స్పష్టంగా ఉంటే ఎక్కువ మంది కొంటారు.</Text>
            <Text style={styles.tipsTextEn}>Clear photos of your rice help attract more customers.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  welcomeBox: { marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  namaste: { fontSize: 21, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, gap: 4, backgroundColor: '#fff' },
  statusText: { fontSize: 9, fontWeight: '900' },
  alertBanner: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 25, 
    borderWidth: 1, gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8
  },
  alertIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 14, fontWeight: 'bold' },
  alertSub: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  alertLink: { fontSize: 12, fontWeight: '900', color: Colors.primary, marginLeft: 10 },
  profileBtn: { padding: 4 },
  statsGrid: { gap: 12, marginBottom: 35 },
  statsRow: { flexDirection: 'row', gap: 12 },
  actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 35 },
  actionBtn: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTe: { fontSize: 15, fontWeight: 'bold', color: Colors.textPrimary },
  actionEn: { fontSize: 10, color: Colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },
  tipsCard: { backgroundColor: Colors.white, padding: 22, borderRadius: 24, borderLeftWidth: 6, borderLeftColor: Colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 3 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipsTitleTe: { fontSize: 14, fontWeight: '900', color: Colors.primary },
  tipsTextTe: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 6 },
  tipsTextEn: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
