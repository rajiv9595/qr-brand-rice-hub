import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Image, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { negotiationService } from '../../api/negotiationService';
import AppHeader from '../../components/common/AppHeader';

const NegotiationHub = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const isSupplier = user?.role === 'supplier';

  const [negotiations, setNegotiations] = useState([]);
  const [activeNego, setActiveNego] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Message input state
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedQuantity, setProposedQuantity] = useState('');

  const scrollRef = useRef();

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchNegotiations = async () => {
    try {
      const res = await negotiationService.getMyNegotiations();
      const data = res.data?.data || [];
      setNegotiations(data);
      if (data.length > 0 && !activeNego) {
        setActiveNego(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !proposedPrice) return;
    setSending(true);
    try {
      const payload = { message };
      if (proposedPrice) payload.proposedPrice = Number(proposedPrice);
      if (proposedQuantity) payload.proposedQuantity = Number(proposedQuantity);

      await negotiationService.addMessage(activeNego._id, payload);
      setMessage('');
      setProposedPrice('');
      setProposedQuantity('');
      // Refresh to get latest messages
      const res = await negotiationService.getMyNegotiations();
      const updatedList = res.data?.data || [];
      setNegotiations(updatedList);
      const updatedActive = updatedList.find(n => n._id === activeNego._id);
      if (updatedActive) setActiveNego(updatedActive);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    Alert.alert('Accept Offer', 'Are you sure you want to accept this offer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: async () => {
        try {
          await negotiationService.acceptNegotiation(activeNego._id);
          fetchNegotiations();
        } catch (err) { Alert.alert('Error', 'Failed to accept'); }
      }}
    ]);
  };

  const renderSideItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sideItem, activeNego?._id === item._id && styles.sideItemActive]}
      onPress={() => setActiveNego(item)}
    >
      <View style={styles.sideHeader}>
        <Text style={styles.sideBrand} numberOfLines={1}>{item.listingId?.brandName || 'Rice Order'}</Text>
        <View style={[styles.statusTag, { backgroundColor: item.status === 'accepted' ? '#DEF7EC' : '#FEF3C7' }]}>
           <Text style={[styles.statusText, { color: item.status === 'accepted' ? '#065F46' : '#92400E' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.sidePartner}>{isSupplier ? item.buyerId?.name : item.supplierId?.millName}</Text>
      <Text style={styles.sideOffer}>₹{item.currentOffer?.price || 0} / {item.currentOffer?.quantity || 0} bags</Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isMe = item.senderRole === user.role;
    return (
      <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther]}>
        <View style={[styles.msgBox, isMe ? styles.msgBoxMe : styles.msgBoxOther]}>
          <Text style={[styles.msgText, isMe && { color: '#fff' }]}>{item.message}</Text>
          {(item.proposedPrice || item.proposedQuantity) && (
            <View style={[styles.offerCard, isMe && { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
               <Text style={[styles.offerLabel, isMe && { color: 'rgba(255,255,255,0.7)' }]}>OFFICIAL OFFER</Text>
               <Text style={[styles.offerValue, isMe && { color: '#FFF' }]}>₹{item.proposedPrice} / {item.proposedQuantity} bags</Text>
            </View>
          )}
          <Text style={[styles.msgTime, isMe && { color: 'rgba(255,255,255,0.5)' }]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
  );

  return (
    <View style={styles.container}>
      <AppHeader te="బేరసారాలు" en="Negotiations" showBack={true} />
      
      {!activeNego ? (
        <View style={styles.empty}>
           <Icon name="comments" size={60} color="#DDD" />
           <Text style={styles.emptyText}>No active negotiations</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
           {/* Sidebar Horizontal on Mobile */}
           <View style={styles.sidebarWrap}>
              <FlatList 
                horizontal
                data={negotiations}
                renderItem={renderSideItem}
                keyExtractor={item => item._id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15 }}
              />
           </View>

           {/* Chat Header */}
           <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>{activeNego.listingId?.brandName}</Text>
              <View style={styles.headerActions}>
                 {['pending', 'active'].includes(activeNego.status) && (
                   <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                      <Icon name="check" size={12} color="#fff" />
                      <Text style={styles.acceptBtnText}>Accept Offer</Text>
                   </TouchableOpacity>
                 )}
              </View>
           </View>

           {/* Messages */}
           <FlatList 
             ref={scrollRef}
             data={activeNego.messages}
             renderItem={renderMessage}
             keyExtractor={(item, index) => index.toString()}
             contentContainerStyle={{ padding: 15 }}
             onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
           />

           {/* Input Area */}
           {['pending', 'active'].includes(activeNego.status) && (
             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
               <View style={styles.inputArea}>
                  <View style={styles.priceInputs}>
                     <View style={styles.priceInpBox}>
                        <Text style={styles.priceLabel}>₹ Price</Text>
                        <TextInput 
                          style={styles.smallInput} 
                          placeholder="0" 
                          placeholderTextColor="#999"
                          keyboardType="numeric" 
                          value={proposedPrice} 
                          onChangeText={setProposedPrice} 
                        />
                     </View>
                     <View style={styles.priceInpBox}>
                        <Text style={styles.priceLabel}>Bags</Text>
                        <TextInput 
                          style={styles.smallInput} 
                          placeholder="0" 
                          placeholderTextColor="#999"
                          keyboardType="numeric" 
                          value={proposedQuantity} 
                          onChangeText={setProposedQuantity} 
                        />
                     </View>
                  </View>
                  <View style={styles.msgInputRow}>
                     <TextInput 
                       style={styles.mainInput} 
                       placeholder="Type your message..." 
                       placeholderTextColor="#999"
                       value={message} 
                       onChangeText={setMessage}
                     />
                     <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage} disabled={sending}>
                        {sending ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="paper-plane" size={18} color="#fff" />}
                     </TouchableOpacity>
                  </View>
               </View>
             </KeyboardAvoidingView>
           )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 10, color: Colors.textMuted, fontSize: 16 },
  sidebarWrap: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingVertical: 10 },
  sideItem: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginRight: 10, width: 180, borderSize: 1, borderColor: '#EEE' },
  sideItemActive: { backgroundColor: '#fff', borderColor: Colors.primary, borderWidth: 1.5 },
  sideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  sideBrand: { fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary, flex: 1, marginRight: 5 },
  statusTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  sidePartner: { fontSize: 10, color: Colors.textSecondary },
  sideOffer: { fontSize: 11, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  chatHeader: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  acceptBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  acceptBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  msgContainer: { marginBottom: 15, width: '100%', flexDirection: 'row' },
  scroll: { paddingBottom: 180 },
  msgMe: { justifyContent: 'flex-end' },
  msgOther: { justifyContent: 'flex-start' },
  msgBox: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  msgBoxMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 2 },
  msgBoxOther: { backgroundColor: '#fff', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#EEE' },
  msgText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  offerCard: { marginTop: 10, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 },
  offerLabel: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, marginBottom: 2 },
  offerValue: { fontSize: 12, fontWeight: 'bold', color: Colors.textPrimary },
  msgTime: { fontSize: 8, color: Colors.textMuted, marginTop: 5, alignSelf: 'flex-end' },
  inputArea: { backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  priceInputs: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  priceInpBox: { flex: 1, gap: 4 },
  priceLabel: { fontSize: 9, fontWeight: 'bold', color: '#666' },
  smallInput: { backgroundColor: Colors.surface, padding: 8, borderRadius: 8, fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary },
  msgInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  mainInput: { flex: 1, backgroundColor: Colors.surface, padding: 12, borderRadius: 12, fontSize: 14, color: Colors.textPrimary },
  sendBtn: { width: 48, height: 48, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

export default NegotiationHub;
