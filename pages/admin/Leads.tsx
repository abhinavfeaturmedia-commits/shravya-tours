
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Lead, FollowUp, ServiceType } from '../../types';
import { toast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Calendar, Users, Clock, X, Plus, Search,
    ChevronRight, Sparkles, Edit2, Trash2, ArrowRight, MessageCircle,
    FileText, Bell, CheckCircle2, MoreHorizontal, Filter
} from 'lucide-react';
import { analyzeLead } from '../../src/lib/gemini';
import { BulkImportLeadsModal } from '../../components/admin/BulkImportLeadsModal';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'New': 'bg-blue-100 text-blue-700',
        'Warm': 'bg-amber-100 text-amber-700',
        'Hot': 'bg-red-100 text-red-700',
        'Offer Sent': 'bg-purple-100 text-purple-700',
        'Converted': 'bg-emerald-100 text-emerald-700',
        'Cold': 'bg-slate-100 text-slate-600'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles['New']}`}>
            {status}
        </span>
    );
};

export const Leads: React.FC = () => {
    const { leads, addLead, addLeadLog, updateLead, deleteLead, addFollowUp, getFollowUpsByLeadId } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // UI State
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Forms
    const [noteContent, setNoteContent] = useState('');
    const [isReminderSet, setIsReminderSet] = useState(false);
    const [leadForm, setLeadForm] = useState<Partial<Lead>>({
        status: 'New', travelers: '2 Adults', source: 'Manual Entry'
    });

    const selectedLead = leads.find(l => l.id === selectedLeadId);

    // Stats calculation
    const stats = {
        pending: leads.filter(l => l.status === 'New').length,
        value: leads.reduce((acc, l) => acc + (l.potentialValue || 0), 0),
        tasks: 5 // Mock for now
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.destination.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveLog = () => {
        if (!selectedLeadId || !noteContent.trim()) return;
        addLeadLog(selectedLeadId, {
            id: `lg-${Date.now()}`,
            type: 'Note',
            content: noteContent,
            timestamp: new Date().toISOString()
        });
        setNoteContent('');
        toast.success('Log saved');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString();
        if (modalMode === 'add') {
            const newLead: any = {
                id: `LD-${Date.now()}`,
                addedOn: now,
                logs: [],
                avatarColor: 'bg-slate-100 text-slate-600',
                ...leadForm,
                potentialValue: Number(leadForm.budget) || 0
            };
            addLead(newLead);
            toast.success('Lead added');
        } else {
            updateLead(leadForm.id!, {
                ...leadForm,
                potentialValue: Number(leadForm.budget) || 0
            });
            toast.success('Lead updated');
        }
        setIsModalOpen(false);
    };

    const openAddModal = () => {
        setModalMode('add');
        setLeadForm({ status: 'New', travelers: '2 Adults', source: 'Manual Entry' });
        setIsModalOpen(true);
    };

    const openEditModal = () => {
        if (!selectedLead) return;
        setModalMode('edit');
        setLeadForm({ ...selectedLead, budget: String(selectedLead.potentialValue) });
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-[#0B1120]">

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedLeadId ? 'hidden lg:flex' : ''}`}>

                {/* Header Section */}
                <div className="px-8 py-6 max-w-[1600px] mx-auto w-full">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Lead Tracking</h1>
                    <p className="text-slate-500 mb-8">
                        Good Morning! You have <span className="text-primary font-bold">3 high-priority</span> follow-ups today.
                    </p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-[#1A2633] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pending Leads</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.pending}</span>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+2%</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1A2633] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pipeline Value</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">₹{(stats.value / 1000).toFixed(0)}k</span>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+12%</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1A2633] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tasks Due Today</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.tasks}</span>
                                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">-1</span>
                            </div>
                        </div>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search leads by name, email, or destination..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            />
                        </div>
                        <button onClick={openAddModal} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap">
                            <Plus size={20} /> Add Lead
                        </button>
                    </div>

                    {/* Leads List */}
                    <div className="bg-white dark:bg-[#1A2633] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-4">Lead Name</div>
                            <div className="col-span-4">Destination</div>
                            <div className="col-span-2">Value</div>
                            <div className="col-span-2 text-right">Status</div>
                        </div>

                        {/* List Items */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={`grid grid-cols-12 px-6 py-4 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedLeadId === lead.id ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="col-span-4 flex items-center gap-4 overflow-hidden pr-4">
                                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${lead.avatarColor || 'bg-slate-100 text-slate-600'}`}>
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{lead.name}</h3>
                                            <p className="text-xs text-slate-500 truncate">Added {new Date(lead.addedOn).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-4 overflow-hidden pr-4">
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium text-sm truncate">
                                            <MapPin size={14} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{lead.destination}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 ml-6 truncate">{lead.type}</p>
                                    </div>
                                    <div className="col-span-2 font-bold text-slate-900 dark:text-white truncate">
                                        ₹{(lead.potentialValue || 0).toLocaleString()}
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <StatusBadge status={lead.status} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-medium">
                            Showing 1 to {filteredLeads.length} of {leads.length} results
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT DETAIL PANEL (Fixed Sidebar) */}
            {selectedLead && (
                <div className="w-full lg:w-[400px] bg-white dark:bg-[#1A2633] border-l border-slate-200 dark:border-slate-800 flex flex-col h-full fixed lg:static inset-0 z-50 overflow-y-auto animate-in slide-in-from-right-10 duration-200 shadow-2xl lg:shadow-none">

                    {/* Panel Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-lg ${selectedLead.avatarColor || 'bg-blue-100 text-blue-600'}`}>
                                    {selectedLead.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedLead.name}</h2>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={12} /> {selectedLead.destination}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLeadId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md tracking-wide">High Value</span>
                            {selectedLead.status === 'Offer Sent' && (
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded-md tracking-wide">Quote Sent</span>
                            )}
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 flex-1 overflow-y-auto">

                        {/* Trip Details Grid */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Trip Details</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Dates</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Oct 12 - Oct 20</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Travelers</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedLead.travelers}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Budget</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(selectedLead.potentialValue || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Type</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedLead.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Preferences */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-8 italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            "{selectedLead.preferences || "No specific preferences recorded yet."}"
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Quick Actions</h3>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <a href={`tel:${selectedLead.phone}`} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-600 dark:text-slate-300 hover:text-primary gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Phone size={16} /></div>
                                    <span className="text-xs font-bold">Call</span>
                                </a>
                                <a href={`mailto:${selectedLead.email}`} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-slate-600 dark:text-slate-300 hover:text-purple-600 gap-2">
                                    <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Mail size={16} /></div>
                                    <span className="text-xs font-bold">Email</span>
                                </a>
                                <a href={`https://wa.me/${selectedLead.phone?.replace(/\D/g, '')}`} target="_blank" className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-slate-600 dark:text-slate-300 hover:text-green-600 gap-2">
                                    <div className="h-8 w-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MessageCircle size={16} /></div>
                                    <span className="text-xs font-bold">WhatsApp</span>
                                </a>
                            </div>
                            <button
                                onClick={() => navigate('/admin/bookings', { state: { prefill: { customer: selectedLead.name, amount: selectedLead.potentialValue } } })}
                                className="w-full py-3 rounded-xl border border-dashed border-primary text-primary font-bold text-sm hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors"
                            >
                                <FileText size={16} /> Generate Updated Quote
                            </button>
                        </div>

                        {/* Follow Up Log */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Follow-up Log</h3>
                            <div className="mb-4">
                                <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Log call notes or internal comments..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                                />
                                <div className="flex justify-between items-center mt-3">
                                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isReminderSet}
                                            onChange={(e) => setIsReminderSet(e.target.checked)}
                                            className="custom-checkbox h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        Set Reminder
                                    </label>
                                    <button
                                        onClick={handleSaveLog}
                                        className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-primary-dark transition-colors"
                                    >
                                        Save Log
                                    </button>
                                </div>
                            </div>

                            {/* Timeline Activity */}
                            <div className="space-y-6 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                {/* Sample Timeline Item */}
                                <div className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 ring-4 ring-white dark:ring-[#1A2633]"></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Today, 10:30 AM</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Quote Sent (PDF)</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Sent the "Japan Cultural Immersion" itinerary V2.</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300 ring-4 ring-white dark:ring-[#1A2633]"></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Yesterday, 4:15 PM</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Call Logged: Interest High</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Client asked for hotel upgrades in Kyoto. Adjusted budget to $6k.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals area (Use existing components or simplified versions as needed for Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A2633] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{modalMode === 'edit' ? 'Edit Lead' : 'Add New Lead'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input required placeholder="Full Name" value={leadForm.name || ''} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
                            <div className="grid grid-cols-2 gap-3">
                                <input required placeholder="Phone" value={leadForm.phone || ''} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                                <input placeholder="Email" value={leadForm.email || ''} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                            </div>
                            <input required placeholder="Destination" value={leadForm.destination || ''} onChange={e => setLeadForm({ ...leadForm, destination: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                            <input type="number" placeholder="Budget" value={leadForm.budget || ''} onChange={e => setLeadForm({ ...leadForm, budget: e.target.value })} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
                            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold">Save Lead</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
