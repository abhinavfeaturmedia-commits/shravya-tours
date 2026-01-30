import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import {
    MasterLocation,
    MasterHotel,
    MasterActivity,
    MasterTransport,
    MasterPlan,
    MasterLocationType,
    MasterTransportType
} from '../../types';

type MasterTab = 'analytics' | 'locations' | 'hotels' | 'activities' | 'transport' | 'plans';
type ViewMode = 'grid' | 'list';
type SortDirection = 'asc' | 'desc';

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

// --- Master Modal Component (Extracted) ---
const MasterModal: React.FC<{
    activeTab: MasterTab;
    editingItem: any;
    onClose: () => void;
}> = ({ activeTab, editingItem, onClose }) => {
    const {
        addMasterLocation, updateMasterLocation,
        addMasterHotel, updateMasterHotel,
        addMasterActivity, updateMasterActivity,
        addMasterTransport, updateMasterTransport,
        addMasterPlan, updateMasterPlan,
        masterLocations
    } = useData();

    // Initialize form state
    const [form, setForm] = useState<any>(editingItem ? { ...editingItem } : { status: 'Active' });

    // Handle saving
    const save = () => {
        if (!form.name && !form.title) return alert('Name/Title is required');

        const id = editingItem ? editingItem.id : generateId(
            activeTab === 'locations' ? 'LOC' :
                activeTab === 'hotels' ? 'HTL' :
                    activeTab === 'activities' ? 'ACT' :
                        activeTab === 'transport' ? 'TRN' : 'PLN'
        );

        const data = { ...form, id };

        // Sanitize numeric inputs
        if (data.pricePerNight) data.pricePerNight = Number(data.pricePerNight);
        if (data.rating) data.rating = Number(data.rating);
        if (data.cost) data.cost = Number(data.cost);
        if (data.capacity) data.capacity = Number(data.capacity);
        if (data.baseRate) data.baseRate = Number(data.baseRate);
        if (data.duration && !isNaN(Number(data.duration))) data.duration = Number(data.duration); // Keep as number if plan, string if activity e.g "2 hours"

        // Handle Array inputs (Amenities)
        if (typeof data.amenities === 'string') {
            data.amenities = data.amenities.split(',').map((s: string) => s.trim());
        }

        if (editingItem) {
            if (activeTab === 'locations') updateMasterLocation(id, data);
            if (activeTab === 'hotels') updateMasterHotel(id, data);
            if (activeTab === 'activities') updateMasterActivity(id, data);
            if (activeTab === 'transport') updateMasterTransport(id, data);
            if (activeTab === 'plans') updateMasterPlan(id, data);
        } else {
            if (activeTab === 'locations') addMasterLocation(data);
            if (activeTab === 'hotels') addMasterHotel(data);
            if (activeTab === 'activities') addMasterActivity(data);
            if (activeTab === 'transport') addMasterTransport(data);
            if (activeTab === 'plans') addMasterPlan(data);
        }
        onClose();
    };

    return (
        <div className="space-y-4">
            {/* Common Name/Title Field */}
            {activeTab !== 'plans' ? (
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                    <input
                        value={form.name || ''}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter name"
                        autoFocus
                    />
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Title *</label>
                    <input
                        value={form.title || ''}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g., Summer Escape"
                        autoFocus
                    />
                </div>
            )}

            {/* Location Specifics */}
            {activeTab === 'locations' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                        <select value={form.type || 'City'} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                            <option value="City">City</option>
                            <option value="State">State</option>
                            <option value="Country">Country</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Region</label>
                        <input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" placeholder="Region/State" />
                    </div>
                </>
            )}

            {/* Hotel Specifics */}
            {activeTab === 'hotels' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Location *</label>
                        <select value={form.locationId || ''} onChange={e => setForm({ ...form, locationId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                            <option value="">Select Location</option>
                            {masterLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₹/night)</label>
                            <input type="number" value={form.pricePerNight || ''} onChange={e => setForm({ ...form, pricePerNight: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                            <input type="number" max="5" min="1" step="0.1" value={form.rating || 5} onChange={e => setForm({ ...form, rating: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Amenities</label>
                        <input value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities || ''} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" placeholder="Pool, Wifi, Gym (comma separated)" />
                    </div>
                </>
            )}

            {/* Activity Specifics */}
            {activeTab === 'activities' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Location *</label>
                        <select value={form.locationId || ''} onChange={e => setForm({ ...form, locationId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                            <option value="">Select Location</option>
                            {masterLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cost (₹)</label>
                            <input type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                            <input value={form.duration || ''} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" placeholder="e.g. 2 hours" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                        <select value={form.category || 'Leisure'} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                            <option value="Leisure">Leisure</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Sightseeing">Sightseeing</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Food">Food & Drink</option>
                        </select>
                    </div>
                </>
            )}

            {/* Transport Specifics */}
            {activeTab === 'transport' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select value={form.type || 'Sedan'} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Tempo Traveller">Tempo Traveller</option>
                                <option value="Bus">Bus</option>
                                <option value="Flight">Flight</option>
                                <option value="Train">Train</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                            <input type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" placeholder="Seats" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Base Rate (₹)</label>
                        <input type="number" value={form.baseRate || ''} onChange={e => setForm({ ...form, baseRate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                    </div>
                </>
            )}

            {/* Plan Specifics */}
            {activeTab === 'plans' && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Location</label>
                        <select value={form.locationId || ''} onChange={e => setForm({ ...form, locationId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                            <option value="">Select Location</option>
                            {masterLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Cost (₹)</label>
                            <input type="number" value={form.estimatedCost || ''} onChange={e => setForm({ ...form, estimatedCost: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Days)</label>
                            <input type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-2">Note: To manage the itinerary days and activities, please use the specific Itinerary Builder module or delete this plan and create a new one.</p>
                </>
            )}

            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="pt-4">
                <button onClick={save} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/30">
                    {editingItem ? 'Update' : 'Create'} {activeTab === 'plans' ? 'Template' : 'Item'}
                </button>
            </div>
        </div>
    );
};

export const Masters: React.FC = () => {
    const {
        masterLocations, masterHotels, masterActivities, masterTransports, masterPlans,
        addMasterLocation, updateMasterLocation, deleteMasterLocation,
        addMasterHotel, updateMasterHotel, deleteMasterHotel,
        addMasterActivity, updateMasterActivity, deleteMasterActivity,
        addMasterTransport, updateMasterTransport, deleteMasterTransport,
        addMasterPlan, updateMasterPlan, deleteMasterPlan,
    } = useData();

    // --- State ---
    const [activeTab, setActiveTab] = useState<MasterTab>('locations');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filters & Sorting
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [sortBy, setSortBy] = useState<string>('name'); // Default sort field
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    // Reset selection and filters on tab change
    useEffect(() => {
        setSelectedItems(new Set());
        setFilterStatus('All');
        setSearchQuery('');
        setSortBy('name');
        setSortDir('asc');
    }, [activeTab]);

    const tabs: { id: MasterTab; label: string; icon: string; count?: number }[] = [
        { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
        { id: 'locations', label: 'Locations', icon: 'location_on', count: masterLocations.length },
        { id: 'hotels', label: 'Hotels', icon: 'hotel', count: masterHotels.length },
        { id: 'activities', label: 'Activities', icon: 'attractions', count: masterActivities.length },
        { id: 'transport', label: 'Transport', icon: 'directions_car', count: masterTransports.length },
        { id: 'plans', label: 'Plan Templates', icon: 'map', count: masterPlans.length },
    ];

    // --- Helper Functions ---

    const getLocationNameById = (id: string) => masterLocations.find(l => l.id === id)?.name || 'Unknown';

    // Calculate usage count for relationships
    const getUsageCount = (id: string, type: MasterTab) => {
        if (type === 'locations') {
            const hotels = masterHotels.filter(h => h.locationId === id).length;
            const activities = masterActivities.filter(a => a.locationId === id).length;
            const plans = masterPlans.filter(p => p.locationId === id).length;
            return { total: hotels + activities + plans, details: `${hotels} Hotels, ${activities} Activities, ${plans} Plans` };
        }
        if (type === 'hotels') {
            const count = masterPlans.reduce((acc, plan) => acc + (plan.days?.filter(d => d.hotelId === id).length || 0), 0);
            return { total: count, details: `Used in ${count} Plans` };
        }
        if (type === 'activities') {
            const count = masterPlans.reduce((acc, plan) => acc + (plan.days?.filter(d => d.activities?.includes(id)).length || 0), 0);
            return { total: count, details: `Used in ${count} Plans` };
        }
        if (type === 'transport') {
            const count = masterPlans.reduce((acc, plan) => acc + (plan.days?.filter(d => d.transportId === id).length || 0), 0);
            return { total: count, details: `Used in ${count} Plans` };
        }
        return { total: 0, details: '' };
    };

    const handleSelectAll = (items: any[]) => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(i => i.id)));
        }
    };

    const handleSelectOne = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const handleDuplicate = (item: any) => {
        const newItem = { ...item };
        newItem.id = generateId(activeTab === 'locations' ? 'LOC' : activeTab === 'hotels' ? 'HTL' : activeTab === 'activities' ? 'ACT' : activeTab === 'transport' ? 'TRN' : 'PLN');
        newItem.name ? (newItem.name += ' (Copy)') : (newItem.title += ' (Copy)');

        if (activeTab === 'locations') addMasterLocation(newItem);
        else if (activeTab === 'hotels') addMasterHotel(newItem);
        else if (activeTab === 'activities') addMasterActivity(newItem);
        else if (activeTab === 'transport') addMasterTransport(newItem);
        else if (activeTab === 'plans') addMasterPlan(newItem);

        alert('Item duplicated successfully!');
    };

    const confirmBulkDelete = () => {
        if (!confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

        const deleteFuncs: Record<string, (id: string) => void> = {
            locations: deleteMasterLocation,
            hotels: deleteMasterHotel,
            activities: deleteMasterActivity,
            transport: deleteMasterTransport,
            plans: deleteMasterPlan
        };

        if (deleteFuncs[activeTab]) {
            selectedItems.forEach(id => deleteFuncs[activeTab](id));
            setSelectedItems(new Set());
        }
    };

    const bulkUpdateStatus = (status: 'Active' | 'Inactive') => {
        const updateFuncs: Record<string, (id: string, data: any) => void> = {
            locations: updateMasterLocation,
            hotels: updateMasterHotel,
            activities: updateMasterActivity,
            transport: updateMasterTransport,
            plans: updateMasterPlan
        };

        if (updateFuncs[activeTab]) {
            selectedItems.forEach(id => updateFuncs[activeTab](id, { status }));
            setSelectedItems(new Set());
        }
    };

    // --- Import / Export ---
    const handleExport = () => {
        if (activeTab === 'analytics') return alert('Please select a data tab to export.');

        const dataToExport = getProcessedData();
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `shravya-${activeTab}-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        if (activeTab === 'analytics') return alert('Please select a data tab to import into.');
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (!Array.isArray(data)) throw new Error('Invalid format: Expected an array');

                let count = 0;
                data.forEach(item => {
                    const newItem = { ...item, id: generateId(activeTab.toUpperCase().substring(0, 3) + 'IMP') };

                    if (activeTab === 'locations') addMasterLocation(newItem);
                    else if (activeTab === 'hotels') addMasterHotel(newItem);
                    else if (activeTab === 'activities') addMasterActivity(newItem);
                    else if (activeTab === 'transport') addMasterTransport(newItem);
                    else if (activeTab === 'plans') addMasterPlan(newItem);
                    count++;
                });

                alert(`Successfully imported ${count} items into ${activeTab}.`);
                if (fileInputRef.current) fileInputRef.current.value = '';

            } catch (err) {
                alert('Failed to import: ' + (err as Error).message);
            }
        };
        reader.readAsText(file);
    };

    const handleOpenModal = (item?: any) => {
        setEditingItem(item || null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    // --- Data Processing ---
    const getProcessedData = () => {
        let data: any[] = [];
        switch (activeTab) {
            case 'locations': data = masterLocations; break;
            case 'hotels': data = masterHotels; break;
            case 'activities': data = masterActivities; break;
            case 'transport': data = masterTransports; break;
            case 'plans': data = masterPlans; break;
            default: return [];
        }

        // Filter
        data = data.filter(item => {
            const matchesSearch =
                (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.region || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort
        data.sort((a, b) => {
            const valA = a[sortBy] || a.title || '';
            const valB = b[sortBy] || b.title || '';

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    };

    const processedData = getProcessedData();

    // --- Analytics Tab Component ---
    const AnalyticsView = () => {
        const totalItems = masterLocations.length + masterHotels.length + masterActivities.length + masterTransports.length + masterPlans.length;

        const expensiveHotels = masterHotels.filter(h => h.pricePerNight > 10000).length;
        const midRangeHotels = masterHotels.filter(h => h.pricePerNight >= 5000 && h.pricePerNight <= 10000).length;
        const budgetHotels = masterHotels.filter(h => h.pricePerNight < 5000).length;

        const catCounts: Record<string, number> = {};
        masterActivities.forEach(a => {
            catCounts[a.category] = (catCounts[a.category] || 0) + 1;
        });

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Master Data', value: totalItems, icon: 'database', color: 'from-blue-500 to-indigo-600' },
                        { label: 'Active Locations', value: masterLocations.filter(l => l.status === 'Active').length, icon: 'location_on', color: 'from-emerald-500 to-teal-600' },
                        { label: 'Hotel Partners', value: masterHotels.length, icon: 'hotel', color: 'from-amber-500 to-orange-600' },
                        { label: 'Plan Templates', value: masterPlans.length, icon: 'map', color: 'from-purple-500 to-pink-600' },
                    ].map((kpi, i) => (
                        <div key={i} className="bg-white dark:bg-[#151d29] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150 duration-700`} />
                            <div className="flex justify-between items-start mb-4 relative">
                                <div className={`size-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg`}>
                                    <span className="material-symbols-outlined">{kpi.icon}</span>
                                </div>
                            </div>
                            <div className="relative">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</h3>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">{kpi.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#151d29] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-500">pie_chart</span>
                            Hotel Price Segmentation
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-4 px-4">
                            {[
                                { label: 'Budget (<5k)', count: budgetHotels, color: 'bg-emerald-400' },
                                { label: 'Mid (5k-10k)', count: midRangeHotels, color: 'bg-blue-400' },
                                { label: 'Luxury (>10k)', count: expensiveHotels, color: 'bg-purple-400' }
                            ].map((item, i) => {
                                const max = Math.max(budgetHotels, midRangeHotels, expensiveHotels, 1);
                                const height = (item.count / max) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl relative h-full flex items-end overflow-hidden group">
                                            <div style={{ height: `${height}%` }} className={`w-full ${item.color} rounded-t-xl opacity-80 group-hover:opacity-100 transition-all relative`}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-slate-900 dark:text-white">{item.count}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 text-center">{item.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#151d29] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">attractions</span>
                            Activity Distribution
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(catCounts).map(([cat, count], i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                                        <span className="text-slate-600 dark:text-slate-300">{cat}</span>
                                        <span className="text-slate-400">{count} activities</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${(count / masterActivities.length) * 100}%` }}
                                            className={`h-full rounded-full ${['bg-orange-400', 'bg-pink-400', 'bg-cyan-400', 'bg-lime-400'][i % 4]}`}
                                        />
                                    </div>
                                </div>
                            ))}
                            {Object.keys(catCounts).length === 0 && <p className="text-slate-500 italic">No activities found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Shared Components (FilterBar, BulkActionBar kept same) ---
    const FilterBar = () => (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#151d29] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-2">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                {activeTab !== 'analytics' && (
                    <>
                        <div className="relative flex-1 md:max-w-xs">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active Only</option>
                            <option value="Inactive">Inactive Only</option>
                        </select>
                    </>
                )}

                {activeTab !== 'analytics' && (
                    <div className="hidden md:flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="material-symbols-outlined">view_list</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {activeTab !== 'analytics' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json,.csv"
                            className="hidden"
                        />
                        <button onClick={handleImportClick} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors border border-dashed border-slate-300 dark:border-slate-600">
                            <span className="material-symbols-outlined text-[16px]">upload</span> Import
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-[16px]">download</span> Export
                        </button>
                    </div>
                )}

                {activeTab !== 'analytics' && (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                        <span>Sort:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="bg-transparent font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:underline"
                        >
                            <option value={activeTab === 'plans' ? 'title' : 'name'}>Name</option>
                            {(activeTab === 'hotels' || activeTab === 'activities' || activeTab === 'transport') && <option value={activeTab === 'hotels' ? 'pricePerNight' : activeTab === 'transport' ? 'baseRate' : 'cost'}>Price</option>}
                            <option value="status">Status</option>
                        </select>
                        <button onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <span className="material-symbols-outlined text-[16px]">{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const BulkActionBar = () => {
        if (selectedItems.size === 0) return null;
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 duration-200">
                <span className="font-bold flex items-center gap-2">
                    <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{selectedItems.size}</span>
                    <span className="text-sm">Selected</span>
                </span>
                <div className="h-4 w-px bg-white/20 dark:bg-black/10"></div>
                <div className="flex items-center gap-2">
                    <button onClick={() => bulkUpdateStatus('Active')} className="px-3 py-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-black/5 text-sm font-semibold transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span> Activate
                    </button>
                    <button onClick={() => bulkUpdateStatus('Inactive')} className="px-3 py-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-black/5 text-sm font-semibold transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">block</span> Deactivate
                    </button>
                    <button onClick={confirmBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center gap-2 ml-2 shadow-lg shadow-red-500/30">
                        <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                    </button>
                </div>
                <button onClick={() => setSelectedItems(new Set())} className="ml-2 hover:bg-white/10 p-1 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>
        );
    };

    // --- Renderers for Tab Content ---

    const renderCard = (item: any, type: MasterTab) => {
        const isSelected = selectedItems.has(item.id);
        const usage = getUsageCount(item.id, type);

        // ... (Render logic)
        let icon = 'inventory_2';
        let detail = '';
        let subtitle = '';
        let price = '';

        switch (type) {
            case 'locations':
                icon = 'location_on';
                subtitle = item.region;
                detail = item.type;
                break;
            case 'hotels':
                icon = 'hotel';
                subtitle = getLocationNameById(item.locationId);
                detail = `${item.rating} Stars`;
                price = `₹${item.pricePerNight?.toLocaleString()}`;
                break;
            case 'activities':
                icon = 'attractions';
                subtitle = getLocationNameById(item.locationId);
                detail = item.duration;
                price = `₹${item.cost?.toLocaleString()}`;
                break;
            case 'transport':
                icon = 'directions_car';
                subtitle = `${item.capacity} Seats`;
                detail = item.type;
                price = `₹${item.baseRate?.toLocaleString()}`;
                break;
            case 'plans':
                icon = 'map';
                subtitle = `${item.duration} Days`;
                detail = getLocationNameById(item.locationId);
                price = `₹${item.estimatedCost?.toLocaleString()}`;
                break;
        }

        const title = item.name || item.title;

        return (
            <div
                key={item.id}
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                    handleSelectOne(item.id);
                }}
                className={`
                    relative group bg-white dark:bg-[#151d29] rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer
                    ${isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg'
                    }
                `}
            >
                {/* Selection & Status */}
                <div className="absolute top-4 left-4 z-10 w-full flex justify-between pr-8">
                    <div
                        onClick={(e) => { e.stopPropagation(); handleSelectOne(item.id); }}
                        className={`size-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}
                    >
                        {isSelected && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${item.status === 'Active' ? 'bg-green-100/90 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-slate-100/90 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400'}`}>
                        {item.status}
                    </span>
                </div>

                <div className="p-6 pt-12">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1">{title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
                        </div>
                        <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {detail}
                        </span>
                        {price && <span className="font-bold text-slate-900 dark:text-white">{price}</span>}
                    </div>

                    {/* Usage/Relations Chip */}
                    {usage.total > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold" title={usage.details}>
                            <span className="material-symbols-outlined text-[14px]">link</span>
                            {usage.details.split(',')[0]}
                        </div>
                    )}
                </div>

                {/* Actions Overlay */}
                <div className={`absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-white via-white to-transparent dark:from-[#151d29] dark:via-[#151d29] flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isSelected ? 'opacity-100' : ''}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                        className="flex-1 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Duplicate"
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) type === 'locations' ? deleteMasterLocation(item.id) : type === 'hotels' ? deleteMasterHotel(item.id) : type === 'activities' ? deleteMasterActivity(item.id) : type === 'transport' ? deleteMasterTransport(item.id) : deleteMasterPlan(item.id) }}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
        );
    };

    const renderListView = () => (
        <div className="bg-white dark:bg-[#151d29] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                        <th className="px-6 py-4 w-12">
                            <input
                                type="checkbox"
                                checked={processedData.length > 0 && selectedItems.size === processedData.length}
                                onChange={() => handleSelectAll(processedData)}
                                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Name/Title</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Details</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Relations</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {processedData.length > 0 ? processedData.map((item) => {
                        const isSelected = selectedItems.has(item.id);
                        const usage = getUsageCount(item.id, activeTab as MasterTab);

                        return (
                            <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleSelectOne(item.id)}
                                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900 dark:text-white">{item.name || item.title}</p>
                                    <p className="text-xs text-slate-500 font-mono">{item.id}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                    <div className="flex flex-col">
                                        <span>{activeTab === 'locations' ? item.type : item.category || item.type}</span>
                                        <span className="text-xs text-slate-400">{activeTab === 'locations' ? item.region : getLocationNameById(item.locationId)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {usage.total > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                                            <span className="material-symbols-outlined text-[14px]">link</span> {usage.total} linked
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${item.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 text-slate-400'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleDuplicate(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Duplicate">
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        </button>
                                        <button onClick={() => handleOpenModal(item)} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-4xl opacity-20">search_off</span>
                                    <p>No items found matching your filters.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 max-w-[1800px] mx-auto space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Master Data Manager</h1>
                    <p className="text-slate-500 mt-1 font-medium">Centralized control for all tour components</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span>Add New</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-[#151d29] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none justify-center ${activeTab === tab.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Controls */}
            {activeTab === 'analytics' ? (
                <AnalyticsView />
            ) : (
                <>
                    <FilterBar />

                    {/* Content Area */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {processedData.length > 0 ? (
                                processedData.map((item) => renderCard(item, activeTab))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No items found</h3>
                                    <p className="text-slate-500">Try adjusting your filters or search query.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        renderListView()
                    )}
                </>
            )}

            {/* Bulk Action Bar */}
            {activeTab !== 'analytics' && <BulkActionBar />}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 p-8 animate-in fade-in" onClick={handleCloseModal}>
                    <div className="bg-white dark:bg-[#1a2332] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 sticky top-0 backdrop-blur-md z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingItem ? 'Edit' : 'Add New'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1) || 'Item'}</h2>
                            <button onClick={handleCloseModal} className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <MasterModal activeTab={activeTab} editingItem={editingItem} onClose={handleCloseModal} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
