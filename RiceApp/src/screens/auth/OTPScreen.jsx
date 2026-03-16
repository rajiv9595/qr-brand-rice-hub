import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext }         from '../../context/AuthContext';
import { Colors }              from '../../theme/colors';
import { Typography }          from '../../theme/typography';

const OTP_LENGTH = 6;

const OTPScreen = () => {
  const navigation          = useNavigation();
  const route               = useRoute();
  const insets              = useSafeAreaInsets();
  const { login }           = useContext(AuthContext);
  const { phone, confirmation } = route.params;

  const [otp,      setOtp]      = useState(['', '', '', '', '', '']);
  const [loading,  setLoading]  = useState(false);
  const [timer,    setTimer]    = useState(30);
  const [canResend,setCanResend]= useState(false);
  const inputs                  = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (text, index) => {
    // Accept only digits
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 filled
    if (newOtp.every(d => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    // Backspace — go to previous box
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code) => {
    setLoading(true);
    try {
      let idToken;
      let fbUser;

      if (confirmation.dev) {
        // Development Bypass: If dev flag is true, use a dummy token
        if (code === '123456') {
          idToken = 'DEV_TOKEN_SKIP_FIREBASE';
          // Mock data for development
          const mockUser = {
            success: true,
            data: {
              _id: 'dev_user_id',
              phone: phone,
              role: 'buyer', // Default to buyer for now
              token: 'DEV_AUTH_TOKEN'
            }
          };
          
          // Use context login
          await login(mockUser.data, mockUser.data.token);
          setLoading(false);
          return;
        } else {
          throw new Error('Invalid dev OTP');
        }
      }

      const result    = await confirmation.confirm(code);
      fbUser          = result.user;
      idToken         = await fbUser.getIdToken();

      // Call your existing backend to get/create user
      const response  = await fetch(
        `${process.env.API_BASE_URL || 'https://qr-brand-rice-hub-api.onrender.com/api'}/auth/firebase-login`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ idToken, phone }),
        }
      );
      const data = await response.json();

      if (data.success) {
        await login(data.data, data.data.token);
        // RootNavigator will auto-redirect based on user role
      } else {
        // New user — go to role selection
        navigation.navigate('RoleSelect', { phone, idToken });
      }
    } catch (error) {
      console.warn('OTP verify error:', error);
      Alert.alert(
        'తప్పు OTP',
        'OTP తప్పుగా ఉంది. మళ్ళీ ప్రయత్నించండి.\nWrong OTP. Please try again.'
      );
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

      {/* Green top */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>OTP నమోదు చేయండి</Text>
        <Text style={styles.titleEn}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          {phone} కు పంపబడింది{'\n'}Sent to {maskedPhone}
        </Text>
      </View>

      {/* White bottom */}
      <View style={styles.bottomSection}>

        {/* 6 OTP boxes */}
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

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.verifyBtn, (loading || otp.some(d => !d)) && styles.verifyBtnDisabled]}
          onPress={() => verifyOTP(otp.join(''))}
          disabled={loading || otp.some(d => !d)}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.verifyTe}>నిర్ధారించండి</Text>
                <Text style={styles.verifyEn}>Verify OTP →</Text>
              </>
          }
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={resendOTP}>
              <Text style={styles.resendActive}>OTP మళ్ళీ పంపండి / Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend in {timer}s
            </Text>
          )}
        </View>

        <Text style={styles.hint}>
          SMS వస్తే automatically verify అవుతుంది{'\n'}
          OTP auto-reads on most Android phones
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    flex:            1,
    paddingHorizontal: 24,
    paddingTop:      12,
    justifyContent:  'center',
  },
  backBtn: {
    position:   'absolute',
    top:        16,
    left:       20,
    padding:    8,
  },
  backText: {
    fontSize:   22,
    color:      '#fff',
  },
  title: {
    fontSize:        26,
    fontWeight:      '700',
    color:           '#fff',
    textAlign:       'center',
  },
  titleEn: {
    fontSize:        14,
    color:           'rgba(255,255,255,0.8)',
    textAlign:       'center',
    marginTop:       4,
  },
  subtitle: {
    fontSize:        14,
    color:           'rgba(255,255,255,0.75)',
    textAlign:       'center',
    marginTop:       12,
    lineHeight:      22,
  },
  bottomSection: {
    backgroundColor:      Colors.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    padding:              28,
    paddingBottom:        48,
  },
  otpRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   28,
  },
  otpBox: {
    width:          46,
    height:         56,
    borderRadius:   12,
    borderWidth:    1.5,
    borderColor:    Colors.border,
    textAlign:      'center',
    fontSize:       22,
    fontWeight:     '700',
    color:          Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  otpBoxFilled: {
    borderColor:     Colors.primary,
    backgroundColor: Colors.primaryLight,
    color:           Colors.primaryMid,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
    marginBottom:    20,
  },
  verifyBtnDisabled: {
    opacity:         0.5,
  },
  verifyTe: {
    fontSize:        17,
    fontWeight:      '700',
    color:           '#fff',
  },
  verifyEn: {
    fontSize:        13,
    color:           'rgba(255,255,255,0.85)',
    marginTop:       2,
  },
  resendRow: {
    alignItems:      'center',
    marginBottom:    16,
  },
  resendActive: {
    fontSize:        14,
    color:           Colors.primary,
    fontWeight:      '500',
  },
  resendTimer: {
    fontSize:        13,
    color:           Colors.textMuted,
  },
  hint: {
    fontSize:        12,
    color:           Colors.textMuted,
    textAlign:       'center',
    lineHeight:      18,
  },
});

export default OTPScreen;