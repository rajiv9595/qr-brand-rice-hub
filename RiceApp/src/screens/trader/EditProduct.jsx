import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import { riceService } from '../../api/riceService';
import AppHeader from '../../components/common/AppHeader';
import ChipSelector from '../../components/common/ChipSelector';

const RICE_VARIETIES = [
  { value: 'Basmati', te: 'బాస్మతి', hi: 'बासमती', en: 'Basmati' },
  { value: 'Sona Masuri', te: 'సోనా మసూరి', hi: 'సోనా మసూరి', en: 'Sona Masuri' },
  { value: 'BPT 5204', te: 'బి.పి.టి 5204', hi: 'बीपीटी 5204', en: 'BPT 5204' },
  { value: 'HMT', te: 'హెచ్.ఎం.టి', hi: 'एचएमटी', en: 'HMT' },
  { value: 'RNR', te: 'ఆర్.ఎన్.ఆర్', hi: 'आरएनआर', en: 'RNR' },
  { value: 'Kolam', te: 'కోలమ్', hi: 'कोलम', en: 'Kolam' },
];

const RICE_TYPES = [
  { value: 'Raw', te: 'పచ్చి బియ్యం', hi: 'कच्चा चावल', en: 'Raw' },
  { value: 'Steam', te: 'స్టీమ్ బియ్యం', hi: 'स्टीम चावल', en: 'Steam' },
  { value: 'Boiled', te: 'ఉడికిించిన బియ్యం', hi: 'उबला हुआ चावल', en: 'Boiled' },
  { value: 'Brown', te: 'బ్రౌన్ రైస్', hi: 'ब्राउन राइस', en: 'Brown' },
];

const PACK_SIZES_OPTIONS = ['500gm', '1kg', '5kg', '10kg', '26kg', '50kg'];

