import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { bookings: globalBookings, packages, leads: globalLeads, vendors, masterLocations, masterHotels, masterActivities } = useData();
    const { currentUser } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [selectedYear, setSelectedYear] = useState('This Year');

    // --- RBAC Scoping ---
    const isRestricted = currentUser?.queryScope === 'Show Assigned Query Only';

    const bookings = useMemo(() => {
        if (!isRestricted) return globalBookings;
        return globalBookings.filter(b => b.assignedTo === currentUser?.id);
    }, [globalBookings, isRestricted, currentUser?.id]);

    const leads = useMemo(() => {
        if (!isRestricted) return globalLeads;
        return globalLeads.filter(l => l.assignedTo === currentUser?.id);
    }, [globalLeads, isRestricted, currentUser?.id]);

    // --- Enhanced Business Intelligence Calculations ---

    // Revenue Metrics
    const totalRevenue = bookings.reduce((acc, b) => b.payment === 'Paid' ? acc + b.amount : acc, 0);
    const bookingCount = bookings.length;
    const activePackages = packages.filter(p => p.status === 'Active').length;

    // Lead Analytics
    const newLeadsCount = leads.filter(l => l.status === 'New').length;
    const hotLeadsCount = leads.filter(l => l.status === 'Hot').length;
    const convertedLeadsCount = leads.filter(l => l.status === 'Converted').length;
    const totalLeadsValue = leads.reduce((sum, l) => sum + l.potentialValue, 0);

    // Conversion Rate Calculation
    const conversionRate = leads.length > 0
        ? Math.round((convertedLeadsCount / leads.length) * 100)
        : 0;

    // Pending Actions
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const unpaidBookings = bookings.filter(b => b.payment === 'Unpaid').length;

    // Recent Week Analysis (simulated comparison)
    const thisWeekBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return bookingDate >= weekAgo;
    }).length;

    // Smart Alerts & Recommendations
    const smartAlerts = useMemo(() => {
        const alerts: { type: 'warning' | 'info' | 'success'; message: string; action: string; path: string }[] = [];

        if (hotLeadsCount > 0) {
            alerts.push({
                type: 'warning',
                message: `${hotLeadsCount} hot lead${hotLeadsCount > 1 ? 's' : ''} need immediate attention`,
                action: 'View Leads',
                path: '/admin/leads'
            });
        }

        if (unpaidBookings > 0) {
            alerts.push({
                type: 'warning',
                message: `${unpaidBookings} booking${unpaidBookings > 1 ? 's' : ''} pending payment`,
                action: 'Collect Payment',
                path: '/admin/bookings'
            });
        }

        if (pendingBookings > 3) {
            alerts.push({
                type: 'info',
                message: `${pendingBookings} bookings awaiting confirmation`,
                action: 'Review',
                path: '/admin/bookings?status=Pending'
            });
        }

        if (conversionRate > 25) {
            alerts.push({
                type: 'success',
                message: `Great conversion rate: ${conversionRate}%! Keep it up.`,
                action: 'View Analytics',
                path: '/admin/analytics'
            });
        }

        return alerts;
    }, [hotLeadsCount, unpaidBookings, pendingBookings, conversionRate]);

    // Dynamic Activity Log with better time display
    const recentActivities = useMemo(() => {
        const getRelativeTime = (dateStr: string) => {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        };

        return [
            ...bookings.map(b => ({
                id: b.id,
                type: 'Booking',
                title: `Booking: ${b.customer}`,
                desc: `${b.title} - ₹${b.amount.toLocaleString()}`,
                time: b.date,
                displayTime: getRelativeTime(b.date),
                icon: 'airplane_ticket',
                color: b.status === 'Confirmed' ? 'text-green-500' : 'text-blue-500'
            })),
            ...leads.map(l => ({
                id: l.id,
                type: 'Lead',
                title: `Lead: ${l.name}`,
                desc: `${l.destination} (${l.status})`,
                time: l.addedOn,
                displayTime: getRelativeTime(l.addedOn),
                icon: l.status === 'Hot' ? 'local_fire_department' : 'person_add',
                color: l.status === 'Hot' ? 'text-red-500' : 'text-purple-500'
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
    }, [bookings, leads]);

    // Master Data Stats
    const masterDataStats = {
        locations: masterLocations?.length || 0,
        hotels: masterHotels?.length || 0,
        activities: masterActivities?.length || 0
    };

    // Smart Suggestions - AI-like proactive recommendations
    const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

    const smartSuggestions = useMemo(() => {
        const suggestions: { id: string; icon: string; title: string; desc: string; action: string; path: string; gradient: string }[] = [];

        // Suggest follow-up for cold leads
        const coldLeads = leads.filter(l => l.status === 'Cold').length;
        if (coldLeads > 0) {
            suggestions.push({
                id: 'cold-leads',
                icon: 'psychology',
                title: 'Re-engage Cold Leads',
                desc: `${coldLeads} leads haven't been contacted recently. Consider sending a follow-up.`,
                action: 'View Leads',
                path: '/admin/leads',
                gradient: 'from-purple-500 to-pink-500'
            });
        }

        // Suggest inventory update
        if (packages.length < 5) {
            suggestions.push({
                id: 'add-packages',
                icon: 'add_box',
                title: 'Expand Your Offerings',
                desc: 'Add more packages to give customers more choices and boost bookings.',
                action: 'Create Package',
                path: '/admin/itinerary-builder',
                gradient: 'from-emerald-500 to-teal-500'
            });
        }

        // Seasonal tip
        const month = new Date().getMonth();
        if (month >= 9 || month <= 1) { // Oct - Feb is peak season in India
            suggestions.push({
                id: 'peak-season',
                icon: 'trending_up',
                title: 'Peak Season Alert',
                desc: 'Tourist season is here! Make sure your inventory is updated and pricing is competitive.',
                action: 'Review Inventory',
                path: '/admin/inventory',
                gradient: 'from-amber-500 to-orange-500'
            });
        }

        // Suggest adding master data if low
        if (masterDataStats.hotels < 3) {
            suggestions.push({
                id: 'add-hotels',
                icon: 'hotel',
                title: 'Expand Hotel Partners',
                desc: 'Add more hotels to your master data for faster itinerary building.',
                action: 'Add Hotels',
                path: '/admin/masters',
                gradient: 'from-blue-500 to-indigo-500'
            });
        }

        return suggestions.filter(s => !dismissedSuggestions.includes(s.id));
    }, [leads, packages, masterDataStats, dismissedSuggestions]);

    const dismissSuggestion = (id: string) => {
        setDismissedSuggestions(prev => [...prev, id]);
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">

            {/* 1. Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-[#1A202C] text-white shadow-2xl shadow-slate-900/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 opacity-90"></div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-100">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            System Online
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            {greeting}, Admin.
                        </h1>
                        <p className="text-lg text-indigo-100 font-medium leading-relaxed opacity-90">
                            Here's what's happening in your travel business today. You have <span className="text-white font-bold underline decoration-indigo-400 decoration-2 underline-offset-4">{pendingBookings} pending bookings</span> requiring action.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => navigate('/admin/itinerary-builder')} className="group flex items-center gap-3 px-6 py-4 bg-white text-slate-900 rounded-2xl font-bold shadow-xl shadow-white/10 hover:bg-indigo-50 transition-all active:scale-95">
                            <div className="size-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </div>
                            <span>Create Package</span>
                        </button>
                        <button onClick={() => navigate('/admin/bookings')} className="flex items-center gap-3 px-6 py-4 bg-white/10 text-white backdrop-blur-md border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95">
                            <span>Manage Bookings</span>
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Key Performance Indicators - Premium Gradient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: 'payments', gradient: 'from-emerald-500 to-teal-600', shadowColor: 'shadow-emerald-500/20', trend: thisWeekBookings > 0 ? `${thisWeekBookings} this week` : 'No bookings', trendUp: thisWeekBookings > 0 },
                    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: 'trending_up', gradient: 'from-blue-500 to-indigo-600', shadowColor: 'shadow-blue-500/20', trend: conversionRate > 20 ? 'Above avg' : 'Needs focus', trendUp: conversionRate > 20 },
                    { label: 'Pipeline Value', value: `₹${(totalLeadsValue / 100000).toFixed(1)}L`, icon: 'account_balance', gradient: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/20', trend: `${hotLeadsCount} hot leads`, trendUp: hotLeadsCount > 0 },
                    { label: 'Active Packages', value: activePackages, icon: 'travel_explore', gradient: 'from-orange-500 to-rose-500', shadowColor: 'shadow-orange-500/20', trend: `${masterDataStats.locations} destinations`, trendUp: null },
                ].map((kpi, idx) => (
                    <div key={idx} className="group relative bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden card-lift">
                        {/* Gradient Background Accent */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

                        <div className="relative p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`size-14 rounded-2xl bg-gradient-to-br ${kpi.gradient} text-white flex items-center justify-center shadow-xl ${kpi.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                    <span className="material-symbols-outlined text-2xl">{kpi.icon}</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 backdrop-blur-sm ${kpi.trendUp ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : kpi.trendUp === false ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400'}`}>
                                    {kpi.trendUp && <span className="material-symbols-outlined text-[12px]">arrow_upward</span>}
                                    {kpi.trendUp === false && <span className="material-symbols-outlined text-[12px]">priority_high</span>}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{kpi.label}</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smart Alerts Section - Modern Glassmorphism */}
            {smartAlerts.length > 0 && (
                <div className="space-y-3">
                    {smartAlerts.map((alert, idx) => (
                        <div key={idx} className={`group flex items-center justify-between p-5 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.01] ${alert.type === 'warning'
                            ? 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/30'
                            : alert.type === 'success'
                                ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/30'
                                : 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/30'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-xl flex items-center justify-center ${alert.type === 'warning'
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                    : alert.type === 'success'
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                        : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                                    }`}>
                                    <span className="material-symbols-outlined text-white text-[20px]">
                                        {alert.type === 'warning' ? 'priority_high' : alert.type === 'success' ? 'check' : 'info'}
                                    </span>
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{alert.message}</span>
                            </div>
                            <button
                                onClick={() => navigate(alert.path)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all btn-press shadow-lg ${alert.type === 'warning'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 hover:shadow-amber-500/40'
                                    : alert.type === 'success'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
                                    }`}
                            >
                                {alert.action}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Smart Suggestions - Proactive Recommendations */}
            {smartSuggestions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">auto_awesome</span>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Smart Suggestions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {smartSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="group relative bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 card-lift overflow-hidden">
                                {/* Gradient accent */}
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${suggestion.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />

                                {/* Dismiss button */}
                                <button
                                    onClick={() => dismissSuggestion(suggestion.id)}
                                    className="absolute top-3 right-3 p-1 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>

                                <div className="relative">
                                    <div className={`size-12 rounded-xl bg-gradient-to-br ${suggestion.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                                        <span className="material-symbols-outlined text-[24px]">{suggestion.icon}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{suggestion.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{suggestion.desc}</p>
                                    <button
                                        onClick={() => navigate(suggestion.path)}
                                        className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${suggestion.gradient} flex items-center gap-1 group/btn`}
                                    >
                                        {suggestion.action}
                                        <span className="material-symbols-outlined text-[16px] text-current opacity-70 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* 3. Main Chart & Table Area */}
                <div className="xl:col-span-2 flex flex-col gap-8">

                    {/* Revenue Chart Placeholder */}
                    <div className="bg-white dark:bg-[#151d29] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Overview</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">Monthly performance statistics</p>
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="This Year">This Year</option>
                                <option value="Last Year">Last Year</option>
                            </select>
                        </div>

                        {/* SVG Chart Visualization */}
                        <div className="relative h-[280px] w-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                {[0, 75, 150, 225, 300].map((y, i) => (
                                    <line key={i} x1="0" y1={300 - y} x2="1000" y2={300 - y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                                ))}
                                {/* Smooth Curve Data: Example */}
                                {selectedYear === 'This Year' ? (
                                    <>
                                        <path
                                            d="M0,250 C100,280 200,100 300,150 C400,200 500,80 600,120 C700,160 800,40 900,80 L1000,60"
                                            fill="none"
                                            stroke="#6366f1"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="drop-shadow-lg"
                                        />
                                        <path
                                            d="M0,250 C100,280 200,100 300,150 C400,200 500,80 600,120 C700,160 800,40 900,80 L1000,60 L1000,300 L0,300 Z"
                                            fill="url(#chartGradient)"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <path
                                            d="M0,220 C100,240 200,180 300,200 C400,220 500,140 600,160 C700,190 800,90 900,110 L1000,100"
                                            fill="none"
                                            stroke="#818cf8"
                                            strokeWidth="4"
                                            strokeLinecap="round" // Dashed line for last year comparison if overlaid, but here just swapping
                                            strokeDasharray="8 4"
                                            className="drop-shadow-lg opacity-60"
                                        />
                                        <path
                                            d="M0,220 C100,240 200,180 300,200 C400,220 500,140 600,160 C700,190 800,90 900,110 L1000,100 L1000,300 L0,300 Z"
                                            fill="url(#chartGradient)"
                                            opacity="0.3"
                                        />
                                    </>
                                )}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                    <span key={m}>{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings Table */}
                    <div className="bg-white dark:bg-[#151d29] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Bookings</h3>
                            <Link to="/admin/bookings" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                                View All <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_right_alt</span>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs font-black uppercase tracking-widest text-slate-400">
                                    <tr>
                                        <th className="px-8 py-5">Customer</th>
                                        <th className="px-8 py-5">Destination</th>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Amount</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {bookings.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => navigate('/admin/bookings')}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-black text-slate-500 dark:text-slate-300 text-xs shadow-sm">
                                                        {row.customer.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{row.customer}</p>
                                                        <p className="text-xs font-medium text-slate-500 font-mono mt-0.5">{row.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-medium text-slate-600 dark:text-slate-300">
                                                {row.title}
                                            </td>
                                            <td className="px-8 py-5 font-medium text-slate-500">
                                                {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">
                                                ₹{row.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${row.payment === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    row.payment === 'Deposit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}>
                                                    {row.payment}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 4. Right Sidebar (Widgets) */}
                <div className="flex flex-col gap-8">

                    {/* System Status Widget */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg">System Health</h3>
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Database', status: 'Healthy', val: '99%' },
                                    { label: 'API Latency', status: '24ms', val: 'Good' },
                                    { label: 'Storage', status: '45% Used', val: '120GB' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm font-medium text-slate-300">{item.label}</span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="bg-white dark:bg-[#151d29] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Activity Log</h3>
                        <div className="relative pl-4 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                            {recentActivities.length > 0 ? recentActivities.map((item, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-0 bg-white dark:bg-[#151d29] border-4 border-white dark:border-[#151d29] rounded-full z-10`}>
                                        <span className={`material-symbols-outlined text-[20px] ${item.color} bg-slate-50 dark:bg-slate-800 rounded-full p-1`}>{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">{item.displayTime}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 italic">No recent activity.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/admin/analytics')}
                            className="w-full mt-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            View Full History
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};