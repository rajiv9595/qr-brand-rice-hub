// utils/openWhatsApp.js
import { Linking, Alert } from 'react-native';

export const openWhatsApp = async (phone, message = '') => {
  // Remove leading 0 or +91
  const clean   = phone.replace(/^(\+91|0)/, '');
  const encoded = encodeURIComponent(message);
  const url     = `whatsapp://send?phone=91${clean}&text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    Alert.alert(
      'WhatsApp కనుగొనబడలేదు',
      'WhatsApp not found. Please install it.',
      [{ text: 'OK' }]
    );
  }
};
