// AppHeader.jsx
// Standard header for all screens in RiceSelect.
// Supports Back button, Screen Title, and Subtitle (Bilingual).

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography, TextStyles } from '../../theme/typography';

const AppHeader = ({
  te,             // Telugu title
  en,             // English title
  showBack = true,
  rightContent,   // Optional element for right side
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.outer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.left}>
            {showBack && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            )}
            <View>
              <Text style={TextStyles.screenTitle}>{te}</Text>
              {en && <Text style={TextStyles.screenSubtitle}>{en}</Text>}
            </View>
          </View>

          <View style={styles.right}>
            {rightContent}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius:  20,
    borderBottomRightRadius: 20,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius:  8,
    elevation:     5,
  },
  safe: {
    paddingTop: 0,
  },
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical:   18,
  },
  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
  },
  backBtn: {
    width:          36,
    height:         36,
    borderRadius:   18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems:     'center',
    justifyContent: 'center',
  },
  backIcon: {
    color:      '#FFFFFF',
    fontSize:   22,
    fontWeight: 'bold',
  },
  right: {
    flexDirection: 'row',
    alignItems:    'center',
  },
});

export default AppHeader;
