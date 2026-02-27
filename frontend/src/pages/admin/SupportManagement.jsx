
import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, CheckCircle, Clock, XCircle, ChevronRight, User, Send, Paperclip } from 'lucide-react';

import { adminService } from '../../services/adminService';

const SupportManagement = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, searchTerm]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllSupportTickets({
                status: statusFilter,
                search: searchTerm
            });
            setTickets(res.data.data);
        } catch (err) {
            console.error('Failed to fetch tickets', err);
        } finally {
            setLoading(false);
        }
    };

    const [replyText, setReplyText] = useState('');

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        try {
            const res = await adminService.replyToTicket(selectedTicket._id, replyText);
            const updatedTicket = res.data.data;

            // Update local state
            setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
            setSelectedTicket(updatedTicket);
            setReplyText('');
        } catch (err) {
            console.error('Failed to send reply', err);
        }
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            const res = await adminService.updateTicketStatus(ticketId, newStatus);
            const updatedTicket = res.data.data;

            setTickets(tickets.map(t => t._id === ticketId ? updatedTicket : t));
            if (selectedTicket && selectedTicket._id === ticketId) {
                setSelectedTicket(updatedTicket);
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    // API handles filtering
    const filteredTickets = tickets;

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-700">
            {/* Ticket List */}
            <div className={`flex flex-col w-full ${selectedTicket ? 'lg:w-1/3' : 'w-full'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300`}>
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900">Support Tickets</h2>
                        <span className="bg-field-50 text-field-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{tickets.length}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-field-500/20 text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex gap-2 text-xs overflow-x-auto pb-2 scrollbar-none">
                            {['all', 'open', 'in-progress', 'resolved'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${statusFilter === status
                                        ? 'bg-field-600 text-white border-field-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-50">
                        {filteredTickets.map(ticket => (
                            <div
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${selectedTicket?._id === ticket._id ? 'bg-field-50/50 border-field-500' : 'border-transparent'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-900 text-sm line-clamp-1">{ticket.subject}</span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 ml-2">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                        <span className="text-xs text-gray-500 truncate">{ticket.user?.name || 'Unknown User'}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                                    {ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1].text : ticket.message}
                                </p>
                            </div>
                        ))}
                        {filteredTickets.length === 0 && (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No tickets found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ticket Detail / Chat View */}
            {selectedTicket ? (
                <div className="hidden lg:flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    {/* Chat Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-gray-900">{selectedTicket.subject}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${getStatusColor(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {selectedTicket.user?.name || 'Unknown'}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>{selectedTicket._id}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedTicket.status}
                                onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                                className="text-xs font-bold border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-field-500 outline-none hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 bg-gray-50/50 p-6 overflow-y-auto space-y-6">
                        {/* Initial User Message */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-white text-field-600 border border-gray-100">
                                {selectedTicket.user?.name ? selectedTicket.user.name[0] : 'U'}
                            </div>
                            <div className="flex flex-col items-start max-w-[80%]">
                                <div className="px-4 py-3 rounded-2xl shadow-sm text-sm bg-white text-gray-800 border border-gray-100 rounded-tl-none">
                                    <p className="leading-relaxed">{selectedTicket.message}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">{new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        {/* Thread Messages */}
                        {selectedTicket.messages.map((msg, idx) => (
                            <div key={msg._id || idx} className={`flex gap-4 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'admin' ? 'bg-field-600 text-white' : 'bg-white text-field-600 border border-gray-100'
                                    }`}>
                                    {msg.sender === 'admin' ? 'A' : (selectedTicket.user?.name ? selectedTicket.user.name[0] : 'U')}
                                </div>
                                <div className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.sender === 'admin'
                                            ? 'bg-field-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                                        {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:ring-2 focus-within:ring-field-500/20 focus-within:border-field-500 transition-all">
                            <button className="p-2 text-gray-400 hover:text-field-600 transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none placeholder:text-gray-400"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendReply();
                                    }
                                }}
                            />
                            <button
                                onClick={handleSendReply}
                                disabled={!replyText.trim()}
                                className="p-2 bg-field-600 text-white rounded-xl hover:bg-field-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400 flex-col gap-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium">Select a ticket to view details</p>
                </div>
            )}
        </div>
    );
};

export default SupportManagement;