const EditProduct = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { lang, t } = useLang();
  const { listing } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brandName: listing?.brandName || '',
    riceVariety: listing?.riceVariety || '',
    riceType: listing?.riceType || '',
    pricePerBag: listing?.pricePerBag?.toString() || '',
    stockAvailable: listing?.stockAvailable?.toString() || '',
    bagWeightKg: listing?.bagWeightKg?.toString() || '',
    dispatchTimeline: listing?.dispatchTimeline || '',
  });

  const [packPrices, setPackPrices] = useState({});
  const [specifications, setSpecifications] = useState({
    grainLength: listing?.specifications?.grainLength || 'Medium',
    riceAge: listing?.specifications?.riceAge || '6+ Months',
    purityPercentage: listing?.specifications?.purityPercentage?.toString() || '95',
    brokenGrainPercentage: listing?.specifications?.brokenGrainPercentage?.toString() || '5',
    moistureContent: listing?.specifications?.moistureContent?.toString() || '12',
    cookingTime: listing?.specifications?.cookingTime || '15-20 Mins',
  });

  const [images, setImages] = useState({
    bag: listing?.bagImageUrl ? { uri: listing.bagImageUrl } : null,
    grain: listing?.grainImageUrl ? { uri: listing.grainImageUrl } : null,
    cooked: listing?.cookedRiceImageUrl ? { uri: listing.cookedRiceImageUrl } : null,
  });

  useEffect(() => {
    if (listing?.packPrices) {
      const pMap = {};
      listing.packPrices.forEach(p => { pMap[p.size] = p.price?.toString(); });
      setPackPrices(pMap);
    }
  }, [listing]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSpecChange = (field, value) => setSpecifications(prev => ({ ...prev, [field]: value }));

  const pickImage = async (type) => {
    const options = { mediaType: 'photo', quality: 0.7 };
    const result = await launchImageLibrary(options);
    if (result.assets?.length > 0) setImages(prev => ({ ...prev, [type]: result.assets[0] }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('specifications', JSON.stringify(specifications));
      const packPricesArray = Object.entries(packPrices).filter(([_, price]) => price).map(([size, price]) => ({ size, price: Number(price) }));
      data.append('packPrices', JSON.stringify(packPricesArray));

      if (images.bag && !images.bag.uri.startsWith('http')) data.append('bagImage', { uri: images.bag.uri, type: images.bag.type || 'image/jpeg', name: 'bag.jpg' });
      if (images.grain && !images.grain.uri.startsWith('http')) data.append('grainImage', { uri: images.grain.uri, type: images.grain.type || 'image/jpeg', name: 'grain.jpg' });
      if (images.cooked && !images.cooked.uri.startsWith('http')) data.append('cookedRiceImage', { uri: images.cooked.uri, type: images.cooked.type || 'image/jpeg', name: 'cooked.jpg' });

      await riceService.updateListing(listing._id, data);
      Alert.alert(t('Success'), 'Updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('Error'), 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete?', 'Remove this product?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try { await riceService.deleteListing(listing._id); navigation.goBack(); }
        catch (err) { Alert.alert('Error', 'Failed to delete'); }
        finally { setDeleting(false); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader te="సవరించండి" hi="संपादित करें" en="Edit Product" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.sectionHeader}>Product Photos</Text>
          <View style={styles.imageGrid}>
            <ImagePickerBox label="Bag" image={images.bag} onPress={() => pickImage('bag')} />
            <ImagePickerBox label="Grain" image={images.grain} onPress={() => pickImage('grain')} />
            <ImagePickerBox label="Cooked" image={images.cooked} onPress={() => pickImage('cooked')} />
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Brand Name</Text>
            <TextInput style={styles.input} value={formData.brandName} placeholderTextColor="#777" onChangeText={v => handleInputChange('brandName', v)} />
            <Text style={styles.inputLabel}>Variety</Text>
            <ChipSelector options={RICE_VARIETIES.map(v => ({ value: v.value, label: v[lang] || v.en }))} selected={formData.riceVariety} onSelect={v => handleInputChange('riceVariety', v)} />

            <View style={styles.row}>
               <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Price/Bag</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={formData.pricePerBag} placeholderTextColor="#777" onChangeText={v => handleInputChange('pricePerBag', v)} />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Stock</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={formData.stockAvailable} placeholderTextColor="#777" onChangeText={v => handleInputChange('stockAvailable', v)} />
               </View>
            </View>

            <Text style={styles.inputLabel}>Dispatch Timeline</Text>
            <TextInput style={styles.input} value={formData.dispatchTimeline} placeholder="e.g. 2 Days" placeholderTextColor="#777" onChangeText={v => handleInputChange('dispatchTimeline', v)} />
          </View>

          <Text style={styles.sectionHeader}>Technical Specs</Text>
          <View style={styles.card}>
             <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                   <Text style={styles.inputLabel}>Purity %</Text>
                   <TextInput style={styles.input} keyboardType="numeric" value={specifications.purityPercentage} placeholderTextColor="#777" onChangeText={v => handleSpecChange('purityPercentage', v)} />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.inputLabel}>Broken %</Text>
                   <TextInput style={styles.input} keyboardType="numeric" value={specifications.brokenGrainPercentage} placeholderTextColor="#777" onChangeText={v => handleSpecChange('brokenGrainPercentage', v)} />
                </View>
             </View>
             <Text style={styles.inputLabel}>Rice Age</Text>
             <TextInput style={styles.input} value={specifications.riceAge} placeholderTextColor="#777" onChangeText={v => handleSpecChange('riceAge', v)} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, loading && styles.disabledBtn]} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Changes</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
            <Text style={styles.deleteBtnText}>Delete Product</Text>
          </TouchableOpacity>
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const ImagePickerBox = ({ label, image, onPress }) => (
  <TouchableOpacity style={styles.imageBox} onPress={onPress}>
    {image ? <Image source={{ uri: image.uri }} style={styles.preview} /> : (
      <View style={styles.placeholder}>
        <Icon name="camera" size={24} color="#666" />
        <Text style={styles.imageLabel}>{label}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: '#111', marginVertical: 15 },
  imageGrid: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  imageBox: { width: '31%', aspectRatio: 1, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1.5, borderColor: '#DDD', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageLabel: { fontSize: 11, color: '#333', marginTop: 4, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 10 },
  inputLabel: { fontSize: 14, fontWeight: '900', color: '#333', marginBottom: 8 },
  input: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16, 
    borderWidth: 1.5, 
    borderColor: '#AAA', 
    marginBottom: 16, 
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { marginTop: 15, padding: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#FF4444', borderRadius: 15 },
  deleteBtnText: { color: '#FF4444', fontWeight: 'bold' },
  disabledBtn: { opacity: 0.6 },
});

export default EditProduct;
