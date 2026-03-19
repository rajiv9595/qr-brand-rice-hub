import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '../../theme/colors';
import { supportService } from '../../api/supportService';
import AppHeader from '../../components/common/AppHeader';

const SupportHub = () => {
  const [view, setView] = useState('menu'); // menu, create, list, chat
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const chatEndRef = useRef();

  useEffect(() => {
    if (view === 'list') fetchTickets();
  }, [view]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await supportService.getMyTickets();
      setTickets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.message) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      await supportService.createTicket(formData);
      Alert.alert('Success', 'Ticket submitted. We will get back to you soon!');
      setFormData({ subject: '', message: '', priority: 'medium' });
      setView('list');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await supportService.addMessage(selectedTicket._id, replyText);
      setSelectedTicket(res.data.data);
      setReplyText('');
    } catch (err) {
      Alert.alert('Error', 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.ticketCard} 
      onPress={() => { setSelectedTicket(item); setView('chat'); }}
    >
      <View style={styles.cardHeader}>
         <View style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? '#DBEAFE' : '#DEF7EC' }]}>
            <Text style={[styles.statusText, { color: item.status === 'open' ? '#1E40AF' : '#03543F' }]}>{item.status}</Text>
         </View>
         <Text style={styles.ticketId}>#{item._id.slice(-6).toUpperCase()}</Text>
      </View>
      <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
      <Text style={styles.ticketDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        te="మద్దతు కేంద్రం" 
        en="Support Hub" 
        showBack={view !== 'menu'} 
        onBack={() => setView('menu')} 
      />

      {view === 'menu' && (
        <View style={styles.menuContent}>
           <TouchableOpacity style={styles.menuBtn} onPress={() => setView('create')}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primaryLight }]}><Icon name="plus-circle" size={24} color={Colors.primary} /></View>
              <View style={styles.btnTxtBox}>
                 <Text style={styles.btnTitle}>Raise a Ticket</Text>
                 <Text style={styles.btnSub}>Start a new conversation with us</Text>
              </View>
              <Icon name="chevron-right" size={14} color="#CCC" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuBtn} onPress={() => setView('list')}>
              <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}><Icon name="history" size={24} color="#0369A1" /></View>
              <View style={styles.btnTxtBox}>
                 <Text style={styles.btnTitle}>My Tickets</Text>
                 <Text style={styles.btnSub}>Check status & read admin replies</Text>
              </View>
              <Icon name="chevron-right" size={14} color="#CCC" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuBtn}>
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}><Icon name="whatsapp" size={24} color="#166534" /></View>
              <View style={styles.btnTxtBox}>
                 <Text style={styles.btnTitle}>WhatsApp Support</Text>
                 <Text style={styles.btnSub}>Chat directly with our team</Text>
              </View>
              <Icon name="chevron-right" size={14} color="#CCC" />
           </TouchableOpacity>
        </View>
      )}

      {view === 'create' && (
        <ScrollView style={styles.formContent} contentContainerStyle={{ padding: 20 }}>
           <Text style={styles.label}>Issue Subject</Text>
           <TextInput 
             style={styles.input} 
             placeholder="e.g. Price update request" 
             value={formData.subject} 
             onChangeText={v => setFormData({...formData, subject: v})} 
           />

           <Text style={styles.label}>Priority</Text>
           <View style={styles.priorityRow}>
              {['low', 'medium', 'high'].map(p => (
                <TouchableOpacity 
                   key={p} 
                   style={[styles.prioBtn, formData.priority === p && styles.prioBtnActive]}
                   onPress={() => setFormData({...formData, priority: p})}
                >
                   <Text style={[styles.prioText, formData.priority === p && { color: '#fff' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
           </View>

           <Text style={styles.label}>Description</Text>
           <TextInput 
             style={[styles.input, { height: 120 }]} 
             multiline 
             placeholder="Tell us more about the issue..." 
             value={formData.message} 
             onChangeText={v => setFormData({...formData, message: v})} 
           />

           <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTicket} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Ticket</Text>}
           </TouchableOpacity>
        </ScrollView>
      )}

      {view === 'list' && (
        <FlatList 
           data={tickets}
           renderItem={renderTicketItem}
           keyExtractor={item => item._id}
           contentContainerStyle={{ padding: 20 }}
           ListEmptyComponent={
             <View style={styles.empty}><Text style={styles.emptyText}>No tickets found</Text></View>
           }
           refreshing={loading}
           onRefresh={fetchTickets}
        />
      )}

      {view === 'chat' && selectedTicket && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={100}>
           <FlatList 
             ref={chatEndRef}
             data={selectedTicket.messages}
             keyExtractor={(item, index) => index.toString()}
             contentContainerStyle={{ padding: 20 }}
             ListHeaderComponent={() => (
               <View style={styles.chatStart}>
                  <Text style={styles.chatSubject}>{selectedTicket.subject}</Text>
                  <Text style={styles.chatDesc}>{selectedTicket.message}</Text>
                  <View style={styles.divider} />
               </View>
             )}
             renderItem={({ item }) => (
               <View style={[styles.msgWrap, item.sender === 'admin' ? styles.msgAdmin : styles.msgUser]}>
                  <View style={[styles.msgBox, item.sender === 'admin' ? styles.msgBoxAdmin : styles.msgBoxUser]}>
                     <Text style={[styles.msgText, item.sender !== 'admin' && { color: '#fff' }]}>{item.text}</Text>
                     <Text style={styles.msgTime}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
               </View>
             )}
             onContentSizeChange={() => chatEndRef.current?.scrollToEnd()}
           />
           <View style={styles.chatInputArea}>
              <TextInput 
                style={styles.chatInput} 
                placeholder="Reply here..." 
                value={replyText} 
                onChangeText={setReplyText} 
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendReply} disabled={loading}>
                 {loading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="paper-plane" size={18} color="#fff" />}
              </TouchableOpacity>
           </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  menuContent: { padding: 20 },
  menuBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  btnTxtBox: { flex: 1 },
  btnTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  btnSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  formContent: { flex: 1 },
  label: { fontSize: 12, fontWeight: '900', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 15, fontSize: 15, borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 20, color: '#000' },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  prioBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', backgroundColor: '#fff' },
  prioBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  prioText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: Colors.textSecondary },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ticketCard: { backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  ticketId: { fontSize: 10, color: Colors.textMuted, fontWeight: 'bold' },
  ticketSubject: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  ticketDate: { fontSize: 10, color: Colors.textMuted, marginTop: 5 },
  empty: { padding: 50, alignItems: 'center' },
  emptyText: { color: Colors.textMuted },
  chatStart: { marginBottom: 20 },
  chatSubject: { fontSize: 20, fontWeight: '900', color: Colors.textPrimary, marginBottom: 5 },
  chatDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  msgWrap: { marginBottom: 15, width: '100%', flexDirection: 'row' },
  msgAdmin: { justifyContent: 'flex-start' },
  msgUser: { justifyContent: 'flex-end' },
  msgBox: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  msgBoxAdmin: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 2 },
  msgBoxUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 2 },
  msgText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  msgTime: { fontSize: 8, color: Colors.textMuted, marginTop: 5, alignSelf: 'flex-end' },
  chatInputArea: { backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: Colors.borderLight, flexDirection: 'row', gap: 10 },
  chatInput: { flex: 1, backgroundColor: Colors.surface, padding: 12, borderRadius: 12, fontSize: 14 },
  chatSendBtn: { width: 48, height: 48, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

export default SupportHub;
