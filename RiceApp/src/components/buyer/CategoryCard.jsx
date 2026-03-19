// CategoryCard.jsx
// Visual category button for the buyer home screen.

import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const CategoryCard = ({ icon, te, en, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, { borderColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <Text style={styles.teText}>{te}</Text>
    <Text style={styles.enText}>{en}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  teText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  enText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default CategoryCard;
