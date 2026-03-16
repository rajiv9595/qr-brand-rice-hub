// BigButton.jsx
// Large, accessible CTA button. Min height 64dp — village users with thick fingers.
// Supports green (primary) and orange (accent) variants.

import React from 'react';
import {
  TouchableOpacity, Text, View, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const BigButton = ({
  te,               // Telugu label (primary, bigger)
  en,               // English label (smaller, below)
  onPress,
  variant = 'green', // 'green' | 'orange' | 'outline'
  loading = false,
  disabled = false,
  style,
  icon,             // Optional left icon element
}) => {
  const bg = variant === 'orange'  ? Colors.accent
           : variant === 'outline' ? Colors.white
           : Colors.primary;

  const textColor = variant === 'outline' ? Colors.primary : Colors.textOnGreen;
  const borderColor = variant === 'outline' ? Colors.primary : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'outline' ? 1.5 : 0 },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <View>
            <Text style={[styles.teText, { color: textColor }]}>{te}</Text>
            {en && (
              <Text style={[styles.enText, { color: textColor, opacity: 0.85 }]}>{en}</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight:     64,
    borderRadius:  14,
    paddingHorizontal: 20,
    paddingVertical:   14,
    justifyContent: 'center',
    alignItems:     'center',
    width:          '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  icon: {
    marginRight: 6,
  },
  teText: {
    fontSize:   Typography.size.md,
    fontWeight: Typography.weight.bold,
    textAlign:  'center',
  },
  enText: {
    fontSize:   Typography.size.sm,
    fontWeight: Typography.weight.regular,
    textAlign:  'center',
    marginTop:  2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BigButton;
