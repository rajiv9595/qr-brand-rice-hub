// RiceApp/src/components/trader/StatCard.jsx
// Premium Stat Card for Traders
// Upgraded to handle professional icons and better visual hierarchy

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const StatCard = ({ labelTe, labelEn, value, icon, color = Colors.primary }) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon name={icon || 'chart-line'} size={24} color={color} />
    </View>
    <View style={styles.content}>
      <Text style={[styles.value, { color: color }]}>{value}</Text>
      <View style={styles.labelCol}>
        <Text style={styles.labelTe}>{labelTe}</Text>
        <Text style={styles.labelEn}>{labelEn}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    flexDirection: 'column',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  labelCol: {
    gap: 2,
  },
  labelTe: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  labelEn: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatCard;
