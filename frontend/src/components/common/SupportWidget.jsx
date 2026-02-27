
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, LifeBuoy, AlertCircle, CheckCircle, Headset, ChevronRight, Clock, MessageSquare, Shield } from 'lucide-react';
import { supportService } from '../../services/supportService';

const SupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('menu'); // menu, create, list, chat
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        if (view === 'chat' && selectedTicket) {
            scrollToBottom();
        }
    }, [view, selectedTicket]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await supportService.getMyTickets();
            setTickets(res.data.data);
        } catch (err) {
            console.error('Failed to fetch tickets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await supportService.createTicket(formData);
            setSuccess(true);
            setFormData({ subject: '', message: '', priority: 'medium' });
            setTimeout(() => {
                setSuccess(false);
                setView('list');
                fetchTickets();
            }, 2000);
        } catch (err) {
            alert('Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setLoading(true);
        try {
            const res = await supportService.addMessage(selectedTicket._id, replyText);
            const updatedTicket = res.data.data;
            setSelectedTicket(updatedTicket);
            setReplyText('');
            // Update tickets list locally
            setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
            scrollToBottom();
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleOpenMenu = () => {
        setView('menu');
        setSelectedTicket(null);
    };

    const handleOpenList = () => {
        setView('list');
        fetchTickets();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative ${isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
            >
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20 scale-125" />
                )}
                {isOpen ? <X className="w-7 h-7" /> : <Headset className="w-7 h-7" />}
            </button>

            {/* Widget Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col h-[550px]">
                    {/* Header */}
                    <div className="bg-primary-600 p-6 text-white shrink-0 shadow-lg relative z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Headset className="w-6 h-6" />
                                Support Hub
                            </h3>
                            {view !== 'menu' && (
                                <button
                                    onClick={handleOpenMenu}
                                    className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    Main Menu
                                </button>
                            )}
                        </div>
                        <p className="text-primary-100 text-xs mt-1 font-medium italic">
                            {view === 'chat' ? `Ticket: ${selectedTicket?.subject}` : "Expert help for all your rice queries"}
                        </p>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/30">
                        {view === 'menu' && (
                            <div className="p-6 space-y-4">
                                <button
                                    onClick={() => setView('create')}
                                    className="w-full p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 leading-tight">Raise a Ticket</p>
                                        <p className="text-xs text-gray-500 mt-1">Start a new conversation with us</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleOpenList}
                                    className="w-full p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 leading-tight">My Tickets</p>
                                        <p className="text-xs text-gray-500 mt-1">Check status & read admin replies</p>
                                    </div>
                                </button>

                                <a
                                    href="https://wa.me/919614346666"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full p-5 bg-green-50 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all text-left flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white group-hover:bg-green-600 transition-all transform group-hover:scale-110">
                                        <MessageCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-green-900 leading-tight">WhatsApp Support</p>
                                        <p className="text-xs text-green-700 mt-1">Chat directly with our team</p>
                                    </div>
                                </a>

                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3 mt-4">
                                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                                    <p className="text-[11px] text-orange-800 font-bold leading-relaxed">
                                        Quick Tip: For urgent pricing issues, use 'High Priority' status for faster resolution.
                                    </p>
                                </div>
                            </div>
                        )}

                        {view === 'create' && (
                            <form onSubmit={handleCreateTicket} className="p-6 space-y-4 animate-in fade-in duration-300">
                                {success ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce shadow-inner">
                                            <CheckCircle className="w-12 h-12" />
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900">Success!</h4>
                                        <p className="text-sm text-gray-500 mt-2 font-medium">Ticket submitted. Tracking now...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue Subject</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Price update request"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none bg-white font-bold transition-all"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority Level</label>
                                            <div className="flex gap-2">
                                                {['low', 'medium', 'high'].map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, priority: p })}
                                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${formData.priority === p
                                                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                required
                                                rows="4"
                                                placeholder="Please provide details so we can help you better..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none bg-white font-medium resize-none shadow-inner transition-all"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleOpenMenu}
                                                className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>Send Ticket <Send className="w-3.5 h-3.5" /></>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}

                        {view === 'list' && (
                            <div className="p-4 space-y-3 animate-in fade-in duration-300">
                                {loading && tickets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">Fetching your tickets...</p>
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed m-2">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">No active tickets</p>
                                        <button
                                            onClick={() => setView('create')}
                                            className="text-primary-600 text-xs font-black uppercase tracking-widest mt-3 hover:underline"
                                        >
                                            Create One Now
                                        </button>
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <button
                                            key={ticket._id}
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setView('chat');
                                            }}
                                            className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group relative overflow-hidden"
                                        >
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                                                            ID: #{ticket._id.slice(-6)}
                                                        </span>
                                                    </div>
                                                    <p className="font-black text-gray-900 truncate leading-tight">{ticket.subject}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                        <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest">
                                                            {ticket.messages.length} messages
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                            {/* Status logic indicator */}
                                            {ticket.messages[ticket.messages.length - 1].sender === 'admin' && ticket.status !== 'resolved' && (
                                                <div className="absolute top-0 right-0 w-2 h-full bg-primary-500" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {view === 'chat' && (
                            <div className="flex flex-col h-full bg-white relative">
                                {/* Chat Body */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scroll-smooth">
                                    <div className="flex flex-col items-center py-4 mb-2">
                                        <div className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] text-gray-500 font-black uppercase tracking-widest border border-gray-200">
                                            Conversation Started on {new Date(selectedTicket?.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Initial Problem Statement */}
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] rounded-3xl p-4 bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Your Issue:</p>
                                            <p className="text-sm font-medium leading-relaxed">{selectedTicket?.message}</p>
                                        </div>
                                    </div>

                                    {/* Messages list */}
                                    {selectedTicket?.messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}
                                        >
                                            <div className={`max-w-[85%] rounded-3xl p-4 shadow-md relative group ${msg.sender === 'admin'
                                                ? 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-gray-100'
                                                : 'bg-primary-600 text-white rounded-tr-none shadow-primary-100'
                                                }`}>
                                                {msg.sender === 'admin' && (
                                                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                        <Shield className="w-2.5 h-2.5" /> Support Team
                                                    </p>
                                                )}
                                                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                                                    <p className={`text-[9px] font-bold ${msg.sender === 'admin' ? 'text-gray-400' : 'text-primary-200'
                                                        }`}>
                                                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {msg.sender === 'admin' && (
                                                        <div className="flex gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-primary-400 animate-pulse" />
                                                            <div className="w-1 h-1 rounded-full bg-primary-400 animate-pulse delay-75" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Reply Input - Sticky at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shrink-0 z-20">
                                    {selectedTicket?.status === 'resolved' || selectedTicket?.status === 'closed' ? (
                                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                                            <p className="text-xs font-bold text-green-700">This ticket has been marked as resolved.</p>
                                            <p className="text-[10px] text-green-600 mt-1 uppercase tracking-widest">You can send a message to re-open it.</p>
                                        </div>
                                    ) : null}

                                    <form onSubmit={handleSendReply} className="flex gap-3 mt-2">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write your message..."
                                            className="flex-1 bg-gray-50 hover:bg-white border border-gray-100 focus:border-primary-500 px-5 py-3 rounded-2xl text-sm font-bold outline-none ring-primary-500/10 focus:ring-4 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !replyText.trim()}
                                            className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                                        >
                                            <Send className="w-5 h-5 ml-0.5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer branding */}
                    <div className="p-4 bg-white border-t border-gray-100 text-center shrink-0">
                        <div className="flex items-center justify-center gap-1.5 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all">
                            <Headset className="w-3 h-3 text-primary-600" />
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                QR BRAND RICE HUB • LIVE SUPPORT
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportWidget;
