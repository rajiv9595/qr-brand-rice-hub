// Village-first typography
// Rule: Nothing below 14sp. Prefer 16-18sp for body text.
// Every label has Telugu (bold, big) + English (regular, small) variant

import { StyleSheet } from 'react-native';

export const Typography = {
  // Sizes — all in sp (scales with user's accessibility settings)
  size: {
    xs:     12, // Only for badges/chips
    sm:     14, // Captions, secondary labels
    base:   16, // Body text (minimum for readability)
    md:     18, // Sub-headings, price text
    lg:     20, // Section headings
    xl:     24, // Screen titles
    xxl:    28, // Big numbers (prices, counts)
    hero:   34, // Splash / greeting
  },

  // Weights
  weight: {
    regular: '400',
    medium:  '500',
    bold:    '700',
  },

  // Line heights
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },
};

// Reusable text styles
export const TextStyles = StyleSheet.create({
  // Telugu-first label: big Telugu + small English stacked
  teLabel: {
    fontSize:   Typography.size.base,
    fontWeight: Typography.weight.medium,
    color:      '#212121',
    lineHeight: Typography.size.base * 1.3,
  },
  enLabel: {
    fontSize:   Typography.size.sm,
    fontWeight: Typography.weight.regular,
    color:      '#666666',
    lineHeight: Typography.size.sm * 1.3,
  },

  // Price text
  priceMain: {
    fontSize:   Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color:      '#2E7D32',
  },
  priceStrike: {
    fontSize:   Typography.size.base,
    fontWeight: Typography.weight.regular,
    color:      '#AAAAAA',
    textDecorationLine: 'line-through',
  },

  // Section title
  sectionTitle: {
    fontSize:        Typography.size.xs,
    fontWeight:      Typography.weight.bold,
    color:           '#888888',
    letterSpacing:   0.8,
    textTransform:   'uppercase',
    marginBottom:    8,
    marginTop:       16,
  },

  // Screen heading on green topbar
  screenTitle: {
    fontSize:   Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color:      '#FFFFFF',
  },
  screenSubtitle: {
    fontSize:   Typography.size.sm,
    fontWeight: Typography.weight.regular,
    color:      'rgba(255,255,255,0.8)',
    marginTop:  2,
  },
});
