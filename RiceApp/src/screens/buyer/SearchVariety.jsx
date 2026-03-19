import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';

const VARIETIES = [
  { key: 'Sona Masuri', emoji: '🌾', te: 'సోనా మసూరి' },
  { key: 'BPT 5204',   emoji: '🍚', te: 'బిపిటి 5204' },
  { key: 'Basmati',    emoji: '✨', te: 'బాస్మతి'     },
  { key: 'HMT',        emoji: '🌿', te: 'హెచ్‌ఎంటి'   },
  { key: 'RNR',        emoji: '🌱', te: 'ఆర్‌ఎన్‌ఆర్' },
  { key: 'Kolam',      emoji: '💚', te: 'కోలం'         },
  { key: 'Organic',    emoji: '🍃', te: 'సేంద్రీయ'     },
  { key: 'Diabetic',   emoji: '💊', te: 'మధుమేహ'       },
  { key: 'Other',      emoji: '➕', te: 'ఇతర'          },
];

const SearchVariety = () => {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);

  const handleSelect = (variety) => {
    setSelected(variety);
    navigation.navigate('SearchType', { variety });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>బియ్యం ఎంచుకోండి</Text>
          <Text style={styles.subtitle}>Step 1 of 3 · Choose variety</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        <Text style={styles.sectionLabel}>ఏ బియ్యం కావాలి? / Which variety?</Text>
        <View style={styles.cardGrid}>
          {VARIETIES.map((v) => (
            <TouchableOpacity
              key={v.key}
              style={[styles.card, selected === v.key && styles.cardActive]}
              onPress={() => handleSelect(v.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>{v.emoji}</Text>
              <Text style={styles.cardName}>{v.key}</Text>
              <Text style={styles.cardTe}>{v.te}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  topBar:       { backgroundColor: Colors.primary, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:      { padding: 4 },
  backText:     { fontSize: 22, color: '#fff' },
  title:        { fontSize: 17, fontWeight: '700', color: '#fff' },
  subtitle:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  grid:         { padding: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  cardGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card:         { width: '30%', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, padding: 12, alignItems: 'center', gap: 4 },
  cardActive:   { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  cardEmoji:    { fontSize: 28 },
  cardName:     { fontSize: 12, fontWeight: '500', color: Colors.textPrimary, textAlign: 'center' },
  cardTe:       { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
});

export default SearchVariety;