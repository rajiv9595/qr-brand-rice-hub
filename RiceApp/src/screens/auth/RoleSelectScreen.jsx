import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import client from '../../api/client';

const T = {
  te: {
    title: 'మీరు ఎవరు?',
    titleEn: 'Who are you?',
    buyer: 'కొనేవారు',
    buyerEn: 'Customer / Buyer',
    buyerDesc: 'బియ్యం కొనాలనుకుంటున్నారు\nI want to buy rice',
    seller: 'అమ్మేవారు',
    sellerEn: 'Trader / Seller',
    sellerDesc: 'బియ్యం అమ్మాలనుకుంటున్నారు\nI want to sell rice',
    continue: 'కొనసాగించు',
    continueEn: 'Continue →',
    error: 'సమస్య',
    regFailed: 'రిజిస్ట్రేషన్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.',
  },
  hi: {
    title: 'आप कौन हैं?',
    titleEn: 'Who are you?',
    buyer: 'ग्राहक / खरीदार',
    buyerEn: 'Customer / Buyer',
    buyerDesc: 'मुझे चावल खरीदना है\nI want to buy rice',
    seller: 'व्यापारी / विक्रेता',
    sellerEn: 'Trader / Seller',
    sellerDesc: 'मुझे चावल बेचना है\nI want to sell rice',
    continue: 'जारी रखें',
    continueEn: 'Continue →',
    error: 'त्रुटि',
    regFailed: 'रजिस्ट्रेशन विफल। कृपया पुनः प्रयास करें।',
  },
  en: {
    title: 'Who are you?',
    titleEn: 'Select your role',
    buyer: 'Customer / Buyer',
    buyerEn: 'I want to buy rice',
    buyerDesc: 'Browse rice listings and place orders',
    seller: 'Trader / Seller',
    sellerEn: 'I want to sell rice',
    sellerDesc: 'List your rice products and manage orders',
    continue: 'Continue',
    continueEn: 'Continue →',
    error: 'Error',
    regFailed: 'Registration failed. Please try again.',
  },
};

const RoleSelectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { lang } = useLang();
  const { params } = route;
  const t = T[lang] || T.en;

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      key: 'customer',
      emoji: '🛒',
      label: t.buyer,
      sub: t.buyerEn,
      desc: t.buyerDesc,
    },
    {
      key: 'supplier',
      emoji: '🏪',
      label: t.seller,
      sub: t.sellerEn,
      desc: t.sellerDesc,
    },
  ];

  const handleContinue = () => {
    if (!selected) return;
    
    // If we have phone/token, it's a post-verification selection
    if (params?.phone && params?.idToken) {
       // Code to register now
       performRegistration(selected);
    } else {
       // Start of register flow
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
      if (res.data.success) await login(res.data.data, res.data.token || res.data.data.token);
    } catch (e) {
      Alert.alert('Error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <View style={styles.topSection}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.titleEn}>{t.titleEn}</Text>
      </View>

      <View style={styles.bottomSection}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            style={[styles.roleCard, selected === role.key && styles.roleCardActive]}
            onPress={() => setSelected(role.key)}
            activeOpacity={0.82}
          >
            <Text style={styles.roleEmoji}>{role.emoji}</Text>
            <Text style={styles.roleTe}>{role.label}</Text>
            <Text style={styles.roleEn}>{role.sub}</Text>
            <Text style={styles.roleDesc}>{role.desc}</Text>
            {selected === role.key && (
              <View style={styles.checkMark}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.continueBtn, (!selected || loading) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.continueTe}>{t.continue}</Text>
                <Text style={styles.continueEn}>{t.continueEn}</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  titleEn: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 14,
  },
  roleCard: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    backgroundColor: Colors.white,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  roleTe: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleEn: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  roleDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  checkMark: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueTe: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  continueEn: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});

export default RoleSelectScreen;