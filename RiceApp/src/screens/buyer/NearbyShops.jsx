// src/screens/buyer/NearbyShops.jsx
import React, { useState, useContext } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  StyleSheet, Image, ActivityIndicator, StatusBar 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { AuthContext } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useNearbyShops } from '../../hooks/useNearbyShops';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import AppHeader from '../../components/common/AppHeader';
import { Modal, TextInput, Alert, ScrollView, FlatList as RNFlatList } from 'react-native';
import { AP_DISTRICTS } from '../../context/LocationContext';

const NearbyShops = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { location, getCurrentLocation, geocode } = useLocation();
  const { variety, type } = route.params || {};
  
  const [isGlobal, setIsGlobal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [locInput, setLocInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [tempLocation, setTempLocation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = React.useRef(null);

  // Online Search for suggestions (Villages, Towns, Districts)
  const fetchSuggestions = async (text) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setIsTyping(true);
    try {
      // Search specifically in AP, India
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text + ', Andhra Pradesh')}&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'RiceApp-Expert-Agent' } }
      );
      const data = await res.json();
      const mapped = data.map(item => {
        const addr = item.address || {};
        const village = addr.village || addr.suburb || addr.town || addr.city || '';
        const district = addr.city_district || addr.district || addr.county || '';
        return {
          name: village || item.display_name.split(',')[0],
          fullName: `${village}${village && district ? ', ' : ''}${district}`,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      });
      // Filter out empty names and duplicates
      setSuggestions(mapped.filter(m => m.name));
    } catch (err) {
      console.warn('Suggestion fetch error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLocInputChange = (text) => {
    setLocInput(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 500);
  };

  const handleSelectSuggestion = (item) => {
    setTempLocation(item);
    setShowLocModal(false);
    setLocInput('');
    setSuggestions([]);
  };

  const { shops, loading, hasNearby, fetchShops } = useNearbyShops(
    variety,
    type,
    tempLocation?.lat || location?.lat,
    tempLocation?.lng || location?.lng,
    50
  );

  const handleManualSearch = async () => {
    if (!locInput) return;
    setLoadingLocal(true);
    const result = await geocode(locInput);
    if (result) {
       setTempLocation({ ...result, district: locInput });
       setShowLocModal(false);
       setLocInput('');
    } else {
       Alert.alert("Not Found", "We couldn't find that location. Try a district or city name.");
    }
    setLoadingLocal(false);
  };

  const handleUseCurrent = async () => {
    setLoadingLocal(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setTempLocation(null); // Clear temp to use GPS
      setShowLocModal(false);
    }
    setLoadingLocal(false);
  };

  const [loadingLocal, setLoadingLocal] = useState(false);

  const handleShowGlobal = () => {
    setIsGlobal(true);
    fetchShops(true); // true = cross-region search
  };

  const renderShop = ({ item }) => (
    <TouchableOpacity 
      style={styles.shopCard}
      onPress={() => navigation.navigate('RiceDetail', { id: item._id })}
    >
      <Image 
        source={item.bagImageUrl ? { uri: item.bagImageUrl } : require('../../assets/logo.png')} 
        style={styles.shopImage} 
      />
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.productName || item.brandName}</Text>
        <Text style={styles.shopLocation}>
          <Icon name="map-marker-alt" size={12} color={Colors.primary} /> {item.supplierId?.millName || 'Rice Mill'}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.pricePerBag || item.price}</Text>
          <Text style={styles.unit}>/ {item.packWeight || 26}kg</Text>
        </View>
        <Text style={styles.distanceText}>
          {item.district}, {item.state}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <AppHeader 
        te={variety ? `${variety} - ${type || ''}` : "అందుబాటులో ఉన్న షాపులు"} 
        en={variety ? `${variety} (${type || ''})` : "Available Shops"} 
        rightContent={
          <TouchableOpacity style={styles.changeLocBtn} onPress={() => setShowLocModal(true)}>
             <Icon name="map-marker-alt" size={14} color="#FFF" />
             <Text style={styles.changeLocText}>Change</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching {variety} {type}...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.locationBanner}>
             <Icon name="compass" size={12} color={Colors.primary} />
             <Text style={styles.locationBannerText}>
               Showing shops for: <Text style={{ fontWeight: 'bold' }}>{tempLocation?.name || location?.name || location?.district || 'Searching area...'}</Text>
             </Text>
          </View>
          
          {shops.length === 0 ? (
            <View style={styles.center}>
              <View style={styles.emptyIconBox}>
                 <Text style={{ fontSize: 64 }}>🌾</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {isGlobal ? "No stock available anywhere" : "No shops found nearby"}
              </Text>
              <Text style={styles.emptySub}>
                Currently, {variety} ({type}) is not available in <Text style={{fontWeight:'bold'}}>{tempLocation?.name || location?.district || 'this area'}</Text>.
              </Text>
              
              {!isGlobal && (
                <TouchableOpacity style={styles.globalBtn} onPress={handleShowGlobal}>
                   <Text style={styles.globalBtnText}>
                     Check other available locations for {variety}
                   </Text>
                   <Icon name="arrow-right" size={14} color={Colors.primary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={shops}
              keyExtractor={(item) => item._id}
              renderItem={renderShop}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      )}

      {/* Location Modal */}
      <Modal
         visible={showLocModal}
         transparent
         animationType="slide"
         onRequestClose={() => setShowLocModal(false)}
      >
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Change Location</Text>
                 <TouchableOpacity onPress={() => setShowLocModal(false)}>
                    <Icon name="times" size={20} color="#666" />
                 </TouchableOpacity>
               </View>

               <Text style={styles.modalInfo}>Find rice within 50km of any place in AP!</Text>
               
               <View style={styles.inputRow}>
                  <TextInput 
                     style={styles.searchInput}
                     placeholder="Enter city or district..."
                     placeholderTextColor="#999"
                     value={locInput}
                     onChangeText={handleLocInputChange}
                     autoFocus={true}
                  />
                  <TouchableOpacity 
                    style={[styles.goBtn, !locInput && { opacity: 0.5 }]} 
                    onPress={handleManualSearch}
                    disabled={!locInput || loadingLocal}
                  >
                    {loadingLocal ? <ActivityIndicator color="#FFF" /> : <Text style={styles.goBtnText}>GO</Text>}
                  </TouchableOpacity>
               </View>

               {isTyping && (
                 <View style={styles.searchingMini}>
                   <ActivityIndicator size="small" color={Colors.primary} />
                   <Text style={styles.searchingMiniText}>Finding villages...</Text>
                 </View>
               )}

               {suggestions.length > 0 && (
                 <View style={styles.suggestionsBox}>
                   {suggestions.map((item, idx) => (
                     <TouchableOpacity 
                       key={idx} 
                       style={styles.suggestionItem}
                       onPress={() => handleSelectSuggestion(item)}
                     >
                        <Icon name="map-marker-alt" size={14} color={Colors.primary} />
                        <View>
                           <Text style={styles.suggestionText}>{item.name}</Text>
                           <Text style={styles.suggestionAddress}>{item.fullName}</Text>
                        </View>
                     </TouchableOpacity>
                   ))}
                 </View>
               )}

               <Text style={styles.orText}>{suggestions.length > 0 ? '' : '— OR —'}</Text>

               {!suggestions.length && (
                 <TouchableOpacity 
                    style={styles.currentLocBtn} 
                    onPress={handleUseCurrent}
                    disabled={loadingLocal}
                 >
                    <Icon name="crosshairs" size={18} color={Colors.primary} />
                    <Text style={styles.currentLocBtnText}>Use My Current Live Location</Text>
                 </TouchableOpacity>
               )}

               <Text style={styles.modalDisclaimer}>
                 *This will override your saved address temporarily during this search.
               </Text>
            </View>
         </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { marginTop: 15, color: '#666', fontSize: 16 },
  list: { padding: 15 },
  resultsTitle: { fontSize: 14, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 15, textTransform: 'uppercase' },
  shopCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  shopImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F3F4F6' },
  shopInfo: { flex: 1, marginLeft: 15 },
  shopName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  shopLocation: { fontSize: 13, color: '#6B7280', marginVertical: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 18, fontWeight: 'bold', color: Colors.primaryDark },
  unit: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  distanceText: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  
  changeLocBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  changeLocText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  locationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 10, borderBottomWidth: 1, borderBottomColor: '#FDE68A' },
  locationBannerText: { fontSize: 13, color: '#92400E', marginLeft: 8 },

  emptyIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  globalBtn: { 
    marginTop: 30, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#FFF', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  globalBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  modalInfo: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 15, height: 50, fontSize: 16, color: '#1F2937' },
  goBtn: { backgroundColor: Colors.primary, width: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  goBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  suggestionsBox: { marginTop: 10, backgroundColor: '#F9FAFB', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 12 },
  suggestionText: { fontSize: 15, color: '#1F2937', fontWeight: 'bold' },
  suggestionAddress: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  searchingMini: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 5 },
  searchingMiniText: { fontSize: 13, color: Colors.primary, fontStyle: 'italic' },

  orText: { textAlign: 'center', marginVertical: 15, color: '#9CA3AF', fontWeight: 'bold' },
  currentLocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  currentLocBtnText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  modalDisclaimer: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 25 }
});

export default NearbyShops;
