import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { authService } from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { lang, setLang, t } = useLang();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const langs = [
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'en', label: 'English' },
  ];

  // Google Sign In - Moved to secondary position
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Logic: For Google, we try to login. 
      // If user is new, we navigate to RoleSelect inside AuthContext/authService logic or here
      const user = await authService.googleSignIn('customer');
      if (user) {
        // If the user is brand new (no role or just created), 
        // they should ideally go to RoleSelect. 
        // For now, let's assume login handles state.
        await login(user, user.token);
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      let msg = error.message || 'Google Sign In failed';
      if (msg.includes('DEVELOPER_ERROR')) {
        msg = 'SHA-1 signing key mismatch. Please follow GOOGLE_SIGNIN_FIX.md setup.';
      }
      Alert.alert(t('Error'), msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Phone OTP - Primary method for village users
  const sendOTP = async () => {
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert(t('Error'), 
        lang === 'te' ? 'దయచేసి 10 అంకెల నంబర్ ఇవ్వండి' : 
        lang === 'hi' ? 'कृपया 10 अंकों का नंबर दर्ज करें' : 
        'Please enter a 10-digit number'
      );
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${cleaned}`;

      // Bypass for test number
      if (cleaned === '9614346666') {
        navigation.navigate('OTP', { phone: fullNumber, confirmation: { dev: true } });
        return;
      }

      const confirmation = await auth().signInWithPhoneNumber(fullNumber);
      navigation.navigate('OTP', { phone: fullNumber, confirmation });
    } catch (error) {
      console.warn('OTP send error:', error);
      if (error.code === 'auth/billing-not-enabled') {
        Alert.alert('Billing Needed', 'Firebase requires Blaze plan for SMS. Use test number 9614346666 for now.');
      } else {
        Alert.alert(t('Error'), lang === 'te' ? 'OTP పంపడం విఫలమైంది' : 'OTP sending failed');
      }
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

      {/* Header with App Branding */}
      <View style={styles.topSection}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        <Text style={styles.appName}>{t('greeting')}</Text>
        <Text style={styles.tagline}>{t('greetingSub')}</Text>
      </View>

      <ScrollView
        style={styles.bottomSection}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Language Selection Bar */}
        <View style={styles.langBar}>
          {langs.map(({ code, label }) => (
            <TouchableOpacity
              key={code}
              style={[styles.langBtn, lang === code && styles.langBtnActive]}
              onPress={() => setLang(code)}
            >
              <Text style={[styles.langBtnText, lang === code && styles.langBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PRIMARY: Phone Login Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {lang === 'te' ? 'ఫోన్ నంబర్ ద్వారా లాగిన్' : lang === 'hi' ? 'फ़ोन नंबर से लॉगिन' : 'Login with Phone Number'}
          </Text>
        </View>

        <Text style={styles.inputLabel}>
          {lang === 'te' ? 'మీ నంబర్ ఇవ్వండి' : lang === 'hi' ? 'अपना नंबर दर्ज करें' : 'Enter your phone number'}
        </Text>
        
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
          />
        </View>

        <TouchableOpacity
          style={[styles.otpBtn, (!phone || loading) && styles.otpBtnDisabled]}
          onPress={sendOTP}
          disabled={!phone || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.otpBtnText}>
              {lang === 'te' ? 'OTP పంపండి' : lang === 'hi' ? 'OTP भेजें' : 'Send OTP'}
            </Text>
          )}
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{lang === 'te' ? 'లేదా' : 'OR'}</Text>
          <View style={styles.divider} />
        </View>

        {/* SECONDARY: Google Sign In */}
        <TouchableOpacity
          style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Icon name="google" size={20} color="#DB4437" />
              <Text style={styles.googleBtnText}>
                {lang === 'te' ? 'Gmail ద్వారా సైన్ ఇన్' : lang === 'hi' ? 'Google से साइन इन' : 'Continue with Google'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* New user / Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerLabel}>
            {lang === 'te' ? 'కొత్త వినియోగదారు?' : lang === 'hi' ? 'नए उपयोगकर्ता?' : 'New User?'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoleSelect')}>
            <Text style={styles.registerLink}> {lang === 'te' ? 'రిజిస్టర్ చేయండి' : lang === 'hi' ? 'रजिस्टर करें' : 'Register here'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 22,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  langBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 24,
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  langBtnTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    height: 60,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: 20,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
    backgroundColor: '#f8f9fa',
  },
  flag: { fontSize: 20 },
  code: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  otpBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  otpBtnDisabled: {
    backgroundColor: Colors.textMuted,
    elevation: 0,
  },
  otpBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default LoginScreen;