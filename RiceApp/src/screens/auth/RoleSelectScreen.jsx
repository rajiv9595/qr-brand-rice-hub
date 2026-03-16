import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext }         from '../../context/AuthContext';
import { Colors }              from '../../theme/colors';

const RoleSelectScreen = () => {
  const navigation        = useNavigation();
  const route             = useRoute();
  const insets            = useSafeAreaInsets();
  const { login }         = useContext(AuthContext);
  const { phone, idToken } = route.params;

  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);

  const roles = [
    {
      key:    'customer',
      emoji:  '🛒',
      te:     'కొనేవారు',
      en:     'Customer / Buyer',
      desc:   'బియ్యం కొనాలనుకుంటున్నారు\nI want to buy rice',
    },
    {
      key:    'supplier',
      emoji:  '🏪',
      te:     'అమ్మేవారు',
      en:     'Trader / Seller',
      desc:   'బియ్యం అమ్మాలనుకుంటున్నారు\nI want to sell rice',
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.API_BASE_URL || 'https://your-backend.onrender.com/api'}/auth/register-firebase`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ idToken, phone, role: selected }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await login(data.data, data.data.token);
      } else {
        Alert.alert('Error', data.message || 'Registration failed. Try again.');
      }
    } catch (e) {
      console.warn('RoleSelect error:', e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <View style={styles.topSection}>
        <Text style={styles.title}>మీరు ఎవరు?</Text>
        <Text style={styles.titleEn}>Who are you?</Text>
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
            <Text style={styles.roleTe}>{role.te}</Text>
            <Text style={styles.roleEn}>{role.en}</Text>
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
                <Text style={styles.continueTe}>కొనసాగించు</Text>
                <Text style={styles.continueEn}>Continue →</Text>
              </>
          }
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical:   32,
    alignItems:        'center',
  },
  title: {
    fontSize:        28,
    fontWeight:      '700',
    color:           '#fff',
  },
  titleEn: {
    fontSize:        15,
    color:           'rgba(255,255,255,0.8)',
    marginTop:       4,
  },
  bottomSection: {
    flex:                 1,
    backgroundColor:      Colors.white,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    padding:              24,
    gap:                  14,
  },
  roleCard: {
    borderWidth:     1.5,
    borderColor:     Colors.border,
    borderRadius:    18,
    padding:         20,
    alignItems:      'center',
    gap:             4,
    position:        'relative',
    backgroundColor: Colors.white,
  },
  roleCardActive: {
    borderColor:     Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleEmoji: {
    fontSize:        44,
    marginBottom:    4,
  },
  roleTe: {
    fontSize:        20,
    fontWeight:      '700',
    color:           Colors.textPrimary,
  },
  roleEn: {
    fontSize:        14,
    color:           Colors.primary,
    fontWeight:      '500',
  },
  roleDesc: {
    fontSize:        13,
    color:           Colors.textSecondary,
    textAlign:       'center',
    lineHeight:      20,
    marginTop:       4,
  },
  checkMark: {
    position:        'absolute',
    top:             12,
    right:           14,
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  checkText: {
    color:           '#fff',
    fontSize:        14,
    fontWeight:      '700',
  },
  continueBtn: {
    backgroundColor: Colors.accent,
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
    marginTop:       8,
  },
  continueBtnDisabled: {
    opacity:         0.5,
  },
  continueTe: {
    fontSize:        17,
    fontWeight:      '700',
    color:           '#fff',
  },
  continueEn: {
    fontSize:        13,
    color:           'rgba(255,255,255,0.85)',
    marginTop:       2,
  },
});

export default RoleSelectScreen;