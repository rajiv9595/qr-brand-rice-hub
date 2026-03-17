import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import client from '../../api/client';

const OTP_LENGTH = 6;

const T = {
  te: {
    title: 'OTP నమోదు చేయండి',
    titleEn: 'Enter OTP',
    sentTo: 'కు పంపబడింది',
    verify: 'నిర్ధారించండి',
    verifyEn: 'Verify OTP →',
    resend: 'OTP మళ్ళీ పంపండి / Resend OTP',
    wrongOtp: 'తప్పు OTP',
    wrongOtpMsg: 'OTP తప్పుగా ఉంది. మళ్ళీ ప్రయత్నించండి.',
    hint: 'SMS వస్తే automatically verify అవుతుంది',
    hintEn: 'OTP auto-reads on most Android phones',
  },
  hi: {
    title: 'OTP दर्ज करें',
    titleEn: 'Enter OTP',
    sentTo: 'पर भेजा गया',
    verify: 'सत्यापित करें',
    verifyEn: 'OTP सत्यापित करें →',
    resend: 'OTP दोबारा भेजें / Resend OTP',
    wrongOtp: 'गलत OTP',
    wrongOtpMsg: 'OTP गलत है। कृपया पुनः प्रयास करें।',
    hint: 'SMS आने पर स्वचालित सत्यापन',
    hintEn: 'OTP auto-reads on most Android phones',
  },
  en: {
    title: 'Enter OTP',
    titleEn: 'Enter OTP',
    sentTo: 'Sent to',
    verify: 'Verify',
    verifyEn: 'Verify OTP →',
    resend: 'Resend OTP',
    wrongOtp: 'Wrong OTP',
    wrongOtpMsg: 'Wrong OTP. Please try again.',
    hint: 'OTP auto-reads on most Android phones',
    hintEn: 'OTP auto-reads on most Android phones',
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
      let idToken;

      if (confirmation.dev) {
        if (code === '123456') {
          // Dev bypass — try backend login with phone
          try {
            const res = await client.post('/auth/phone-login', { phone });
            if (res.data.success && res.data.data?.token) {
              await login(res.data.data, res.data.data.token);
              return;
            }
          } catch (devErr) {
            // User doesn't exist — go to role select
            navigation.navigate('RoleSelect', { phone, idToken: 'DEV_TOKEN' });
            return;
          }
        } else {
          throw new Error('Invalid dev OTP');
        }
      }

      // Real Firebase flow
      const result = await confirmation.confirm(code);
      const fbUser = result.user;
      idToken = await fbUser.getIdToken();

      // Call backend to check if existing user
      try {
        const res = await client.post('/auth/phone-login', { idToken, phone });
        if (res.data.success && res.data.data?.token) {
          // Existing user → direct login
          await login(res.data.data, res.data.data.token);
        }
      } catch (backendErr) {
        // If 404 (user not found) → new user.
        // If we already have a role from previous screen, register now.
        // Otherwise, ask for role.
        if (backendErr.response?.status === 404) {
          if (route.params?.role) {
             // Register immediately with the pre-selected role
             try {
                const regRes = await client.post('/auth/register', {
                  phone,
                  role: route.params.role,
                  name: phone
                });
                if (regRes.data.success) {
                   await login(regRes.data.data, regRes.data.data.token);
                }
             } catch (regErr) {
                Alert.alert('Registration Failed', regErr.response?.data?.message || 'Error creating account');
             }
          } else {
             navigation.navigate('RoleSelect', { phone, idToken });
          }
        } else {
          throw backendErr;
        }
      }
    } catch (error) {
      console.warn('OTP verify error:', error);
      Alert.alert(t.wrongOtp, t.wrongOtpMsg);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    navigation.goBack();
  };

  const maskedPhone = phone.replace('+91', '').replace(/(\d{5})(\d{5})/, '$1 XXXXX');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.titleEn}>{t.titleEn}</Text>
        <Text style={styles.subtitle}>
          {t.sentTo} {maskedPhone}
        </Text>
      </View>

      <View style={styles.bottomSection}>
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
          style={[styles.verifyBtn, (loading || otp.some(d => !d)) && styles.verifyBtnDisabled]}
          onPress={() => verifyOTP(otp.join(''))}
          disabled={loading || otp.some(d => !d)}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.verifyTe}>{t.verify}</Text>
                <Text style={styles.verifyEn}>{t.verifyEn}</Text>
              </>
          }
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={resendOTP}>
              <Text style={styles.resendActive}>{t.resend}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend in {timer}s
            </Text>
          )}
        </View>

        <Text style={styles.hint}>
          {t.hint}{'\n'}{t.hintEn}
        </Text>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 20,
    padding: 8,
  },
  backText: {
    fontSize: 22,
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  titleEn: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  bottomSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 48,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    color: Colors.primaryMid,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyBtnDisabled: {
    opacity: 0.5,
  },
  verifyTe: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  verifyEn: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendActive: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  resendTimer: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OTPScreen;