// ChipSelector.jsx
// Horizontal scrollable chip selection for Variety, Type, etc.
// Optimized for quick selection without typing.

import React from 'react';
import {
  ScrollView, TouchableOpacity, Text, StyleSheet, View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const ChipSelector = ({
  options = [], // [{ value, te, en }]
  selected,
  onSelect,
  style,
  itemStyle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.chip,
              active && styles.chipActive,
              itemStyle,
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.chipInner}>
              {opt.label ? (
                <Text style={[styles.teText, active && styles.textActive]}>{opt.label}</Text>
              ) : (
                <>
                  <Text style={[styles.teText, active && styles.textActive]}>{opt.te}</Text>
                  {opt.en && (
                    <Text style={[styles.enText, active && styles.textActive]}>{opt.en}</Text>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical:   10,
    paddingHorizontal: 16,
    gap:               10,
    flexDirection:     'row',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderRadius:      14,
    borderWidth:       1.5,
    borderColor:       '#CCCCCC', // Darker gray for better visibility
    minWidth:          90,
    alignItems:        'center',
    justifyContent:    'center',
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.1,
    shadowRadius:      4,
    elevation:         3,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor:     Colors.primary,
    elevation:       5,
  },
  chipInner: {
    alignItems: 'center',
  },
  teText: {
    fontSize:   Typography.size.base,
    fontWeight: '900',
    color:      Colors.textPrimary,
    textAlign:  'center',
  },
  enText: {
    fontSize:   Typography.size.xs,
    fontWeight: Typography.weight.regular,
    color:      Colors.textSecondary,
    marginTop:  2,
    textAlign:  'center',
  },
  textActive: {
    color: '#1B5E20', // Deep green for active text
  },
});

export default ChipSelector;
