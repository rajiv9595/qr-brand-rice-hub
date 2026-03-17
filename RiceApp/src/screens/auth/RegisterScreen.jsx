import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { authService } from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { lang, t } = useLang();

  const roleFromParams = route.params?.role || 'customer';
  const [step, setStep] = useState('select'); // 'select' | 'email' | 'phone'
  
  // Phone State
  const [phone, setPhone] = useState('');
  
  // Email State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: roleFromParams
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const user = await authService.googleSignIn(formData.role);
      if (user) {
        await login(user, user.token);
      }
    } catch (error) {
      console.error('Google Sign Up error:', error);
      Alert.alert('Error', error.message || 'Google Sign Up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Error', 'Please enter a 10-digit number');
      return;
    }
    setLoading(true);
    try {
      const fullNumber = `+91${cleaned}`;
      if (cleaned === '9614346666') {
        navigation.navigate('OTP', { phone: fullNumber, confirmation: { dev: true }, role: formData.role });
        return;
      }
      const confirmation = await auth().signInWithPhoneNumber(fullNumber);
      navigation.navigate('OTP', { phone: fullNumber, confirmation, role: formData.role });
    } catch (error) {
      console.warn('OTP send error:', error);
      Alert.alert('Error', 'OTP sending failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.emailRegister(formData);
      if (user) {
        await login(user, user.token);
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      console.error('Email Register error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSelection = () => (
    <View style={styles.selectionView}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>QR</Text>
      </View>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>✅ Registering as {formData.role === 'customer' ? 'Buyer/Customer' : 'Trader/Seller'}</Text>
      </View>
      <Text style={styles.selectionTitle}>Join Us Today</Text>
      <Text style={styles.selectionSub}>Choose your registration method to get started</Text>

      <TouchableOpacity style={styles.methodCard} onPress={() => setStep('email')}>
        <View style={[styles.methodIconBox, { backgroundColor: '#e8f2ff' }]}>
          <Icon name="envelope" size={24} color="#007bff" />
        </View>
        <View style={styles.methodTextContent}>
          <Text style={styles.methodLabel}>Register with Email</Text>
          <Text style={styles.methodDesc}>Use your email and password</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.methodCard} onPress={() => setStep('phone')}>
        <View style={[styles.methodIconBox, { backgroundColor: '#e8f5e9' }]}>
          <Icon name="phone" size={24} color="#4caf50" />
        </View>
        <View style={styles.methodTextContent}>
          <Text style={styles.methodLabel}>Register with Phone</Text>
          <Text style={styles.methodDesc}>Fast sign up via OTP</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#ccc" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      {/* Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => step === 'select' ? navigation.goBack() : setStep('select')}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'select' ? 'Create New Account' : 'Register'}
        </Text>
      </View>

      <View style={styles.whiteCurveContainer}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {step === 'select' && renderSelection()}

          {step === 'phone' && (
            <View style={styles.formPadding}>
              <Text style={[styles.inputLabel, { color: '#2e7d32', marginBottom: 12 }]}>
                ✅ Registering as {formData.role === 'customer' ? 'Buyer' : 'Trader'}
              </Text>
              <Text style={styles.inputLabel}>Enter your phone number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.code}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (!phone || loading) && styles.submitBtnDisabled]}
                onPress={handlePhoneSubmit}
                disabled={!phone || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Verify to Register</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 'email' && (
            <View style={styles.formPadding}>
              <Text style={[styles.inputLabel, { color: '#2e7d32', marginBottom: 12 }]}>
                ✅ Registering as {formData.role === 'customer' ? 'Buyer' : 'Trader'}
              </Text>
              <View style={styles.roleContainer}>
                  {['customer', 'supplier'].map((r) => (
                      <View
                          key={r}
                          style={[
                            styles.roleBtn, 
                            formData.role === r ? styles.roleBtnActive : { opacity: 0.4, backgroundColor: '#f5f5f5' }
                          ]}
                      >
                          <Text style={[styles.roleBtnText, formData.role === r && styles.roleBtnTextActive]}>
                              {r === 'customer' ? 'Buyer/Customer' : 'Trader/Seller'}
                          </Text>
                      </View>
                  ))}
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(t) => setFormData({ ...formData, password: t })}
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!formData.email || !formData.password || !formData.name || loading) && styles.submitBtnDisabled]}
                onPress={handleEmailSubmit}
                disabled={!formData.email || !formData.password || !formData.name || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step !== 'select' && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
                onPress={handleGoogleSignUp}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#2e7d32" />
                ) : (
                  <>
                    <Icon name="google" size={20} color="#DB4437" />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Bottom Link */}
          <View style={styles.loginFooter}>
            <Text style={styles.loginLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2e7d32' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
  },
  whiteCurveContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
  },
  selectionView: {
    padding: 24,
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  roleBadgeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#43a047',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectionSub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Android shadow
    elevation: 2,
  },
  methodIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  methodDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  formPadding: {
    padding: 24,
  },
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 12, alignItems: 'center' },
  roleBtnActive: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  roleBtnText: { color: '#666', fontWeight: 'bold' },
  roleBtnTextActive: { color: '#2e7d32' },
  inputLabel: { fontSize: 13, color: '#666', fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12, height: 50, paddingHorizontal: 16, fontSize: 16, color: '#333', backgroundColor: '#fafafa', marginBottom: 16
  },
  phoneRow: {
    flexDirection: 'row', borderWidth: 1, borderColor: '#eee', borderRadius: 12, height: 60, overflow: 'hidden', backgroundColor: '#fafafa', marginBottom: 20,
  },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: '#eee', backgroundColor: '#fcfcfc',
  },
  flag: { fontSize: 20 },
  code: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  phoneInput: { flex: 1, fontSize: 18, paddingHorizontal: 16, color: '#333', fontWeight: 'bold', letterSpacing: 1 },
  submitBtn: {
    backgroundColor: '#2e7d32', borderRadius: 12, height: 55, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#ccc', elevation: 0 },
  submitBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 30, paddingHorizontal: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  orText: { marginHorizontal: 16, color: '#999', fontSize: 12, fontWeight: 'bold' },
  googleBtn: {
    flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, height: 55, alignItems: 'center', justifyContent: 'center', gap: 12, marginHorizontal: 24,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleBtnText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  loginFooter: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  loginLabel: { color: '#666' },
  loginLink: { color: '#2e7d32', fontWeight: 'bold' },
});

export default RegisterScreen;
