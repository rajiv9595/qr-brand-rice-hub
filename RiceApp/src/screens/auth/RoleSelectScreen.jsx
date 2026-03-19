// RiceApp/src/screens/auth/RoleSelectScreen.jsx
// Premium Role Selection for RiceHub
// Upgraded with modern cards, Material Icons, and strict token logic

import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import client from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RoleSelectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { lang } = useLang();
  const { params } = route;

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      key: 'customer',
      icon: 'basket-outline',
      labelTe: 'కొనేవారు (Buyer)',
      labelEn: 'I want to buy rice',
      desc: 'బియ్యం కొనాలనుకుంటున్నారు\nBrowse listings and place orders',
      color: '#3B82F6',
    },
    {
      key: 'supplier',
      icon: 'store-outline',
      labelTe: 'అమ్మేవారు (Trader)',
      labelEn: 'I want to sell rice',
      desc: 'బియ్యం అమ్మాలనుకుంటున్నారు\nList your products and manage sales',
      color: Colors.primary,
    },
  ];

  const handleContinue = () => {
    if (!selected) return;
    if (params?.phone && params?.idToken) {
       performRegistration(selected);
    } else {
       navigation.navigate('Register', { role: selected });
    }
  };

  const performRegistration = async (role) => {
    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        phone: params.phone,
        role,
        name: params.phone,
      });
      if (res.data.success && res.data.data) {
        // Token is nested in data
        await login(res.data.data, res.data.data.token);
      }
    } catch (e) {
      Alert.alert('Registration Failed', 'We could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C2410C" translucent />
      <LoadingSpinner visible={loading} fullScreen message="Setting up your account..." />

      <View style={[styles.header, { paddingTop: insets.top + 30 }]}>
         <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
         <Text style={styles.title}>{lang === 'te' ? 'మీరు ఎవరు?' : 'Who are you?'}</Text>
         <Text style={styles.subtitle}>{lang === 'te' ? 'మీ పాత్రను ఎంచుకోండి' : 'Select your primary role'}</Text>
      </View>

      <View style={styles.bottomCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.key}
                style={[styles.roleCard, selected === role.key && { borderColor: role.color, backgroundColor: role.color + '08' }]}
                onPress={() => setSelected(role.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: role.color + '15' }]}>
                   <Icon name={role.icon} size={32} color={role.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.roleTe, selected === role.key && { color: role.color }]}>{role.labelTe}</Text>
                  <Text style={styles.roleEn}>{role.labelEn}</Text>
                  <Text style={styles.roleDesc}>{role.desc}</Text>
                </View>
                {selected === role.key && (
                  <View style={[styles.checkBadge, { backgroundColor: role.color }]}>
                     <Icon name="check" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.primaryBtn, (!selected || loading) && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!selected || loading}
            >
              <Text style={styles.btnText}>{lang === 'te' ? 'ముందుకు కొనసాగండి' : 'Continue'}</Text>
              <Icon name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: {
    height: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
  },
  scrollContent: { paddingVertical: 10, gap: 16 },
  
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F3F4FB',
    backgroundColor: '#FFF',
    position: 'relative',
    gap: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  roleTe: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  roleEn: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginTop: 2 },
  roleDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 8, lineHeight: 18 },
  
  checkBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryBtn: {
    marginTop: 10,
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnDisabled: { backgroundColor: '#E5E7EB', elevation: 0 },
  btnText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
});

export default RoleSelectScreen;