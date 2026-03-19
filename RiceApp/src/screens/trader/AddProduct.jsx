import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../../theme/colors';
import { useLang } from '../../context/LangContext';
import { riceService } from '../../api/riceService';
import { traderService } from '../../api/traderService';
import { AuthContext } from '../../context/AuthContext';
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

const USAGE_CATEGORIES = [
  { value: 'Daily Cooking', te: 'రోజువారీ వంట', hi: 'दैनिक खाना बनाना', en: 'Daily Cooking' },
  { value: 'Function & Event', te: 'శుభకార్యాలకు', hi: 'समारोह और कार्यक्रम', en: 'Function & Event' },
  { value: 'Healthy Rice', te: 'ఆరోగ్యకరమైన బియ్యం', hi: 'स्वस्थ चावल', en: 'Healthy Rice' },
];

const PACK_SIZES_OPTIONS = ['500gm', '1kg', '5kg', '10kg', '26kg', '50kg'];

const AddProduct = () => {
  const navigation = useNavigation();
  const { lang, t } = useLang();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brandName: '',
    riceVariety: '',
    riceType: '',
    priceCategory: 'Budget Friendly Rice',
    pricePerBag: '',
    stockAvailable: '',
    bagWeightKg: '',
    dispatchTimeline: '',
    usageCategory: '',
  });

  const [packPrices, setPackPrices] = useState({});
  const [specifications, setSpecifications] = useState({
    grainLength: 'Medium',
    riceAge: '6+ Months',
    purityPercentage: '95',
    brokenGrainPercentage: '5',
    moistureContent: '12',
    cookingTime: '15-20 Mins',
  });

  // Image State
  const [images, setImages] = useState({
    bag: null,
    grain: null,
    cooked: null,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecChange = (field, value) => {
    setSpecifications(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async (type) => {
    const options = { mediaType: 'photo', quality: 0.7 };
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      setImages(prev => ({ ...prev, [type]: result.assets[0] }));
    }
  };

  const validate = () => {
    if (!formData.brandName) return 'Brand name is required';
    if (!formData.riceVariety) return 'Rice variety is required';
    if (!formData.pricePerBag) return 'Price is required';
    if (!formData.bagWeightKg) return 'Bag weight is required';
    if (!formData.dispatchTimeline) return 'Dispatch timeline is required';
    if (!images.bag) return 'Bag image is required';
    if (!images.grain) return 'Grain image is required';
    return null;
  };

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  React.useEffect(() => {
    checkProfile();
  }, []);

  const { logout } = React.useContext(AuthContext);

  const checkProfile = async () => {
    try {
      const res = await traderService.getProfile();
      if (res.data.success) {
        const gst = res.data.data.gstNumber;
        if (gst && gst.trim() !== '') {
          setProfileComplete(true);
        } else {
          Alert.alert(
            'Profile Incomplete',
            'You must provide a GST number in your profile before you can add products.',
            [
              { text: 'Complete Profile', onPress: () => navigation.navigate('EditProfile') },
              { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' }
            ]
          );
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout(); // Silent logout for listing screen to avoid loops
      } else if (err.response?.status !== 404) {
        console.warn('Profile check failed', err);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  React.useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      // If form is empty, just go back
      if (!formData.brandName && !formData.pricePerBag && !images.bag) return;
      
      e.preventDefault();
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel', onPress: () => {} },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return unsub;
  }, [navigation, formData, images]);

  const handleSubmit = async () => {
    if (!profileComplete) {
      return Alert.alert('Error', 'Please complete your profile (GST required) before adding products.');
    }

    const error = validate();
    if (error) {
      Alert.alert(t('Error'), error);
      return;
    }

    // STRICT VALIDATION: Robust Bounds for 1 Lakh Users
    const price = Number(formData.pricePerBag);
    if (isNaN(price) || price < 500 || price > 15000) {
        return Alert.alert('Invalid Price', 'Bag price must be between ₹500 and ₹15,000 for standard listings.');
    }
    const stock = Number(formData.stockAvailable);
    if (isNaN(stock) || stock < 1) {
        return Alert.alert('Invalid Stock', 'Please enter a valid stock quantity (Minimum 1).');
    }
    const weight = Number(formData.bagWeightKg);
    if (isNaN(weight) || weight < 1 || weight > 50) {
        return Alert.alert('Invalid Weight', 'Bag weight must be between 1kg and 50kg.');
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      data.append('specifications', JSON.stringify(specifications));
      const packPricesArray = Object.entries(packPrices).filter(([_, price]) => price).map(([size, price]) => ({ size, price: Number(price) }));
      data.append('packPrices', JSON.stringify(packPricesArray));

      if (images.bag) data.append('bagImage', { uri: images.bag.uri, type: images.bag.type || 'image/jpeg', name: 'bag.jpg' });
      if (images.grain) data.append('grainImage', { uri: images.grain.uri, type: images.grain.type || 'image/jpeg', name: 'grain.jpg' });
      if (images.cooked) data.append('cookedRiceImage', { uri: images.cooked.uri, type: images.cooked.type || 'image/jpeg', name: 'cooked.jpg' });

      await riceService.createListing(data);
      Alert.alert(t('Success'), 'Product added successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('Error'), err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Verifying profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader te="కొత్త బియ్యం జోడించండి" hi="नया उत्पाद जोड़ें" en="Add New Product" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionHeader}>{lang === 'te' ? '1. ఫోటోలు అప్‌లోడ్ చేయండి' : '1. Upload Photos'}</Text>
          <View style={styles.imageGrid}>
            <ImagePickerBox label="Bag*" image={images.bag} onPress={() => pickImage('bag')} required />
            <ImagePickerBox label="Grain*" image={images.grain} onPress={() => pickImage('grain')} required />
            <ImagePickerBox label="Cooked" image={images.cooked} onPress={() => pickImage('cooked')} />
          </View>

          <Text style={styles.sectionHeader}>{lang === 'te' ? '2. ప్రాథమిక వివరాలు' : '2. Basic Details'}</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Brand Name*</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Premium Basmati" 
              placeholderTextColor="#777"
              value={formData.brandName} 
              onChangeText={val => handleInputChange('brandName', val)}
            />

            <Text style={styles.inputLabel}>Rice Variety*</Text>
            <ChipSelector 
              options={RICE_VARIETIES.map(v => ({ value: v.value, label: v[lang] || v.en }))} 
              selected={formData.riceVariety} 
              onSelect={val => handleInputChange('riceVariety', val)} 
            />

            <Text style={styles.inputLabel}>Processing Type*</Text>
            <ChipSelector 
              options={RICE_TYPES.map(v => ({ value: v.value, label: v[lang] || v.en }))} 
              selected={formData.riceType} 
              onSelect={val => handleInputChange('riceType', val)} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Price/Bag*</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  placeholder="2500" 
                  placeholderTextColor="#777"
                  value={formData.pricePerBag} 
                  onChangeText={val => handleInputChange('pricePerBag', val)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Bag Weight KG*</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  placeholder="26" 
                  placeholderTextColor="#777"
                  value={formData.bagWeightKg} 
                  onChangeText={val => handleInputChange('bagWeightKg', val)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Stock Available*</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="500" 
              placeholderTextColor="#777"
              value={formData.stockAvailable} 
              onChangeText={val => handleInputChange('stockAvailable', val)}
            />

            <Text style={styles.inputLabel}>Dispatch Timeline (Days)*</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 2-3 Days" 
              placeholderTextColor="#777"
              value={formData.dispatchTimeline} 
              onChangeText={val => handleInputChange('dispatchTimeline', val)}
            />

            <Text style={styles.inputLabel}>Usage Category</Text>
            <ChipSelector 
              options={USAGE_CATEGORIES.map(v => ({ value: v.value, label: v[lang] || v.en }))} 
              selected={formData.usageCategory} 
              onSelect={val => handleInputChange('usageCategory', val)} 
            />
          </View>

          <Text style={styles.sectionHeader}>3. Technical Specs</Text>
          <View style={styles.card}>
             <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                   <Text style={styles.inputLabel}>Purity %</Text>
                   <TextInput style={styles.input} placeholder="95" placeholderTextColor="#777" keyboardType="numeric" value={specifications.purityPercentage} onChangeText={v => handleSpecChange('purityPercentage', v)} />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.inputLabel}>Broken %</Text>
                   <TextInput style={styles.input} placeholder="5" placeholderTextColor="#777" keyboardType="numeric" value={specifications.brokenGrainPercentage} onChangeText={v => handleSpecChange('brokenGrainPercentage', v)} />
                </View>
             </View>
             <Text style={styles.inputLabel}>Rice Age</Text>
             <TextInput style={styles.input} placeholder="6+ Months" placeholderTextColor="#777" value={specifications.riceAge} onChangeText={v => handleSpecChange('riceAge', v)} />
          </View>

          <Text style={styles.sectionHeader}>4. Pack Sizes & Prices</Text>
          <View style={styles.card}>
            {PACK_SIZES_OPTIONS.map(size => (
              <View key={size} style={styles.packPriceRow}>
                <Text style={styles.packLabel}>{size}</Text>
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                  placeholder="Price in ₹" 
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  value={packPrices[size]}
                  onChangeText={val => setPackPrices(prev => ({ ...prev, [size]: val }))}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={[styles.submitBtn, loading && styles.disabledBtn]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Add Product</Text>}
          </TouchableOpacity>
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const ImagePickerBox = ({ label, image, onPress, required }) => (
  <TouchableOpacity style={styles.imageBox} onPress={onPress}>
    {image ? (
      <Image source={{ uri: image.uri }} style={styles.preview} />
    ) : (
      <View style={styles.placeholder}>
        <Icon name="camera" size={24} color="#666" />
        <Text style={styles.imageLabel}>{label}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: '#111', marginVertical: 15 },
  imageGrid: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  imageBox: { width: '31%', aspectRatio: 1, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1.5, borderColor: '#DDD', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageLabel: { fontSize: 11, color: '#333', marginTop: 4, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 10, elevation: 2 },
  inputLabel: { fontSize: 14, fontWeight: '900', color: '#333', marginBottom: 8, marginTop: 5 },
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
  packPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  packLabel: { width: 60, fontWeight: 'bold', color: '#333' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 20, elevation: 4 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.6 },
});

export default AddProduct;
