// RiceApp/src/components/common/LoadingSpinner.jsx
// Premium Branded Loading Spinner for RiceHub
// Features: Glass-morphism overlay, branded colors, and smooth rotations

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { Colors } from '../../theme/colors';

const LoadingSpinner = ({ visible, fullScreen = false, message = 'Loading...', inline = false }) => {
  if (!visible) return null;

  if (inline) {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={fullScreen ? styles.fullScreenOverlay : styles.centeredOverlay}>
        <View style={styles.spinnerCard}>
          <ActivityIndicator color={Colors.primary} size="large" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Glass-faint backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerCard: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    minWidth: 140,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inlineContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;
