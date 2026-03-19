// RiceSelect/src/screens/auth/RegisterScreen.jsx
// Premium Registration Flow for RiceHub
// Upgraded with role selection cards, Material Icons, and branded LoadingSpinner

import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authService } from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { lang, t } = useLang();

  const roleFromParams = route.params?.role || 'customer';
  const [step, setStep] = useState('select'); // 'select' | 'email' | 'phone'
  const [loading, setLoading] = useState(false);
  
  // Phone State
  const [phone, setPhone] = useState('');
  
  // Email State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: roleFromParams,
  });

  const handleEmailRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.emailRegister(formData);
      if (res.data.success) {
        // Token is IN the data object
        await login(res.data.data, res.data.data.token);
      }
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const userData = await authService.googleSignIn(formData.role);
      if (userData?.token) {
        await login(userData, userData.token);
      }
    } catch (e) {
      Alert.alert('Google Signup Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(fullPhone);
      setLoading(false);
      navigation.navigate('OTP', { phone: fullPhone, confirmation, role: formData.role });
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', e.message || 'Failed to send OTP. Try again.');
    }
  };

  const renderSelection = () => (
    <View style={styles.selectionView}>
      <Text style={styles.selectionTitle}>{lang === 'te' ? 'నమోదు చేసుకోండి' : lang === 'hi' ? 'अकाउंट बनाएं' : 'Register Account'}</Text>
      <Text style={styles.selectionSub}>{lang === 'te' ? 'ప్రారంభించడానికి ఒక పద్ధతిని ఎంచుకోండి' : lang === 'hi' ? 'शुरू करने के लिए एक तरीका चुनें' : 'Choose a method to get started'}</Text>
      
      <TouchableOpacity 
        style={[styles.methodCard, { borderColor: Colors.primary }]} 
        onPress={() => setStep('phone')}
      >
        <View style={[styles.methodIconBox, { backgroundColor: Colors.primaryLight }]}>
          <Icon name="phone" size={24} color={Colors.primary} />
        </View>
        <View style={styles.methodTextContent}>
          <Text style={styles.methodLabel}>{lang === 'te' ? 'ఫోన్ నంబర్' : lang === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}</Text>
          <Text style={styles.methodDesc}>{lang === 'te' ? 'OTP ద్వారా నమోదు' : lang === 'hi' ? 'OTP द्वारा सुरक्षित' : 'Safe & Fast via OTP'}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.methodCard} 
        onPress={() => setStep('email')}
      >
        <View style={[styles.methodIconBox, { backgroundColor: '#F3F4F6' }]}>
          <Icon name="email-outline" size={24} color={Colors.textSecondary} />
        </View>
        <View style={styles.methodTextContent}>
          <Text style={styles.methodLabel}>{lang === 'te' ? 'ఈమెయిల్' : lang === 'hi' ? 'ईमेल' : 'Email Address'}</Text>
          <Text style={styles.methodDesc}>{lang === 'te' ? 'పాస్‌వర్డ్ ద్వారా నమోదు' : lang === 'hi' ? 'पासवर्ड के माध्यम से' : 'Use your email & password'}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LoadingSpinner visible={loading} fullScreen message="Creating your account..." />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step === 'select' ? navigation.goBack() : setStep('select')}>
              <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          </View>

          {step === 'select' ? renderSelection() : (
            <View style={styles.formPadding}>
              <Text style={styles.formTitle}>{step === 'email' ? (lang === 'te' ? 'ఈమెయిల్ సైన్అప్' : lang === 'hi' ? 'ईमेल साइनअप' : 'Signup with Email') : (lang === 'te' ? 'త్వరిత సైన్అప్' : lang === 'hi' ? 'त्वरित साइनअप' : 'Quick Signup')}</Text>
              
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleBtn, formData.role === 'customer' && styles.roleBtnActive]}
                  onPress={() => setFormData({...formData, role: 'customer'})}
                >
                   <Text style={[styles.roleBtnText, formData.role === 'customer' && styles.roleBtnTextActive]}>{lang === 'te' ? 'కొనేవారు' : lang === 'hi' ? 'खरीदार' : 'BUYER'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleBtn, formData.role === 'supplier' && styles.roleBtnActive]}
                  onPress={() => setFormData({...formData, role: 'supplier'})}
                >
                   <Text style={[styles.roleBtnText, formData.role === 'supplier' && styles.roleBtnTextActive]}>{lang === 'te' ? 'అమ్మేవారు' : lang === 'hi' ? 'विक्रेता' : 'TRADER'}</Text>
                </TouchableOpacity>
              </View>

              {step === 'email' ? (
                <>
                  <Text style={styles.inputLabel}>{lang === 'te' ? 'పూర్తి పేరు' : lang === 'hi' ? 'पूरा नाम' : 'FULL NAME'}</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="John Doe" 
                    value={formData.name} 
                    onChangeText={v => setFormData({...formData, name: v})} 
                  />
                  <Text style={styles.inputLabel}>{lang === 'te' ? 'ఈమెయిల్ చిరునామా' : lang === 'hi' ? 'ईमेल पता' : 'EMAIL ADDRESS'}</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="name@example.com" 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    value={formData.email} 
                    onChangeText={v => setFormData({...formData, email: v})} 
                  />
                  <Text style={styles.inputLabel}>{lang === 'te' ? 'పాస్‌వర్డ్' : lang === 'hi' ? 'पासवर्ड' : 'PASSWORD'}</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    secureTextEntry 
                    value={formData.password} 
                    onChangeText={v => setFormData({...formData, password: v})} 
                  />
                  <TouchableOpacity style={styles.submitBtn} onPress={handleEmailRegister}>
                    <Text style={styles.submitBtnText}>{lang === 'te' ? 'ఖాతా సృష్టించండి' : lang === 'hi' ? 'अकाउंट बनाएं' : 'Create Account'}</Text>
                  </TouchableOpacity>

                  <View style={styles.dividerRow}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                  </View>

                  <TouchableOpacity 
                    style={styles.googleBtn} 
                    onPress={handleGoogleRegister}
                  >
                    <Icon name="google" size={20} color="#DB4437" />
                    <Text style={styles.googleBtnText}>{lang === 'te' ? 'Google తో కొనసాగండి' : lang === 'hi' ? 'Google से जारी रखें' : 'Continue with Google'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>{lang === 'te' ? 'ఫోన్ నంబర్' : lang === 'hi' ? 'फ़ोन नंबर' : 'PHONE NUMBER'}</Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryCode}>
                      <Text style={styles.flag}>🇮🇳</Text>
                      <Text style={styles.code}>+91</Text>
                    </View>
                    <TextInput 
                      style={styles.phoneInput} 
                      placeholder="98765 43210" 
                      keyboardType="phone-pad" 
                      maxLength={10} 
                      value={phone} 
                      onChangeText={setPhone} 
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.submitBtn, phone.length < 10 && styles.submitBtnDisabled]} 
                    onPress={handlePhoneRegister}
                    disabled={phone.length < 10}
                  >
                    <Text style={styles.submitBtnText}>{lang === 'te' ? 'OTP పొందండి' : lang === 'hi' ? 'OTP प्राप्त करें' : 'Get OTP Code'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          <View style={styles.loginFooter}>
            <Text style={styles.loginLabel}>{lang === 'te' ? 'ఇప్పటికే ఖాతా ఉందా?' : lang === 'hi' ? 'पहले से ही अकाउंट है?' : 'Already have an account? '} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{lang === 'te' ? 'సైన్ ఇన్' : lang === 'hi' ? 'साइन इन' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { paddingHorizontal: 24, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 24, top: 50, padding: 8 },
  logoImage: { width: 56, height: 56, borderRadius: 16, marginTop: 30, resizeMode: 'contain' },
  
  selectionView: { padding: 30, alignItems: 'center', flex: 1, justifyContent: 'center' },
  selectionTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, marginBottom: 8 },
  selectionSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 40, textAlign: 'center' },
  
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  methodIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodTextContent: { flex: 1, marginLeft: 20 },
  methodLabel: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
  methodDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  
  formPadding: { padding: 24 },
  formTitle: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, marginBottom: 24, textAlign: 'center' },
  
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: { flex: 1, padding: 14, borderWidth: 2, borderColor: '#F3F4F6', borderRadius: 16, alignItems: 'center' },
  roleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleBtnText: { color: Colors.textSecondary, fontWeight: '900', fontSize: 13 },
  roleBtnTextActive: { color: Colors.primary },
  
  inputLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '900', marginBottom: 8, marginLeft: 4, letterSpacing: 1 },
  input: {
    borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 16, height: 56, paddingHorizontal: 16, fontSize: 16, color: Colors.textPrimary, backgroundColor: '#F9FAFB', marginBottom: 20, fontWeight: '600'
  },
  phoneRow: {
    flexDirection: 'row', borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 16, height: 60, overflow: 'hidden', backgroundColor: '#F9FAFB', marginBottom: 24,
  },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRightWidth: 1.5, borderRightColor: '#F3F4F6',
  },
  flag: { fontSize: 20 },
  code: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
  phoneInput: { flex: 1, fontSize: 18, paddingHorizontal: 16, color: Colors.textPrimary, fontWeight: '900', letterSpacing: 1 },
  
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 18, height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4, shadowColor: Colors.primary, shadowOpacity: 0.3,
  },
  submitBtnDisabled: { backgroundColor: '#E5E7EB', elevation: 0 },
  submitBtnText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  
  loginFooter: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  loginLabel: { color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '900' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1.5, backgroundColor: '#F3F4F6' },
  orText: { marginHorizontal: 16, color: Colors.textMuted, fontSize: 12, fontWeight: '900' },
  
  googleBtn: {
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderWidth: 1.5, 
    borderColor: '#F3F4F6', 
    borderRadius: 18, 
    height: 60, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  googleBtnText: { fontSize: 16, fontWeight: '900', color: Colors.textPrimary },
});

export default RegisterScreen;
