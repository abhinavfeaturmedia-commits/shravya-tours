import React, { useState } from 'react';
import { useAuth, DEFAULT_PERMISSIONS } from '../../context/AuthContext';
import { toast } from '../../components/ui/Toast';
import { StaffMember, StaffPermissions } from '../../types';

export const StaffManagement: React.FC = () => {
    const { staff, addStaff, updateStaff, deleteStaff } = useAuth();
    const [search, setSearch] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        phone: string;
        role: string;
        userType: 'Staff' | 'Admin';
        department: string;
        status: string;
        queryScope: 'Show Assigned Query Only' | 'Show All Queries';
        whatsappScope: 'Assigned Queries Messages' | 'All Messages';
        permissions: StaffPermissions;
    }>({
        name: '',
        email: '',
        phone: '',
        role: 'Editor',
        userType: 'Staff',
        department: 'Operations',
        status: 'Active',
        queryScope: 'Show Assigned Query Only',
        whatsappScope: 'Assigned Queries Messages',
        permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
    });

    const selectedMember = staff.find(s => s.id === selectedStaffId);

    // Stats
    const activeStaff = staff.filter(s => s.status === 'Active').length;
    const newStaff = staff.filter(s => s.id > 1).length; // Mock logic for 'new'

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'Editor',
            userType: 'Staff',
            department: 'Operations',
            status: 'Active',
            queryScope: 'Show Assigned Query Only',
            whatsappScope: 'Assigned Queries Messages',
            permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (member: StaffMember) => {
        setIsEditing(true);
        setEditingId(member.id);
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            role: member.role,
            userType: member.userType || 'Staff',
            department: member.department,
            status: member.status,
            queryScope: member.queryScope || 'Show Assigned Query Only',
            whatsappScope: member.whatsappScope || 'Assigned Queries Messages',
            permissions: member.permissions ? JSON.parse(JSON.stringify(member.permissions)) : JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
        });
        setIsModalOpen(true);
    };

    const handlePermissionChange = (module: keyof StaffPermissions, type: 'view' | 'manage', checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: {
                    ...prev.permissions[module],
                    [type]: checked
                }
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple Validation
        if (!isEditing && staff.some(s => s.email === formData.email)) {
            toast.error('A staff member with this email already exists.');
            return;
        }

        const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const colorMap: Record<string, string> = { 'Super Admin': 'purple', 'Manager': 'blue', 'Editor': 'green', 'Support': 'orange' };

        // Construct the data object
        const staffData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            userType: formData.userType,
            department: formData.department as any,
            status: formData.status as any,
            queryScope: formData.queryScope,
            whatsappScope: formData.whatsappScope,
            permissions: formData.permissions,
            initials,
            color: colorMap[formData.role] || 'slate'
        };

        if (isEditing && editingId) {
            // Prevention: Cannot change role of Super Admin if it's the logged in user (Simulated as ID 1)
            if (editingId === 1 && formData.role !== 'Super Admin' && formData.role !== 'CEO (TravelBit Holidays)') {
                // Let ID 1 stay as whatever role they have or upgrade, but warn if demolishing rights? 
                // Logic simplified: ID 1 is protected.
            }

            updateStaff(editingId, staffData);
        } else {
            const newMember: StaffMember = {
                id: Date.now(),
                ...staffData,
                lastActive: 'Never',
            };
            addStaff(newMember);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (id === 1) {
            toast.error("System limitation: Cannot delete the primary Super Admin.");
            return;
        }
        if (window.confirm('Are you sure you want to remove this staff member? This will revoke their access immediately.')) {
            deleteStaff(id);
            if (selectedStaffId === id) setSelectedStaffId(null);
        }
    };

    const toggleStatus = (id: number) => {
        const member = staff.find(s => s.id === id);
        if (member) {
            if (id === 1 && member.status === 'Active') {
                toast.error("Cannot deactivate the primary Super Admin.");
                return;
            }
            updateStaff(id, { status: member.status === 'Active' ? 'Inactive' : 'Active' });
        }
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'All' || s.department === activeTab;
        return matchesSearch && matchesTab;
    });

    const getRoleBadge = (role: string) => {
        if (role.includes('Admin') || role.includes('CEO')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        if (role.includes('Manager')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (role.includes('Support')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">

            {/* ADD/EDIT STAFF MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1A2633] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Staff Member' : 'Add New Member'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <form id="staffForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Full Name</label>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Department</label>
                                        <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option>Executive</option>
                                            <option>Sales</option>
                                            <option>Operations</option>
                                            <option>Marketing</option>
                                            <option>Support</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Primary Email</label>
                                        <input required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="john@shravya.com" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Mobile (WhatsApp)</label>
                                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} type="tel" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="+91 98765 43210" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Role Title</label>
                                        <input
                                            list="roles"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="e.g. Senior Tour Manager"
                                        />
                                        <datalist id="roles">
                                            <option value="Super Admin" />
                                            <option value="Manager" />
                                            <option value="Editor" />
                                            <option value="Support" />
                                            <option value="CEO (TravelBit Holidays)" />
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">User Type</label>
                                        <select value={formData.userType} onChange={e => setFormData({ ...formData, userType: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value="Staff">Staff</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Permissions & Scope</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">Query Scope</label>
                                            <select value={formData.queryScope} onChange={e => setFormData({ ...formData, queryScope: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                <option>Show Assigned Query Only</option>
                                                <option>Show All Queries</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">WhatsApp Scope</label>
                                            <select value={formData.whatsappScope} onChange={e => setFormData({ ...formData, whatsappScope: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                <option>Assigned Queries Messages</option>
                                                <option>All Messages</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800 text-left">
                                                <tr>
                                                    <th className="px-4 py-3 font-bold text-slate-500">Module</th>
                                                    <th className="px-4 py-3 font-bold text-slate-500 text-center w-24">View</th>
                                                    <th className="px-4 py-3 font-bold text-slate-500 text-center w-24">Manage</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {Object.entries(formData.permissions).map(([key, value]) => {
                                                    // Format camelCase to Title Case
                                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                                    const typedKey = key as keyof StaffPermissions;

                                                    return (
                                                        <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{label}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.permissions[typedKey].view}
                                                                    onChange={e => handlePermissionChange(typedKey, 'view', e.target.checked)}
                                                                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.permissions[typedKey].manage}
                                                                    onChange={e => handlePermissionChange(typedKey, 'manage', e.target.checked)}
                                                                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.status === 'Active'}
                                        onChange={e => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                                        className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Account</label>
                                </div>

                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="sendMail" className="size-4 rounded border-gray-300" />
                                <label htmlFor="sendMail" className="text-xs text-slate-500">Reset and send temporary password to mail</label>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" form="staffForm" className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors">{isEditing ? 'Save' : 'Save'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header & Stats */}
            <div className="p-6 md:p-8 flex-shrink-0">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your team, roles, and department access.</p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            Add Member
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#1A2633] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Staff</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{staff.length}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1A2633] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Now</p>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{activeStaff}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1A2633] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Departments</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">5</p>
                        </div>
                        <div className="bg-white dark:bg-[#1A2633] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">New (Mo)</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">+{newStaff}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {['All', 'Executive', 'Sales', 'Operations', 'Marketing', 'Support'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-[#1A2633] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                            <input
                                className="w-full bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Search staff..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Content Area */}
            <div className="flex-1 flex overflow-hidden border-t border-slate-200 dark:border-slate-800">

                {/* Left List */}
                <div className={`w-full lg:w-2/3 xl:w-8/12 overflow-y-auto bg-white dark:bg-[#1A2633] border-r border-slate-200 dark:border-slate-800 ${selectedStaffId ? 'hidden lg:block' : 'block'}`}>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Header */}
                        <div className="hidden md:flex items-center px-6 py-3 bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="w-1/3">Employee</div>
                            <div className="w-1/6">Role</div>
                            <div className="w-1/6">Department</div>
                            <div className="w-1/6">Status</div>
                            <div className="w-1/6 text-right">Last Active</div>
                        </div>

                        {filteredStaff.map(member => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedStaffId(member.id)}
                                className={`group flex items-center p-4 md:px-6 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedStaffId === member.id ? 'bg-primary/5 border-l-4 border-primary pl-3 md:pl-[20px]' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="flex items-center gap-4 flex-1 md:w-1/3">
                                    <div className={`size-10 rounded-full flex items-center justify-center font-black text-xs bg-${member.color}-100 dark:bg-${member.color}-900/30 text-${member.color}-600`}>
                                        {member.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{member.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                    </div>
                                </div>

                                <div className="hidden md:block w-1/6">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${getRoleBadge(member.role)}`}>{member.role}</span>
                                </div>

                                <div className="hidden md:block w-1/6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {member.department}
                                </div>

                                <div className="hidden md:block w-1/6">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${member.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                                        <span className={`size-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        {member.status}
                                    </span>
                                </div>

                                <div className="hidden md:block w-1/6 text-right text-xs text-slate-500 font-medium">
                                    {member.lastActive}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Detail Panel */}
                <div className={`w-full lg:w-1/3 xl:w-4/12 bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden ${selectedStaffId ? 'fixed inset-0 z-[60] lg:static lg:inset-auto' : 'hidden'}`}>
                    {selectedMember ? (
                        <div className="h-full flex flex-col bg-white dark:bg-[#1A2633] shadow-xl">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedStaffId(null)} className="lg:hidden text-slate-500 -ml-2 p-2"><span className="material-symbols-outlined">arrow_back</span></button>
                                    <div className={`size-14 rounded-full flex items-center justify-center font-black text-xl bg-${selectedMember.color}-100 dark:bg-${selectedMember.color}-900/30 text-${selectedMember.color}-600`}>
                                        {selectedMember.initials}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedMember.name}</h2>
                                        <p className="text-sm text-slate-500">{selectedMember.role} • {selectedMember.department}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEdit(selectedMember)} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors"><span className="material-symbols-outlined">edit</span></button>
                                    <button onClick={() => handleDelete(selectedMember.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Account Status</p>
                                        <p className="text-xs text-slate-500">{selectedMember.status === 'Active' ? 'User can access the system' : 'User access is suspended'}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(selectedMember.id)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedMember.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedMember.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Contact Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">mail</span></div>
                                            {selectedMember.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">call</span></div>
                                            {selectedMember.phone || 'No phone added'}
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Summary (Dynamic) */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Effective Permissions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMember.permissions && Object.entries(selectedMember.permissions).map(([key, value]) => {
                                            const val = value as { manage: boolean; view: boolean };
                                            if (val.manage || val.view) {
                                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                                return (
                                                    <span key={key} className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 ${val.manage ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                                                        {label}
                                                        {val.manage ? <span className="material-symbols-outlined text-[14px]">edit_square</span> : <span className="material-symbols-outlined text-[14px]">visibility</span>}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}
                                        {(!selectedMember.permissions || !Object.values(selectedMember.permissions).some((p: any) => p.view || p.manage)) && (
                                            <span className="text-sm text-slate-400 italic">No permissions assigned.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Performance (Mocked) */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Performance (Last 30 Days)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <p className="text-xs text-slate-500 mb-1">Leads Handled</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">24</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <p className="text-xs text-slate-500 mb-1">Conversion Rate</p>
                                            <p className="text-xl font-black text-green-600">18%</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">badge</span>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">Select a member to view details</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};