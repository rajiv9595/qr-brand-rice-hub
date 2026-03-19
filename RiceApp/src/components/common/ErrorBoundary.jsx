// RiceApp/src/components/common/ErrorBoundary.jsx
// Safety net for the entire app. Catches unexpected crashes and shows a professional recovery screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme/colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Here we would link to a tool like Sentry to track the bug
    console.error('CRITICAL APP CRASH:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    // Attempt to reload the app state
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
                <Icon name="alert-octagon" size={60} color={Colors.primary} />
            </View>
            <Text style={styles.title}>నమస్కారం, చిన్న అంతరాయం!</Text>
            <Text style={styles.subtitle}>Oops! Something went wrong.</Text>
            <Text style={styles.desc}>
              We've encountered a small technical issue. Please tap the button below to refresh the app.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={this.handleReset}>
              <Text style={styles.retryText}>REFRESH APP</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: Colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
  },
  title: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary, marginTop: 4, marginBottom: 20 },
  desc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    elevation: 4,
  },
  retryText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});

export default ErrorBoundary;
