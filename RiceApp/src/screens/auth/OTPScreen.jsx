// RiceSelect/src/screens/auth/OTPScreen.jsx
// Premium OTP Verification for RiceHub
// Upgraded with focused input cards, branded Glass-header, and strict token logic

import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import client from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OTP_LENGTH = 6;

const T = {
  te: {
    title: 'OTP నమోదు చేయండి',
    titleEn: 'Verify Number',
    sentTo: 'కు పంపబడింది',
  },
  hi: {
    title: 'OTP दर्ज करें',
    titleEn: 'Verify Number',
    sentTo: 'पर भेजा गया',
  },
  en: {
    title: 'Enter Code',
    titleEn: 'Verify Phone Number',
    sentTo: 'Enter the code sent to',
  },
};

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { lang } = useLang();
  const { phone, confirmation } = route.params;
  const t = T[lang] || T.en;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const timeout = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [timer]);

  const handleChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code) => {
    setLoading(true);
    try {
      const result = await confirmation.confirm(code);
      const idToken = await result.user.getIdToken();

      try {
        const res = await client.post('/auth/phone-login', { idToken, phone });
        if (res.data.success && res.data.data?.token) {
           await login(res.data.data, res.data.data.token);
        }
      } catch (backendErr) {
        if (backendErr.response?.status === 404) {
          navigation.navigate('RoleSelect', { phone, idToken });
        } else {
          throw backendErr;
        }
      }
    } catch (error) {
      Alert.alert('Verification Failed', 'The code you entered is incorrect.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone.replace('+91', '').replace(/(\d{5})(\d{5})/, '$1 XXXXX');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C2410C" translucent />
      <LoadingSpinner visible={loading} fullScreen message="Verifying Code..." />

      <View style={[styles.topSection, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.titleEn}>{t.titleEn}</Text>
      </View>

      <View style={styles.bottomCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sentLabel}>{t.sentTo}</Text>
            <Text style={styles.phoneLabel}>+91 {maskedPhone}</Text>

            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => inputs.current[i] = ref}
                  style={[styles.otpBox, digit && styles.otpBoxFilled]}
                  value={digit}
                  onChangeText={text => handleChange(text, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={i === 0}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, (loading || otp.some(d => !d)) && styles.btnDisabled]}
              onPress={() => verifyOTP(otp.join(''))}
              disabled={loading || otp.some(d => !d)}
            >
              <Text style={styles.submitBtnText}>{lang === 'te' ? 'ధృవీకరించండి' : 'Verify & Continue'}</Text>
              <Icon name="check-decagram" size={20} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.resendArea}>
               {canResend ? (
                 <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.resendText}>Didn't get the code? <Text style={{fontWeight:'900', color: Colors.primary}}>Resend</Text></Text>
                 </TouchableOpacity>
               ) : (
                 <Text style={styles.timerText}>Resend code in <Text style={{fontWeight:'900'}}>{timer}s</Text></Text>
               )}
            </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  topSection: {
    height: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  titleEn: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
  },
  sentLabel: { textAlign: 'center', fontSize: 14, color: Colors.textSecondary, marginTop: 10 },
  phoneLabel: { textAlign: 'center', fontSize: 18, fontWeight: '900', color: Colors.textPrimary, marginTop: 4, marginBottom: 32 },
  
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  otpBox: {
    width: 44,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
  },
  
  primaryBtn: {
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnDisabled: { backgroundColor: '#D1D5DB', elevation: 0 },
  submitBtnText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  
  resendArea: { marginTop: 32, alignItems: 'center' },
  resendText: { fontSize: 14, color: Colors.textSecondary },
  timerText: { fontSize: 14, color: Colors.textMuted },
});

export default OTPScreen;