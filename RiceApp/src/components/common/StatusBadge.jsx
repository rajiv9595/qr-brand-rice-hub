// StatusBadge.jsx
// Displays a color-coded status badge for orders.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

const STATUS_CONFIG = {
  pending:   { te: 'వేచి ఉంది', en: 'Pending', color: Colors.warning, bg: Colors.warningBg },
  confirmed: { te: 'నిర్ధారించబడింది', en: 'Confirmed', color: Colors.info, bg: Colors.infoBg },
  shipped:   { te: 'పంపబడింది', en: 'Shipped', color: Colors.primary, bg: Colors.primaryLight },
  delivered: { te: 'అందజేయబడింది', en: 'Delivered', color: Colors.success, bg: Colors.successBg },
  cancelled: { te: 'రద్దు చేయబడింది', en: 'Cancelled', color: Colors.error, bg: Colors.errorBg },
};

const StatusBadge = ({ status = 'pending' }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.textTe, { color: config.color }]}>{config.te}</Text>
      <Text style={[styles.textEn, { color: config.color }]}>{config.en}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  textTe: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textEn: {
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});

export default StatusBadge;
