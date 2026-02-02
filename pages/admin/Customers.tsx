import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Customer, Booking, Lead } from '../../types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- Sort & Filter Types ---
type SortField = 'name' | 'totalSpent' | 'bookingsCount' | 'joinedDate';
type SortOrder = 'asc' | 'desc';

export const Customers: React.FC = () => {
    const { customers, bookings, leads, addCustomer, updateCustomer, deleteCustomer, importCustomers } = useData();
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('joinedDate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filterType, setFilterType] = useState<string>('All');

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); // For Details Drawer
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // For Edit Modal

    // Stats
    const totalRevenue = useMemo(() => customers.reduce((acc, c) => acc + c.totalSpent, 0), [customers]);
    const vipCount = useMemo(() => customers.filter(c => c.type === 'VIP').length, [customers]);
    const activeCount = useMemo(() => customers.filter(c => c.status === 'Active').length, [customers]);

    // Data Processing
    const processedCustomers = useMemo(() => {
        let result = customers.filter(c =>
            (c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                c.phone.includes(search)) &&
            (filterType === 'All' || c.type === filterType)
        );

        return result.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (valA === undefined || valB === undefined) return 0;

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });
    }, [customers, search, filterType, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc'); // Default to desc for metrics
        }
    };

    // Export CSV
    const handleExport = () => {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Type', 'Status', 'Total Spent', 'Bookings', 'Joined Date'];
        const rows = processedCustomers.map(c => [
            c.id, c.name, c.email, c.phone, c.location || '', c.type, c.status, c.totalSpent, c.bookingsCount, c.joinedDate
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Customers exported successfully!');
    };

    return (
        <div className="p-8 pb-32 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Customers</h1>
                    <p className="text-slate-500 font-medium">Manage your client relationships</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Import
                    </button>
                    <button onClick={handleExport} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export
                    </button>
                    <button onClick={() => { setEditingCustomer(null); setIsAddModalOpen(true); }} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center gap-2 group">
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                        New Customer
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Total Active Customers"
                    value={activeCount}
                    icon="group"
                    color="blue"
                    subtext={`+${customers.length - activeCount} Inactive`}
                />
                <StatCard
                    label="VIP Clients"
                    value={vipCount}
                    icon="stars"
                    color="amber"
                    subtext="High Value Customers"
                />
                <StatCard
                    label="Total Revenue (LTV)"
                    value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
                    icon="payments"
                    color="emerald"
                    subtext="Lifetime Value"
                />
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-[#151d29] rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[600px]">
                {/* Search & Filters */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="relative w-full max-w-md group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none bg-white dark:bg-slate-800 pl-4 pr-10 py-3 rounded-xl border-none text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                            >
                                <option value="All">All Types</option>
                                <option value="New">New</option>
                                <option value="Returning">Returning</option>
                                <option value="VIP">VIP</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">filter_list</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-extrabold">
                                <th onClick={() => handleSort('name')} className="p-6 cursor-pointer hover:text-primary transition-colors select-none">
                                    <div className="flex items-center gap-2">
                                        Customer
                                        {sortField === 'name' && <span className="material-symbols-outlined text-[16px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('totalSpent')} className="p-6 cursor-pointer hover:text-primary transition-colors select-none">
                                    <div className="flex items-center gap-2">
                                        Value (LTV)
                                        {sortField === 'totalSpent' && <span className="material-symbols-outlined text-[16px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                                    </div>
                                </th>
                                <th className="p-6">Status / Tags</th>
                                <th onClick={() => handleSort('joinedDate')} className="p-6 cursor-pointer hover:text-primary transition-colors select-none">
                                    <div className="flex items-center gap-2">
                                        Joined
                                        {sortField === 'joinedDate' && <span className="material-symbols-outlined text-[16px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                                    </div>
                                </th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {processedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                                            <p className="text-xl font-bold">No customers found</p>
                                            <p className="text-sm mt-2">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processedCustomers.map(customer => (
                                    <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-12 rounded-[1rem] flex items-center justify-center font-black text-lg text-white shadow-md shadow-slate-200 dark:shadow-none transition-transform group-hover:scale-110 ${customer.type === 'VIP' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                                                        customer.type === 'Returning' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                                                            'bg-gradient-to-br from-slate-400 to-slate-600'
                                                    }`}>
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">{customer.name}</p>
                                                    <div className="flex flex-col text-xs text-slate-500 font-medium">
                                                        <span>{customer.email}</span>
                                                        <span className="opacity-70">{customer.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                                                    ₹{customer.totalSpent.toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-emerald-500"></span>
                                                    <span className="text-xs font-bold text-slate-500">{customer.bookingsCount} orders</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2 items-start">
                                                <div className="flex gap-2">
                                                    <Badge label={customer.status} color={customer.status === 'Active' ? 'green' : 'slate'} />
                                                    <Badge label={customer.type} color={customer.type === 'VIP' ? 'amber' : customer.type === 'Returning' ? 'blue' : 'slate'} />
                                                </div>
                                                {customer.tags && customer.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {customer.tags.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {customer.tags.length > 2 && <span className="text-[10px] text-slate-400">+{customer.tags.length - 2}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                {new Date(customer.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{customer.location || 'Unknown Loc.'}</div>
                                        </td>
                                        <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingCustomer(customer); setIsAddModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                </button>
                                                <button onClick={() => { if (confirm('Delete?')) deleteCustomer(customer.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                                <button onClick={() => setSelectedCustomer(customer)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Details Drawer */}
            <CustomerDetailsDrawer
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
                bookings={bookings}
                leads={leads}
                onEdit={() => { setEditingCustomer(selectedCustomer); setIsAddModalOpen(true); }}
            />

            {/* Add/Edit Modal */}
            <AddEditCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                customer={editingCustomer}
                onSubmit={(data) => {
                    if (editingCustomer) {
                        updateCustomer(editingCustomer.id, data);
                        toast.success('Customer updated');
                        if (selectedCustomer?.id === editingCustomer.id) {
                            setSelectedCustomer({ ...editingCustomer, ...data });
                        }
                    } else {
                        addCustomer({
                            id: `CUST-${Date.now()}`,
                            ...data,
                            totalSpent: 0,
                            bookingsCount: 0,
                            joinedDate: new Date().toISOString().split('T')[0],
                            status: 'Active'
                        });
                        toast.success('Customer added');
                    }
                    setIsAddModalOpen(false);
                }}
            />

            {/* Import Modal */}
            <ImportCustomersModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={(data) => {
                    importCustomers(data);
                    setIsImportModalOpen(false);
                    toast.success(`${data.length} customers imported!`);
                }}
            />
        </div>
    );
};

// --- Helper Components ---

const StatCard = ({ label, value, icon, color, subtext }: any) => (
    <div className={`bg-white dark:bg-[#151d29] p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-${color}-600`}>
            <span className="material-symbols-outlined text-8xl">{icon}</span>
        </div>
        <div className="relative z-10">
            <div className={`size-12 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400 mb-4`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
            <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
                <span className={`size-1.5 rounded-full bg-${color}-500`}></span>
                {subtext}
            </p>
        </div>
    </div>
);

const Badge = ({ label, color }: { label: string, color: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-${color}-50 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-300 border-${color}-100 dark:border-${color}-800`}>
        {label}
    </span>
);

// --- Drawers & Modals ---

const CustomerDetailsDrawer: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    bookings: Booking[];
    leads: Lead[];
    onEdit: () => void;
}> = ({ isOpen, onClose, customer, bookings, leads, onEdit }) => {
    if (!customer) return null;

    // Logic: Find related data
    const relatedBookings = bookings.filter(b => b.email === customer.email || b.phone === customer.phone || b.customer === customer.id);
    const relatedLeads = leads.filter(l => l.email === customer.email || l.phone === customer.phone);

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" onClick={onClose} />}
            <div className={`fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#0B1116] shadow-2xl z-[160] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                    <button onClick={onClose} className="absolute top-6 left-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                    </button>
                    <button onClick={onEdit} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-2xl">edit</span>
                    </button>
                    <div className="absolute -bottom-12 left-8 flex items-end">
                        <div className="size-24 rounded-[2rem] bg-white dark:bg-[#0B1116] p-2 shadow-xl">
                            <div className="size-full rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-black text-slate-400">
                                {customer.name.charAt(0)}
                            </div>
                        </div>
                        <div className="mb-14 ml-4 text-white">
                            <h2 className="text-2xl font-black tracking-tight">{customer.name}</h2>
                            <p className="opacity-80 font-medium text-sm">{customer.email}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-12 px-8 space-y-10">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-400 uppercase">Lifetime Value</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{customer.totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-400 uppercase">Member Since</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{new Date(customer.joinedDate).getFullYear()}</p>
                            <Badge label={customer.type} color="indigo" />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">contact_mail</span>
                            Contact Details
                        </h3>
                        <div className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-slate-400">call</span>
                                {customer.phone}
                            </div>
                            <div className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-slate-400">email</span>
                                {customer.email}
                            </div>
                            <div className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-slate-400">location_on</span>
                                {customer.location || 'No Location Set'}
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {customer.tags && customer.tags.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {customer.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interaction History */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">history</span>
                            Interaction History
                        </h3>

                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
                            {/* Bookings */}
                            {relatedBookings.map(booking => (
                                <div key={booking.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500"></div>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Booking Confirmed</span>
                                            <span className="text-xs text-slate-400">{new Date(booking.date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{booking.title}</h4>
                                        <p className="text-sm text-slate-500">₹{booking.amount.toLocaleString()} • {booking.guests || 'N/A'}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Leads */}
                            {relatedLeads.map(lead => (
                                <div key={lead.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-white dark:border-slate-900 bg-amber-500"></div>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm opacity-80">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">Inquiry: {lead.status}</span>
                                            <span className="text-xs text-slate-400">{new Date(lead.addedOn).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{lead.destination}</h4>
                                        <p className="text-sm text-slate-500">{lead.preferences || 'No details'}</p>
                                    </div>
                                </div>
                            ))}

                            {relatedBookings.length === 0 && relatedLeads.length === 0 && (
                                <div className="pl-8 text-slate-400 italic text-sm">No history found for this customer.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ... (CustomerSchema and AddEditModal updated with Tags support below) ...
const customerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    location: z.string().optional(),
    type: z.enum(['New', 'Returning', 'VIP']),
    tags: z.string().optional(), // Comma separated string for input
});

type CustomerFormData = z.infer<typeof customerSchema>;

const AddEditCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onSubmit: (data: any) => void;
}> = ({ isOpen, onClose, customer, onSubmit }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '', email: '', phone: '', location: '', type: 'New', tags: ''
        }
    });

    useEffect(() => {
        if (customer) {
            reset({
                ...customer,
                tags: customer.tags?.join(', ') || ''
            });
        } else {
            reset({ name: '', email: '', phone: '', location: '', type: 'New', tags: '' });
        }
    }, [customer, reset, isOpen]);

    const handleFormSubmit = (data: CustomerFormData) => {
        // Parse tags
        const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        onSubmit({ ...data, tags: tagsArray });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-[#1A2633] w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 ring-1 ring-white/10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{customer ? 'Edit Profile' : 'New Customer'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Full Name</label>
                            <input {...register('name')} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-none p-3.5 font-bold outline-none focus:ring-2 focus:ring-primary/50" placeholder="John Doe" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Location</label>
                            <input {...register('location')} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-none p-3.5 font-bold outline-none focus:ring-2 focus:ring-primary/50" placeholder="City" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email Address</label>
                        <input {...register('email')} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-none p-3.5 font-bold outline-none focus:ring-2 focus:ring-primary/50" placeholder="john@example.com" />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Phone</label>
                            <input {...register('phone')} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-none p-3.5 font-bold outline-none focus:ring-2 focus:ring-primary/50" placeholder="9876543210" />
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Client Type</label>
                            <select {...register('type')} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-none p-3.5 font-bold outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="New">New</option>
                                <option value="Returning">Returning</option>
                                <option value="VIP">VIP</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Tags (Comma separated)</label>
                        <input {...register('tags')} className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-none p-3.5 font-bold outline-none focus:ring-2 focus:ring-primary/50" placeholder="High Value, Family, Corp..." />
                    </div>

                    <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 mt-4">
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

const ImportCustomersModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Customer[]) => void;
}> = ({ isOpen, onClose, onImport }) => {
    // ... (Same as before, simplified for brevity but will be fully written in final file)
    const [csvText, setCsvText] = useState('');
    const [preview, setPreview] = useState<Customer[]>([]);

    useEffect(() => {
        if (!csvText) { setPreview([]); return; };
        const lines = csvText.split('\n');
        const parsed: Customer[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length >= 3) {
                parsed.push({
                    id: `IMP-${Date.now()}-${i}`,
                    name: parts[0]?.trim() || 'Unknown',
                    email: parts[1]?.trim() || '',
                    phone: parts[2]?.trim() || '',
                    location: parts[3]?.trim() || 'Unknown',
                    type: 'New',
                    status: 'Active',
                    bookingsCount: 0,
                    totalSpent: 0,
                    joinedDate: new Date().toISOString().split('T')[0],
                    tags: []
                });
            }
        }
        setPreview(parsed);
    }, [csvText]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-[#1A2633] w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bulk Import</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>
                <p className="text-slate-500 mb-6 text-sm font-medium">Paste CSV data: <span className="text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Name, Email, Phone, Location</span></p>

                <textarea
                    className="w-full flex-1 min-h-[200px] p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none font-mono text-xs outline-none focus:ring-2 focus:ring-primary mb-4 resize-none"
                    placeholder="John Doe, john@example.com, 9876543210, Mumbai"
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                />

                <div className="flex gap-4">
                    <button
                        onClick={() => onImport(preview)}
                        disabled={preview.length === 0}
                        className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                        Import {preview.length} Records
                    </button>
                </div>
            </div>
        </div>
    )
};
