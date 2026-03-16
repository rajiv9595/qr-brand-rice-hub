// DualText.jsx
// Shows Telugu label (big, bold) with English translation below (small, muted)
// Used on every button, category card, nav item — village users read Telugu first

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '../../theme/typography';
import { Colors } from '../../theme/colors';

const DualText = ({
  te,                  // Telugu string (primary)
  en,                  // English string (secondary)
  teSize,              // Override Telugu font size
  enSize,              // Override English font size
  teColor,             // Override Telugu color
  align = 'left',      // 'left' | 'center' | 'right'
  style,               // Container style override
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[
        styles.telugu,
        teSize  && { fontSize: teSize },
        teColor && { color: teColor },
        { textAlign: align },
      ]}>
        {te}
      </Text>
      {en && (
        <Text style={[
          styles.english,
          enSize && { fontSize: enSize },
          { textAlign: align },
        ]}>
          {en}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  telugu: {
    fontSize:   Typography.size.base,
    fontWeight: Typography.weight.medium,
    color:      Colors.textPrimary,
    lineHeight: Typography.size.base * 1.35,
  },
  english: {
    fontSize:   Typography.size.sm,
    fontWeight: Typography.weight.regular,
    color:      Colors.textSecondary,
    lineHeight: Typography.size.sm * 1.3,
    marginTop:  1,
  },
});

export default DualText;
