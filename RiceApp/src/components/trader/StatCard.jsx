// StatCard.jsx
// Displays a single statistic on the trader dashboard.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const StatCard = ({ labelTe, labelEn, value, color = Colors.primary }) => (
  <View style={styles.card}>
    <View style={[styles.iconBar, { backgroundColor: color }]} />
    <View style={styles.content}>
      <Text style={styles.value}>{value}</Text>
      <View>
        <Text style={styles.labelTe}>{labelTe}</Text>
        <Text style={styles.labelEn}>{labelEn}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBar: {
    width: 6,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  value: {
    fontSize: Typography.size.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  labelTe: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  labelEn: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatCard;
