import React, { useState, useRef }          from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets }                from 'react-native-safe-area-context';
import { useNavigation }                   from '@react-navigation/native';
import auth                                from '@react-native-firebase/auth';
import { Colors }                          from '../../theme/colors';
import { Typography }                      from '../../theme/typography';
import { useLang }                         from '../../context/LangContext';

const LoginScreen = () => {
  const navigation         = useNavigation();
  const insets             = useSafeAreaInsets();
  const { lang, setLang }  = useLang();
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);

  const langs = [
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिंदी'  },
    { code: 'en', label: 'English' },
  ];

  const sendOTP = async () => {
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('తప్పు నంబర్', 'Please enter a valid 10-digit number');
      return;
    }
    setLoading(true);
    try {
      const fullNumber    = `+91${cleaned}`;
      
      // Development Bypass: If number is 9614346666, skip Firebase and go to OTP
      if (cleaned === '9614346666') {
        navigation.navigate('OTP', { phone: fullNumber, confirmation: { dev: true } });
        return;
      }

      const confirmation  = await auth().signInWithPhoneNumber(fullNumber);
      navigation.navigate('OTP', { phone: fullNumber, confirmation });
    } catch (error) {
      console.warn('OTP send error:', error);
      Alert.alert(
        'Error',
        error.code === 'auth/too-many-requests'
          ? 'చాలా attempts. కొద్దిసేపు wait చేయండి / Too many attempts. Wait a moment.'
          : 'OTP పంపడం విఫలమైంది / Failed to send OTP. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Green top section */}
      <View style={styles.topSection}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>QR</Text>
        </View>
        <Text style={styles.appName}>రైతు బజార్</Text>
        <Text style={styles.taglineTe}>సరైన బియ్యం · సరైన ధర</Text>
        <Text style={styles.taglineEn}>Right Rice · Right Price</Text>
      </View>

      {/* White bottom section */}
      <View style={styles.bottomSection}>

        {/* Language selector */}
        <Text style={styles.langLabel}>భాష ఎంచుకోండి / Choose language</Text>
        <View style={styles.langRow}>
          {langs.map(({ code, label }) => (
            <TouchableOpacity
              key={code}
              style={[styles.langBtn, lang === code && styles.langBtnActive]}
              onPress={() => setLang(code)}
            >
              <Text style={[styles.langBtnText, lang === code && styles.langBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone input */}
        <Text style={styles.inputLabel}>మీ నంబర్ ఇవ్వండి / Enter phone number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.code}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="98765 43210"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
        </View>

        {/* Send OTP button */}
        <TouchableOpacity
          style={[styles.otpBtn, (!phone || loading) && styles.otpBtnDisabled]}
          onPress={sendOTP}
          disabled={!phone || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.otpBtnTe}>OTP పంపండి</Text>
                <Text style={styles.otpBtnEn}>Send OTP →</Text>
              </>
          }
        </TouchableOpacity>

        <Text style={styles.hint}>
          మీ నంబర్‌కు OTP వస్తుంది{'\n'}OTP will be sent to your number
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingBottom:   20,
  },
  logoBox: {
    width:           72,
    height:          72,
    borderRadius:    18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    14,
  },
  logoText: {
    fontSize:        28,
    fontWeight:      '700',
    color:           '#fff',
  },
  appName: {
    fontSize:        28,
    fontWeight:      '700',
    color:           '#fff',
    marginBottom:    4,
  },
  taglineTe: {
    fontSize:        16,
    color:           'rgba(255,255,255,0.9)',
    marginBottom:    2,
  },
  taglineEn: {
    fontSize:        13,
    color:           'rgba(255,255,255,0.7)',
  },
  bottomSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    padding:         24,
    paddingBottom:   40,
  },
  langLabel: {
    fontSize:        12,
    color:           Colors.textSecondary,
    textAlign:       'center',
    marginBottom:    10,
  },
  langRow: {
    flexDirection:   'row',
    justifyContent:  'center',
    gap:             10,
    marginBottom:    24,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  langBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor:     Colors.primary,
  },
  langBtnText: {
    fontSize:        13,
    color:           Colors.textSecondary,
  },
  langBtnTextActive: {
    color:           Colors.primaryMid,
    fontWeight:      '500',
  },
  inputLabel: {
    fontSize:        15,
    fontWeight:      '500',
    color:           Colors.textPrimary,
    marginBottom:    10,
  },
  phoneRow: {
    flexDirection:   'row',
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    12,
    overflow:        'hidden',
    marginBottom:    20,
    height:          56,
  },
  countryCode: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  flag: {
    fontSize:        18,
  },
  code: {
    fontSize:        15,
    fontWeight:      '500',
    color:           Colors.textPrimary,
  },
  phoneInput: {
    flex:            1,
    fontSize:        18,
    paddingHorizontal: 14,
    color:           Colors.textPrimary,
    letterSpacing:   1,
  },
  otpBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
    marginBottom:    16,
  },
  otpBtnDisabled: {
    opacity:         0.5,
  },
  otpBtnTe: {
    fontSize:        17,
    fontWeight:      '700',
    color:           '#fff',
  },
  otpBtnEn: {
    fontSize:        13,
    color:           'rgba(255,255,255,0.85)',
    marginTop:       2,
  },
  hint: {
    fontSize:        12,
    color:           Colors.textMuted,
    textAlign:       'center',
    lineHeight:      18,
  },
});

export default LoginScreen;