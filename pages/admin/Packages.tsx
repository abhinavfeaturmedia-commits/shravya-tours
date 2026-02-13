import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Package } from '../../types';
import { ImageUpload } from '../../components/ui/ImageUpload';

export const AdminPackages: React.FC = () => {
    const { packages, updatePackage, deletePackage, cmsGallery } = useData();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

    // Comprehensive Edit Form State
    const [editForm, setEditForm] = useState({
        title: '',
        location: '',
        price: 0,
        days: 0,
        description: '',
        overview: '',
        image: '',
        tag: '',
        tagColor: 'bg-blue-500 text-white',
        theme: '',
        groupSize: '',
        status: 'Active' as 'Active' | 'Inactive'
    });

    // Derived Stats
    const totalPackages = packages.length;
    const activePackages = packages.filter(p => p.status === 'Active').length;
    const inactivePackages = totalPackages - activePackages;

    const handleEditClick = (pkg: Package) => {
        setEditingPackageId(pkg.id);
        setEditForm({
            title: pkg.title,
            location: pkg.location,
            price: pkg.price,
            days: pkg.days,
            description: pkg.description,
            overview: pkg.overview,
            image: pkg.image,
            tag: pkg.tag || '',
            tagColor: pkg.tagColor || 'bg-blue-500 text-white',
            theme: pkg.theme,
            groupSize: pkg.groupSize,
            status: pkg.status || 'Active'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPackageId) {
            updatePackage(editingPackageId, {
                ...editForm
            });
            setIsEditModalOpen(false);
            setEditingPackageId(null);
        }
    };

    const handleToggleStatus = (pkg: Package) => {
        const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
        updatePackage(pkg.id, { status: newStatus });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this package? Associated bookings will remain but linkage might break.')) {
            deletePackage(id);
        }
    };

    const filteredPackages = packages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1A2633] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Package Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Section: Basic Info */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">General Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Package Title</label>
                                        <input required value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Location</label>
                                        <input required value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Price (₹)</label>
                                        <input required value={editForm.price} onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Duration (Days)</label>
                                            <input required value={editForm.days} onChange={e => setEditForm({ ...editForm, days: parseInt(e.target.value) || 0 })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Group Size</label>
                                            <input value={editForm.groupSize} onChange={e => setEditForm({ ...editForm, groupSize: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Max 10" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Marketing */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Marketing & Display</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Badge Tag</label>
                                        <input value={editForm.tag} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Best Seller" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Theme (Collection)</label>
                                        <select value={editForm.theme} onChange={e => setEditForm({ ...editForm, theme: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value="">Select a Collection</option>
                                            {cmsGallery.map(item => (
                                                <option key={item.id} value={item.title}>{item.title}</option>
                                            ))}
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Badge Color Class</label>
                                        <select value={editForm.tagColor} onChange={e => setEditForm({ ...editForm, tagColor: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value="bg-blue-500 text-white">Blue</option>
                                            <option value="bg-green-500 text-white">Green</option>
                                            <option value="bg-red-500 text-white">Red</option>
                                            <option value="bg-yellow-400 text-yellow-900">Yellow</option>
                                            <option value="bg-purple-500 text-white">Purple</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Status</label>
                                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value="Active">Active (Visible)</option>
                                            <option value="Inactive">Inactive (Hidden)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Content */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Content</h3>
                                <div className="space-y-4">
                                    <div>
                                        <ImageUpload
                                            label="Cover Image"
                                            value={editForm.image}
                                            onChange={(val) => setEditForm({ ...editForm, image: val })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Short Description</label>
                                        <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Full Overview</label>
                                        <textarea value={editForm.overview} onChange={e => setEditForm({ ...editForm, overview: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none h-24 resize-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1A2633] border-t border-slate-100 dark:border-slate-800 mt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20 transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header & Stats */}
            <div className="p-6 md:p-8 flex flex-col gap-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2633] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Package Manager</h1>
                        <p className="text-slate-500 mt-1">Create, edit, and manage your travel products.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/itinerary-builder')}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-primary-dark"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Create New Package
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined">inventory_2</span></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{totalPackages}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><span className="material-symbols-outlined">check_circle</span></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{activePackages}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined">visibility_off</span></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hidden</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{inactivePackages}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 md:px-8 py-4 bg-slate-50 dark:bg-slate-900">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                    <input
                        className="w-full bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-shadow"
                        placeholder="Search packages by title or location..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Package List */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-10">
                <div className="space-y-4">
                    {filteredPackages.length > 0 ? (
                        filteredPackages.map((pkg) => (
                            <div key={pkg.id} className="group bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-lg transition-all hover:border-primary/30">
                                {/* Image */}
                                <div className="size-24 md:size-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                                    <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{pkg.title}</h3>
                                        {pkg.status === 'Inactive' && <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Hidden</span>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {pkg.location}</span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {pkg.days} Days</span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span> {pkg.groupSize}</span>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-8 md:pr-4 md:border-r border-slate-100 dark:border-slate-700">
                                    <div className="text-center md:text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                                        <p className="font-black text-slate-900 dark:text-white">₹{(pkg.price / 1000).toFixed(0)}k</p>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                                        <p className="font-black text-slate-900 dark:text-white">₹{(pkg.price / 1000).toFixed(0)}k</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full md:w-auto flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => navigate(`/packages/${pkg.id}`)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(pkg)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${pkg.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'}`}
                                    >
                                        {pkg.status === 'Active' ? 'Active' : 'Hidden'}
                                    </button>
                                    <button onClick={() => handleEditClick(pkg)} className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Edit">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(pkg.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-2 opacity-30">inventory_2</span>
                            <p>No packages found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};