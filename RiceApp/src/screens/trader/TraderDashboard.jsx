import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { Typography, TextStyles } from '../../theme/typography';
import AppHeader from '../../components/common/AppHeader';
import StatCard from '../../components/trader/StatCard';
import { riceService } from '../../api/riceService';
import { orderService } from '../../api/orderService';
import { formatCurrency } from '../../utils/formatCurrency';

export default function TraderDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalSales: 0,
    newOrders: 0,
    activeProducts: 0,
    pendingNegotiations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch REAL data from existing backend endpoints
      const [listingsRes, ordersRes] = await Promise.allSettled([
        riceService.getMyListings(),
        orderService.getTraderOrders(),
      ]);

      const listings = listingsRes.status === 'fulfilled' ? (listingsRes.value.data?.data || []) : [];
      const orders   = ordersRes.status === 'fulfilled'   ? (ordersRes.value.data?.data || [])   : [];

      // Compute stats locally from real data
      const activeProducts = listings.filter(l => l.isActive).length;
      const pendingOrders  = orders.filter(o => o.status === 'Pending').length;
      const totalSales     = orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        totalSales,
        newOrders: pendingOrders,
        activeProducts,
        pendingNegotiations: 0, // No negotiations endpoint in backend
      });
    } catch (err) {
      if (err.response?.status === 401) {
          logout();
      } else {
          console.error('Failed to fetch trader stats', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        te="వ్యాపార డాష్‌బోర్డ్" 
        en="Trader Dashboard" 
        showBack={false} 
        rightContent={
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />}
      >
        {/* Profile Completion Reminder */}
        {(!user?.gstNumber || !user?.millName) && (
          <TouchableOpacity 
            style={styles.alertBanner} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.alertIconBox}>
                <Text style={{ fontSize: 20 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Profile Incomplete</Text>
              <Text style={styles.alertSub}>Please add your Mill details and GST number to start selling.</Text>
            </View>
            <Text style={styles.alertLink}>SETUP</Text>
          </TouchableOpacity>
        )}

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
           <View style={styles.statsRow}>
              <StatCard 
                labelTe="మొత్తం అమ్మకాలు" 
                labelEn="Total Sales" 
                value={formatCurrency(stats.totalSales)} 
                color={Colors.primary} 
              />
              <StatCard 
                labelTe="కొత్త ఆర్డర్లు" 
                labelEn="New Orders" 
                value={stats.newOrders} 
                color={Colors.accent} 
              />
           </View>
           <View style={styles.statsRow}>
              <StatCard 
                labelTe="ఉత్పత్తులు" 
                labelEn="Products" 
                value={stats.activeProducts} 
                color={Colors.info} 
              />
              <StatCard 
                labelTe="చర్చలు (Pending)" 
                labelEn="Negotiations" 
                value={stats.pendingNegotiations} 
                color={Colors.warning} 
              />
           </View>
        </View>

        {/* Quick Actions */}
        <Text style={TextStyles.sectionTitle}>త్వరిత చర్యలు (Quick Actions)</Text>
        <View style={styles.actionGrid}>
           <TouchableOpacity 
             style={[styles.actionBtn, { backgroundColor: Colors.primaryLight }]}
             onPress={() => navigation.navigate('AddProduct')}
           >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionTe}>బియ్యం చేర్చండి</Text>
              <Text style={styles.actionEn}>Add Product</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.actionBtn, { backgroundColor: Colors.accentLight }]}
             onPress={() => navigation.navigate('Orders')}
           >
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionTe}>ఆర్డర్లు చూడండి</Text>
              <Text style={styles.actionEn}>View Orders</Text>
           </TouchableOpacity>
        </View>

        {/* Business Tips (Added Value) */}
        <View style={styles.tipsCard}>
           <Text style={styles.tipsTitleTe}>వ్యాపార చిట్కా (Business Tip) 💡</Text>
           <Text style={styles.tipsTextTe}>మీ బియ్యం ఫోటోలు స్పష్టంగా ఉంటే ఎక్కువ మంది కొంటారు.</Text>
           <Text style={styles.tipsTextEn}>Clear photos of your rice help attract more customers.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20 },
  alertBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFBEB', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#FEF3C7',
    gap: 12,
    elevation: 2
  },
  alertIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 15, fontWeight: 'bold', color: '#92400E' },
  alertSub: { fontSize: 11, color: '#B45309', marginTop: 2 },
  alertLink: { fontSize: 12, fontWeight: '900', color: Colors.primary, marginLeft: 10 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  profileIcon: { fontSize: 20 },
  statsGrid: { gap: 12, marginBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 12 },
  actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 30 },
  actionBtn: { flex: 1, padding: 24, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTe: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary },
  actionEn: { fontSize: 10, color: Colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  tipsCard: { backgroundColor: Colors.white, padding: 20, borderRadius: 20, borderLeftWidth: 6, borderLeftColor: Colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  tipsTitleTe: { fontSize: 14, fontWeight: '900', color: Colors.primary, marginBottom: 8 },
  tipsTextTe: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  tipsTextEn: { fontSize: 12, color: Colors.textSecondary },
});
