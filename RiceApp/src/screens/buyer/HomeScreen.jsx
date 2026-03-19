// screens/buyer/HomeScreen.jsx
// Buyer Home Screen — the first thing a village user sees after login.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, Image, StyleSheet, StatusBar, SafeAreaView,
  ActivityIndicator, RefreshControl, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets }  from 'react-native-safe-area-context';
import { useNavigation }      from '@react-navigation/native';
import Voice                  from '@react-native-voice/voice';

import { Colors }             from '../../theme/colors';
import { Typography }         from '../../theme/typography';
import { useLang }            from '../../context/LangContext';
import { useLocation }        from '../../context/LocationContext';
import { useDeals }           from '../../hooks/useDeals';
import { formatCurrency }     from '../../utils/formatCurrency';
import { formatDistance }     from '../../utils/formatDistance';
import { openWhatsApp }       from '../../utils/openWhatsApp';
import SkeletonCard          from '../../components/common/SkeletonCard';

// ─── Sub-component: Language Toggle Pill ─────────────────────────────────────
const LangToggle = () => {
  const { lang, setLang } = useLang();
  const langs = [
    { code: 'te', label: 'తె' },
    { code: 'hi', label: 'हि' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <View style={styles.langToggle}>
      {langs.map(({ code, label }) => (
        <TouchableOpacity
          key={code}
          onPress={() => setLang(code)}
          style={[styles.langPill, lang === code && styles.langPillActive]}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.langText, lang === code && styles.langTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── Sub-component: Category Card ────────────────────────────────────────────
const CategoryCard = ({ icon, te, en, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.catCard, isActive && styles.catCardActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={styles.catIconWrap}>
      <Text style={styles.catIcon}>{icon}</Text>
    </View>
    <Text style={styles.catTe}>{te}</Text>
    <Text style={styles.catEn}>{en}</Text>
  </TouchableOpacity>
);

// ─── Sub-component: Deal Card (horizontal scroll) ─────────────────────────────
const DealCard = ({ item, onPress }) => {
  if (!item) return null;

  return (
    <TouchableOpacity style={styles.dealCard} onPress={onPress} activeOpacity={0.82}>
      {/* Rice photo or placeholder */}
      {item.bagImageUrl ? (
        <Image
          source={{ uri: item.bagImageUrl }}
          style={styles.dealImg}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.dealImg, styles.dealImgPlaceholder]}>
          <Text style={{ fontSize: 32 }}>🌾</Text>
        </View>
      )}

      {/* Usage category badge — like "DAILY FAMILY USE" on website */}
      {item.usageCategory && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {item.usageCategory.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.dealInfo}>
        <Text style={styles.dealName} numberOfLines={1}>{item.productName || item.brandName || 'Rice'}</Text>
        <Text style={styles.dealVariety}>{item.riceVariety || ''} · {item.packWeight || 26}kg</Text>

        <View style={styles.dealPriceRow}>
          <Text style={styles.dealPrice}>{formatCurrency(item.price || item.pricePerBag)}</Text>
          {item.stockAvailable > 0 && (
            <View style={[styles.saveBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.saveBadgeText, { color: '#2E7D32' }]}>● In Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.dealDistRow}>
          <Text style={styles.dealDistText}>
            🏪 {item.shopName || 'Rice Shop'}
          </Text>
        </View>

        {item.shopDistrict ? (
          <Text style={styles.dealShopName} numberOfLines={1}>📍 {item.shopDistrict}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

// ─── Sub-component: Market Price Row ─────────────────────────────────────────
const MarketPriceRow = ({ variety, avgPrice, minPrice, maxPrice, trend, count }) => {
  return (
    <View style={styles.priceRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.priceVariety}>{variety}</Text>
        {count > 0 && (
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>{count} listings</Text>
        )}
      </View>
      <View style={styles.priceRight}>
        <Text style={styles.priceAmount}>₹{avgPrice}/bag</Text>
        {minPrice && maxPrice && minPrice !== maxPrice && (
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>
            ₹{minPrice} - ₹{maxPrice}
          </Text>
        )}
      </View>
    </View>
  );
};

// ─── Sub-component: Search Bar ────────────────────────────────────────────────
const SearchBar = ({ onPress, onVoiceResult }) => {
  const { t }          = useLang();
  const [listening, setListening] = useState(false);
  const micAnim        = useRef(new Animated.Value(1)).current;

  // Pulse animation when mic is active
  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnim, { toValue: 1.25, duration: 500, useNativeDriver: true }),
          Animated.timing(micAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      micAnim.stopAnimation();
      micAnim.setValue(1);
    }
  }, [listening]);

  // Voice recognition setup
  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const result = e.value?.[0] ?? '';
      setListening(false);
      if (result && onVoiceResult) onVoiceResult(result);
    };
    Voice.onSpeechError = () => setListening(false);
    return () => { Voice.destroy().then(Voice.removeAllListeners); };
  }, []);

  const toggleVoice = async () => {
    if (listening) {
      await Voice.stop();
      setListening(false);
    } else {
      try {
        setListening(true);
        await Voice.start('te-IN');
      } catch (e) {
        setListening(false);
      }
    }
  };

  return (
    <View style={styles.searchWrap}>
      <TouchableOpacity style={styles.searchBar} activeOpacity={1} onPress={onPress}>
        <Text style={{ fontSize: 20 }}>🔍</Text>
        <Text style={styles.searchPlaceholder}>{t('searchPlaceholder')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton} onPress={toggleVoice}>
        <Animated.View style={{ transform: [{ scale: micAnim }] }}>
          <Text style={{ fontSize: 24 }}>{listening ? '🛑' : '🎤'}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const insets           = useSafeAreaInsets();
  const navigation       = useNavigation();
  const { t }            = useLang();
  const { location }     = useLocation();
  const { syncUser }     = React.useContext(require('../../context/AuthContext').AuthContext);
  const { deals, marketPrices, loading, refetch } = useDeals(location);

  const onRefresh = async () => {
    await Promise.all([refetch(), syncUser()]);
  };

  const [activeCat, setActiveCat] = useState('all');

  // Map app category keys to backend USAGE_CATEGORIES values
  const CATEGORY_MAP = {
    all:      null,
    daily:    'Daily Cooking',
    function: 'Function & Event',
    healthy:  'Healthy Rice',
  };

  // Filter deals by selected category
  const filteredDeals = activeCat === 'all'
    ? deals
    : deals.filter(d => d.usageCategory === CATEGORY_MAP[activeCat]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ─── Header Section ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('greeting')}</Text>
          <Text style={styles.greetingSub}>{t('greetingSub')}</Text>
        </View>
        <LangToggle />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* ─── Search ─── */}
        <SearchBar
          onPress={() => navigation.navigate('Search')}
          onVoiceResult={(text) => navigation.navigate('Search', { query: text })}
        />

        {/* ─── Categories ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('whatDoYouNeed')}</Text>
        </View>
        <View style={styles.catGrid}>
          <CategoryCard
            icon="📋" te="అన్నీ" en="All"
            isActive={activeCat === 'all'}
            onPress={() => setActiveCat('all')}
          />
          <CategoryCard
            icon="🍚" te={t('daily')} en="Daily Use"
            isActive={activeCat === 'daily'}
            onPress={() => setActiveCat('daily')}
          />
          <CategoryCard
            icon="🎉" te={t('function')} en="Functions"
            isActive={activeCat === 'function'}
            onPress={() => setActiveCat('function')}
          />
          <CategoryCard
            icon="💪" te={t('healthy')} en="Healthy"
            isActive={activeCat === 'healthy'}
            onPress={() => setActiveCat('healthy')}
          />
        </View>

        {/* ─── Best Deals ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('bestDeals')}</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('NearbyShops', { variety: '', type: '' })}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        {loading && deals.length === 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsList}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </ScrollView>
        ) : filteredDeals.length === 0 ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              {activeCat === 'all' 
                ? 'No rice listings available yet.' 
                : `No ${CATEGORY_MAP[activeCat]} rice found. Try "All" category!`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredDeals}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DealCard item={item} onPress={() => navigation.navigate('ListingDetail', { id: item._id, isDeal: true })} />
            )}
            contentContainerStyle={styles.dealsList}
            initialNumToRender={5}
            windowSize={5}
            maxToRenderPerBatch={5}
          />
        )}

        {/* ─── Market Prices ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('marketPrices')}</Text>
        </View>
        {marketPrices.length > 0 ? (
          <View style={styles.priceTable}>
            {marketPrices.map((item, idx) => (
              <MarketPriceRow key={idx} {...item} />
            ))}
          </View>
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary }}>
              Market price data will appear when listings are live.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.primary, // Top part is green
  },
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: 20,
    paddingVertical:   15,
  },
  greeting: {
    fontSize:        Typography.size.xl,
    fontWeight:      Typography.weight.bold,
    color:           Colors.white,
  },
  greetingSub: {
    fontSize:        Typography.size.base,
    color:           'rgba(255,255,255,0.85)',
    marginTop:       2,
  },
  langToggle: {
    flexDirection:   'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius:    20,
    padding:         3,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:      15,
  },
  langPillActive: {
    backgroundColor: Colors.white,
  },
  langText: {
    fontSize:        12,
    fontWeight:      'bold',
    color:           Colors.white,
  },
  langTextActive: {
    color:           Colors.primary,
  },
  scrollContent: {
    backgroundColor: Colors.bg, // Body is light gray
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    minHeight:       '100%',
    paddingTop:      20,
  },
  searchWrap: {
    flexDirection:   'row',
    paddingHorizontal: 20,
    gap:             12,
    marginBottom:    20,
  },
  searchBar: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.white,
    height:          56,
    borderRadius:    16,
    paddingHorizontal: 15,
    gap:             10,
    elevation:       2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.05,
    shadowRadius:    8,
  },
  searchPlaceholder: {
    color:           Colors.textMuted,
    fontSize:        Typography.size.base,
  },
  micButton: {
    width:           56,
    height:          56,
    borderRadius:    16,
    backgroundColor: Colors.primary,
    justifyContent:  'center',
    alignItems:      'center',
    elevation:       3,
  },
  sectionHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-end',
    paddingHorizontal: 20,
    marginBottom:    12,
  },
  sectionTitle: {
    fontSize:        Typography.size.xs,
    fontWeight:      Typography.weight.bold,
    color:           Colors.textSecondary,
    letterSpacing:   1,
    textTransform:   'uppercase',
  },
  seeAll: {
    color:           Colors.primary,
    fontWeight:      'bold',
    fontSize:        Typography.size.sm,
  },
  catGrid: {
    flexDirection:   'row',
    paddingHorizontal: 20,
    gap:             12,
    marginBottom:    25,
  },
  catCard: {
    flex:            1,
    backgroundColor: Colors.white,
    borderRadius:    18,
    padding:         12,
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     'transparent',
  },
  catCardActive: {
    borderColor:     Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  catIconWrap: {
    width:           44,
    height:          44,
    borderRadius:    12,
    backgroundColor: Colors.surface,
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    8,
  },
  catIcon: {
    fontSize:        24,
  },
  catTe: {
    fontSize:        Typography.size.base,
    fontWeight:      Typography.weight.bold,
    color:           Colors.textPrimary,
  },
  catEn: {
    fontSize:        Typography.size.xs,
    color:           Colors.textSecondary,
    marginTop:       1,
  },
  dealsList: {
    paddingLeft:     20,
    paddingRight:    10,
    paddingBottom:   25,
  },
  dealCard: {
    width:           240,
    backgroundColor: Colors.white,
    borderRadius:    20,
    marginRight:     15,
    overflow:        'hidden',
    elevation:       3,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.1,
    shadowRadius:    6,
  },
  dealImg: {
    width:           '100%',
    height:          130,
  },
  dealImgPlaceholder: {
    backgroundColor: Colors.surface,
    justifyContent:  'center',
    alignItems:      'center',
  },
  dealInfo: {
    padding:         12,
  },
  dealName: {
    fontSize:        Typography.size.base,
    fontWeight:      Typography.weight.bold,
    color:           Colors.textPrimary,
  },
  dealVariety: {
    fontSize:        Typography.size.xs,
    color:           Colors.textSecondary,
    marginTop:       2,
  },
  dealPriceRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    marginTop:       8,
  },
  dealPrice: {
    fontSize:        Typography.size.md,
    fontWeight:      Typography.weight.bold,
    color:           Colors.primary,
  },
  dealOldPrice: {
    fontSize:        Typography.size.xs,
    color:           Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      4,
  },
  saveBadgeText: {
    color:           Colors.white,
    fontSize:        10,
    fontWeight:      'bold',
  },
  dealDistRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginTop:       8,
    paddingTop:      8,
    borderTopWidth:  1,
    borderTopColor:  Colors.borderLight,
  },
  dealDistText: {
    fontSize:        Typography.size.xs,
    color:           Colors.textSecondary,
    fontWeight:      '500',
  },
  lowestBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      4,
  },
  lowestBadgeText: {
    color:           Colors.success,
    fontSize:        9,
    fontWeight:      'bold',
  },
  dealShopName: {
    fontSize:        11,
    color:           Colors.textMuted,
    marginTop:       4,
  },
  priceTable: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius:    18,
    padding:         5,
    elevation:       2,
  },
  priceRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    padding:         15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  priceVariety: {
    fontSize:        Typography.size.base,
    fontWeight:      '600',
    color:           Colors.textPrimary,
  },
  priceRight: {
    alignItems:      'flex-end',
    gap:             2,
  },
  priceAmount: {
    fontSize:        Typography.size.base,
    fontWeight:      'bold',
    color:           Colors.textPrimary,
  },
  categoryBadge: {
    position:        'absolute',
    top:             8,
    left:            8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:    6,
    zIndex:          10,
  },
  categoryBadgeText: {
    fontSize:        8,
    fontWeight:      'bold',
    color:           '#fff',
    letterSpacing:   0.5,
  },
});

export default HomeScreen;
