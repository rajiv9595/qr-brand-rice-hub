import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    MessageSquare, Send, CheckCircle, XCircle, Clock,
    ArrowLeft, ChevronRight, User, Package
} from 'lucide-react';
import { negotiationService } from '../services/negotiationService';
import { authService } from '../services/authService';
import { optimizeImage } from '../utils/imageOptimizer';

const NegotiationHub = () => {
    const [negotiations, setNegotiations] = useState([]);
    const [activeNegotiationId, setActiveNegotiationId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [proposedPrice, setProposedPrice] = useState('');
    const [proposedQuantity, setProposedQuantity] = useState('');
    const [sending, setSending] = useState(false);

    // Auto-scroll ref
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const isSupplier = user?.role === 'supplier';

    useEffect(() => {
        fetchNegotiations();
    }, []);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [negotiations, activeNegotiationId]);

    const fetchNegotiations = async () => {
        try {
            const res = await negotiationService.getMyNegotiations();
            const negotiationsData = res.data?.data || [];
            setNegotiations(negotiationsData);
            if (negotiationsData.length > 0 && !activeNegotiationId) {
                setActiveNegotiationId(negotiationsData[0]._id);
            }
        } catch (err) {
            console.error('Error fetching negotiations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() && !proposedPrice && !proposedQuantity) return;

        setSending(true);
        try {
            const payload = { message };
            if (proposedPrice) payload.proposedPrice = Number(proposedPrice);
            if (proposedQuantity) payload.proposedQuantity = Number(proposedQuantity);

            await negotiationService.addMessage(activeNegotiationId, payload);
            setMessage('');
            setProposedPrice('');
            setProposedQuantity('');
            await fetchNegotiations(); // Refresh fully
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleAccept = async () => {
        try {
            await negotiationService.acceptNegotiation(activeNegotiationId);
            alert('Offer Accepted!');
            fetchNegotiations();
        } catch (err) {
            alert('Error accepting offer');
        }
    };

    const handleReject = async () => {
        try {
            await negotiationService.rejectNegotiation(activeNegotiationId);
            alert('Offer Rejected!');
            fetchNegotiations();
        } catch (err) {
            alert('Error rejecting offer');
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-500">Loading your negotiations...</div>;

    const activeNego = negotiations.find(n => n._id === activeNegotiationId);

    return (
        <div className="h-[calc(100vh-120px)] bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex font-body m-4 lg:m-8 max-w-7xl mx-auto">

            {/* Left Sidebar - List */}
            <div className={`w-full lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeNego ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-black font-display text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-field-600" /> Negotiations
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                    {negotiations.length === 0 ? (
                        <div className="text-center p-8 text-gray-400">
                            No active negotiations found.
                        </div>
                    ) : (
                        negotiations.map((n) => (
                            <button
                                key={n._id}
                                onClick={() => setActiveNegotiationId(n._id)}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${activeNegotiationId === n._id ? 'bg-white border-field-200 shadow-md ring-1 ring-field-100' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-gray-900 line-clamp-1">{n.listingId?.brandName || 'Deleted Listing'}</div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0
                                        ${n.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                            n.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'}
                                    `}>
                                        {n.status}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1 mb-2">
                                    {isSupplier ? n.buyerId?.name : (n.supplierId?.millName || 'Supplier')}
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Current Offer</span>
                                    <span className="text-xs font-black text-field-700">₹{n.currentOffer?.price} / {n.currentOffer?.quantity} bg</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side - Chat Interface */}
            <div className={`flex-1 flex flex-col bg-white ${!activeNego ? 'hidden lg:flex items-center justify-center' : 'flex'}`}>
                {!activeNego ? (
                    <div className="text-center text-gray-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Select a negotiation to view details</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 lg:p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button className="lg:hidden p-2 text-gray-400" onClick={() => setActiveNegotiationId(null)}>
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <img src={optimizeImage(activeNego.listingId?.bagImageUrl, 100)} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                <div>
                                    <h3 className="font-bold text-gray-900">{activeNego.listingId?.brandName}</h3>
                                    <div className="text-xs text-gray-500 font-medium">
                                        Partner: {isSupplier ? activeNego.buyerId?.name : (activeNego.supplierId?.millName)}
                                    </div>
                                </div>
                            </div>

                            {/* Status and Final Actions */}
                            <div className="flex items-center gap-3">
                                {['pending', 'active'].includes(activeNego.status) && (
                                    <>
                                        <button onClick={handleReject} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100">
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                        <button onClick={handleAccept} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-md">
                                            <CheckCircle className="w-4 h-4" /> Accept Offer
                                        </button>
                                    </>
                                )}
                                {activeNego.status === 'accepted' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50 border border-green-200">
                                        <CheckCircle className="w-4 h-4" /> Accepted
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-slate-50">
                            {activeNego.messages.map((msg, i) => {
                                const isMe = msg.senderRole === user.role;
                                return (
                                    <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-field-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                            <p className="text-sm">{msg.message}</p>

                                            {(msg.proposedPrice || msg.proposedQuantity) && (
                                                <div className={`mt-3 p-3 rounded-xl border ${isMe ? 'bg-field-700 border-field-500/50' : 'bg-orange-50 border-orange-100'} flex items-center justify-between gap-4`}>
                                                    <div>
                                                        <span className={`text-[9px] uppercase font-black block mb-1 tracking-wider ${isMe ? 'text-field-300' : 'text-orange-500'}`}>Official Offer</span>
                                                        <div className="text-lg font-black tracking-tight leading-none flex items-baseline gap-1">
                                                            ₹{msg.proposedPrice || activeNego.currentOffer.price}
                                                            <span className={`text-xs font-medium ${isMe ? 'text-field-200' : 'text-orange-700'}`}>/bag</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-[9px] uppercase font-black block mb-1 tracking-wider ${isMe ? 'text-field-300' : 'text-orange-500'}`}>Quantity</span>
                                                        <div className="text-sm font-bold">
                                                            {msg.proposedQuantity || activeNego.currentOffer.quantity} bags
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 font-medium select-none px-2">
                                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        {['pending', 'active'].includes(activeNego.status) ? (
                            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                                <form onSubmit={handleSendMessage}>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-3 text-xs font-bold text-gray-400 uppercase">₹</span>
                                                <input
                                                    type="number"
                                                    value={proposedPrice}
                                                    onChange={e => setProposedPrice(e.target.value)}
                                                    placeholder="New Price?"
                                                    className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-field-500 focus:bg-white text-sm outline-none font-bold placeholder:font-normal"
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    value={proposedQuantity}
                                                    onChange={e => setProposedQuantity(e.target.value)}
                                                    placeholder="New Quantity?"
                                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-field-500 focus:bg-white text-sm outline-none font-bold placeholder:font-normal"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-field-500 focus:bg-white text-sm outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || (!message && !proposedPrice)}
                                                className="bg-field-600 hover:bg-field-700 text-white px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
                                            >
                                                Send <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center shrink-0">
                                <p className="text-sm font-bold text-gray-500">
                                    This negotiation is {activeNego.status}. No further messages can be sent.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NegotiationHub;
