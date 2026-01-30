
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Lead, LeadLog, ChatMessage } from '../../types';
import { useNavigate } from 'react-router-dom';

export const Leads: React.FC = () => {
  const { leads, addLead, addLeadLog, updateLead, deleteLead } = useData();
  const navigate = useNavigate();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Communication'>('Overview');
  const [search, setSearch] = useState('');
  const [logNote, setLogNote] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  
  // Mock Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { id: '1', text: 'Hello, I am interested in the Dubai package.', sender: 'Lead', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: '2', text: 'Hi! Happy to help. Are you looking for the 5-day tour?', sender: 'User', timestamp: new Date(Date.now() - 86000000).toISOString() },
      { id: '3', text: 'Yes, exactly.', sender: 'Lead', timestamp: new Date(Date.now() - 85000000).toISOString() }
  ]);

  // Filters & Modal State
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    destination: '',
    type: 'Family Trip',
    status: 'New',
    budget: '',
    travelers: '2 Adults',
    source: 'Manual Entry',
    notes: ''
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // Default selection for desktop
  useEffect(() => {
    if (window.innerWidth >= 1024 && !selectedLeadId && leads.length > 0) {
        setSelectedLeadId(leads[0].id);
    }
  }, [leads]);

  const filteredLeads = leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                            l.email.toLowerCase().includes(search.toLowerCase()) ||
                            l.destination.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const handleSendMessage = () => {
      if(!chatMessage.trim()) return;
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          text: chatMessage,
          sender: 'User',
          timestamp: new Date().toISOString()
      };
      setChatHistory([...chatHistory, newMsg]);
      setChatMessage('');
      
      // Simulate WhatsApp Log
      if(selectedLeadId) {
          addLeadLog(selectedLeadId, {
              id: `WA-${Date.now()}`,
              type: 'WhatsApp',
              content: `Message sent: ${newMsg.text}`,
              timestamp: new Date().toISOString()
          });
      }
  };

  const handleAddLog = () => {
    if (!selectedLeadId || !logNote.trim()) return;
    addLeadLog(selectedLeadId, {
      id: `lg-${Date.now()}`,
      type: 'Note',
      content: logNote,
      timestamp: new Date().toISOString()
    });
    setLogNote('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
        const lead: Lead = {
            id: `LD-${Date.now()}`,
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            destination: leadForm.destination,
            type: leadForm.type,
            status: leadForm.status as any,
            priority: 'Medium',
            potentialValue: parseInt(leadForm.budget) || 0,
            addedOn: new Date().toISOString(),
            travelers: leadForm.travelers,
            budget: leadForm.budget,
            source: leadForm.source,
            preferences: leadForm.notes,
            avatarColor: 'bg-slate-100 text-slate-600',
            logs: []
        };
        addLead(lead);
    } 
    setIsModalOpen(false);
  };

  const openAddModal = () => {
      setModalMode('add');
      setLeadForm({ id: '', name: '', email: '', phone: '', destination: '', type: 'Family Trip', status: 'New', budget: '', travelers: '2 Adults', source: 'Manual Entry', notes: '' });
      setIsModalOpen(true);
  };

  const handleConvertToBooking = () => {
      if(!selectedLead) return;
      navigate('/admin/bookings', { 
          state: { 
              prefill: {
                  customer: selectedLead.name,
                  email: selectedLead.email,
                  phone: selectedLead.phone,
                  amount: selectedLead.potentialValue,
                  details: selectedLead.preferences,
                  guests: selectedLead.travelers
              }
          } 
      });
  };

  const statusColors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      'Warm': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      'Hot': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'Converted': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'Cold': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      'Offer Sent': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900 relative">
      
      {/* Header */}
      <div className="px-6 py-4 flex-shrink-0 bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-20">
        <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lead Tracking</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage inquiries and convert them to bookings.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span> <span className="hidden md:inline text-sm">Add Manual Lead</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: LEAD LIST */}
        <div className={`w-full lg:w-[400px] flex flex-col bg-white dark:bg-[#1A2633] border-r border-slate-200 dark:border-slate-800 shrink-0 z-10 ${selectedLeadId ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search & Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
                {/* Stats Row */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{leads.filter(l => l.status === 'New').length}</p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Hot Leads</p>
                        <p className="text-xl font-black text-red-500">{leads.filter(l => l.status === 'Hot').length}</p>
                    </div>
                </div>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                    <input 
                        placeholder="Search leads..." 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'New', 'Hot', 'Warm', 'Offer Sent'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${statusFilter === status ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredLeads.length > 0 ? (
                    filteredLeads.map(lead => (
                        <div 
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={`p-4 cursor-pointer rounded-xl transition-all border ${selectedLeadId === lead.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-[#1A2633] border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-full flex items-center justify-center font-black text-sm ${lead.avatarColor || 'bg-slate-100 text-slate-600'} border border-slate-200 dark:border-slate-700`}>
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-bold ${selectedLeadId === lead.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{lead.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium truncate max-w-[120px]">{lead.destination}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wide ${statusColors[lead.status] || 'bg-slate-100 text-slate-500'}`}>{lead.status}</span>
                            </div>
                            <div className="flex items-center justify-between pl-[52px]">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {new Date(lead.addedOn).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                </div>
                                {lead.potentialValue > 0 && <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">₹{(lead.potentialValue/1000).toFixed(0)}k</span>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">filter_list_off</span>
                        <p className="text-sm">No leads match filters</p>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT CONTENT: DETAIL VIEW */}
        <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-hidden ${selectedLeadId ? 'fixed inset-0 z-50 lg:static' : 'hidden lg:flex'}`}>
            {selectedLead ? (
                <>
                    {/* Detail Header */}
                    <div className="bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedLeadId(null)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-full flex items-center justify-center font-black text-xl ${selectedLead.avatarColor || 'bg-slate-100 text-slate-600'} border-2 border-white shadow-sm`}>
                                    {selectedLead.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">{selectedLead.name}</h2>
                                        <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {selectedLead.destination}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">source</span> {selectedLead.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button onClick={() => setActiveTab('Overview')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'Overview' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
                                <button onClick={() => setActiveTab('Communication')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'Communication' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><span className="material-symbols-outlined text-[14px]">chat</span> Chat</button>
                            </div>
                            <button onClick={handleConvertToBooking} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-md">
                                Convert
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
                        {activeTab === 'Overview' ? (
                            <div className="max-w-5xl mx-auto space-y-6">
                                
                                {/* 1. Quick Info & Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                                        <div className="relative z-10">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Details</p>
                                            <div className="flex flex-col gap-2 mt-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">call</span></div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedLead.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">mail</span></div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedLead.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 relative z-10">
                                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm hover:border-primary text-slate-600 dark:text-slate-300">Call Now</button>
                                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm hover:border-primary text-slate-600 dark:text-slate-300">Send Mail</button>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Status</p>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusColors[selectedLead.status]}`}>{selectedLead.status}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Potential Value</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{selectedLead.potentialValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Trip Details */}
                                <div className="bg-white dark:bg-[#1A2633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">flight</span> Trip Information
                                        </h3>
                                        <button className="text-primary text-xs font-bold hover:underline">Edit Details</button>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Destination</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedLead.destination}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Travelers</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedLead.travelers}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tentative Date</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedLead.startDate || 'TBD'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Budget Range</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedLead.budget}</p>
                                        </div>
                                        <div className="col-span-2 md:col-span-4">
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Requirements / Notes</p>
                                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                                {selectedLead.preferences || 'No specific requirements mentioned.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Activity Timeline */}
                                <div className="bg-white dark:bg-[#1A2633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">history</span> Activity Log
                                    </h3>
                                    
                                    {/* Add Note */}
                                    <div className="flex gap-2 mb-8">
                                        <input 
                                            value={logNote} 
                                            onChange={e => setLogNote(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && handleAddLog()}
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" 
                                            placeholder="Add an internal note..." 
                                        />
                                        <button onClick={handleAddLog} disabled={!logNote.trim()} className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50">Save</button>
                                    </div>

                                    <div className="relative pl-4 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                                        {selectedLead.logs.length > 0 ? selectedLead.logs.map(log => (
                                            <div key={log.id} className="relative pl-8 group">
                                                <div className={`absolute -left-[5px] top-0 size-8 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1A2633] z-10 shadow-sm
                                                    ${log.type === 'System' ? 'bg-slate-100 text-slate-500' : log.type === 'WhatsApp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
                                                `}>
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {log.type === 'System' ? 'info' : log.type === 'WhatsApp' ? 'chat' : 'sticky_note_2'}
                                                    </span>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{log.type}</span>
                                                        <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{log.content}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="pl-8 text-sm text-slate-400 italic">No history yet.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={() => deleteLead(selectedLead.id)} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">delete</span> Delete Lead
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* WhatsApp Interface - Full Height */
                            <div className="h-[calc(100vh-200px)] flex flex-col bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative">
                                <div className="absolute inset-0 opacity-[0.06] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>
                                
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-thin">
                                    <div className="flex justify-center mb-6">
                                        <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
                                            This chat is synced with WhatsApp Business
                                        </span>
                                    </div>
                                    {chatHistory.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm relative ${msg.sender === 'User' ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none' : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-none'}`}>
                                                {msg.text}
                                                <div className="text-[10px] text-right mt-1 opacity-60 flex justify-end items-center gap-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {msg.sender === 'User' && <span className="material-symbols-outlined text-[12px]">done_all</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-2 relative z-10 border-t border-slate-200 dark:border-slate-700">
                                    <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full hover:bg-black/5 transition-colors">
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </button>
                                    <input 
                                        className="flex-1 bg-white dark:bg-[#2a3942] rounded-xl px-4 py-3 text-sm focus:outline-none dark:text-white placeholder:text-slate-400 shadow-sm"
                                        placeholder="Type a message..."
                                        value={chatMessage}
                                        onChange={e => setChatMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button onClick={handleSendMessage} className="p-3 bg-[#00a884] text-white rounded-full flex items-center justify-center hover:bg-[#008f6f] shadow-sm transition-transform active:scale-95">
                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="size-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm animate-in zoom-in duration-500 border border-slate-100 dark:border-slate-700">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">forum</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a lead to view details</h3>
                    <p className="text-slate-500 max-w-xs">Click on any lead from the left sidebar to view their trip details, history, and start chatting.</p>
                </div>
            )}
        </div>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-[#1A2633] p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-2xl text-slate-900 dark:text-white">Add New Lead</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                      <div>
                          <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Full Name</label>
                          <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Phone</label>
                              <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} placeholder="+91..." />
                          </div>
                          <div>
                              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Email</label>
                              <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} placeholder="name@email.com" />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Destination</label>
                          <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={leadForm.destination} onChange={e => setLeadForm({...leadForm, destination: e.target.value})} placeholder="e.g. Bali, Indonesia" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Budget (₹)</label>
                              <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={leadForm.budget} onChange={e => setLeadForm({...leadForm, budget: e.target.value})} placeholder="50000" />
                          </div>
                          <div>
                              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Travelers</label>
                              <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" value={leadForm.travelers} onChange={e => setLeadForm({...leadForm, travelers: e.target.value})} placeholder="2 Adults" />
                          </div>
                      </div>
                      <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-dark transition-all active:scale-95 mt-2">Create Lead</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
