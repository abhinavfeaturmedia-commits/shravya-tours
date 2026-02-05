import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    Map, Calendar, Users, Briefcase, CheckCircle,
    XCircle, Clock, AlertTriangle, Phone, MoreHorizontal
} from 'lucide-react';
import { Booking } from '../../types';

export const Operations: React.FC = () => {
    const { bookings } = useData();
    const [activeTab, setActiveTab] = useState<'Tours' | 'Attendance'>('Tours');

    // --- Tour Operations Logic ---
    const tourStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const live: Booking[] = [];
        const upcoming: Booking[] = [];
        const completed: Booking[] = [];

        bookings.forEach(b => {
            // For simplicity, assuming b.date is the start date
            // In real app, we'd use b.startDate and b.endDate if available
            // But Booking type currently has 'date' string (YYYY-MM-DD usually)
            // Let's assume duration is ~5 days if not specified for this mock logic
            const start = new Date(b.date);
            const end = new Date(start);
            end.setDate(start.getDate() + 5);

            if (start <= today && end >= today && b.status === 'Confirmed') {
                live.push(b);
            } else if (start > today && start <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) && b.status === 'Confirmed') {
                upcoming.push(b);
            } else if (end < today && b.status === 'Completed') {
                completed.push(b);
            }
        });

        return { live, upcoming, completed };
    }, [bookings]);


    // --- Attendance Logic (Mock) ---
    const [staffList, setStaffList] = useState([
        { id: 1, name: 'Abhinav Sharma', role: 'Owner', status: 'Present', checkIn: '09:30 AM', location: 'Office' },
        { id: 2, name: 'Sanya Gupta', role: 'Sales Manager', status: 'Present', checkIn: '09:45 AM', location: 'Office' },
        { id: 3, name: 'Rohan Mehta', role: 'Field Agent', status: 'On Field', checkIn: '08:00 AM', location: 'Mumbai Airport' },
        { id: 4, name: 'Priya Singh', role: 'Operations', status: 'Remote', checkIn: '10:00 AM', location: 'Home' },
        { id: 5, name: 'Karan Patel', role: 'Accounts', status: 'Absent', checkIn: '-', location: '-' },
    ]);

    const handleStatusChange = (id: number, newStatus: string) => {
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0B1116]">
            {/* Header */}
            <div className="bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="text-blue-600" /> Operations Center
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor live tours and manage staff availability.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('Tours')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Tours' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tour Ops
                    </button>
                    <button
                        onClick={() => setActiveTab('Attendance')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Attendance' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Staff Attendance
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

                {/* --- TOURS TAB --- */}
                {activeTab === 'Tours' && (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Live Tours Section */}
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Live Tours ({tourStats.live.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tourStats.live.length > 0 ? tourStats.live.map(tour => (
                                    <div key={tour.id} className="bg-white dark:bg-[#1A2633] p-5 rounded-2xl border border-green-200 dark:border-green-900/30 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                            <Map size={80} className="text-green-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">On Tour</span>
                                                <span className="text-slate-400 text-xs font-mono">{tour.id}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{tour.customer}</h4>
                                            <p className="text-sm text-slate-500 font-medium mb-4">{tour.title}</p>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    <Calendar size={14} /> Since {new Date(tour.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    <Users size={14} /> {tour.pax} Guests
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    <Phone size={14} /> {tour.phone}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                                <button className="flex-1 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-100">WhatsApp Group</button>
                                                <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-100">View Itinerary</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 py-10 text-center bg-white dark:bg-[#1A2633] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <p className="text-slate-400 font-medium">No live tours at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Tours Section */}
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar className="text-blue-500" size={20} />
                                Upcoming Arrivals (Next 7 Days)
                            </h3>
                            <div className="bg-white dark:bg-[#1A2633] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4">Start Date</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Package</th>
                                            <th className="px-6 py-4">Guests</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {tourStats.upcoming.map(tour => (
                                            <tr key={tour.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4 font-bold text-blue-600">
                                                    {new Date(tour.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{tour.customer}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{tour.title}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{tour.pax} Pax</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-700 font-bold text-xs">Preparations</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {tourStats.upcoming.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No active upcoming tours in next 7 days.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}


                {/* --- ATTENDANCE TAB --- */}
                {activeTab === 'Attendance' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white dark:bg-[#1A2633] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Daily Attendance</h3>
                                    <p className="text-xs text-slate-500 font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div> 3 Present
                                    </div>
                                    <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div> 1 Remote
                                    </div>
                                    <div className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div> 1 Absent
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Check-In</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {staffList.map(emp => (
                                        <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'][emp.id % 5]}`}>
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    {emp.name}
                                                </div>
                                                <div className="text-xs text-slate-500 pl-10">{emp.role}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={emp.status}
                                                    onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none outline-none cursor-pointer
                                                        ${emp.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                            emp.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                                emp.status === 'On Field' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'}`}
                                                >
                                                    <option value="Present">Present</option>
                                                    <option value="Absent">Absent</option>
                                                    <option value="On Field">On Field</option>
                                                    <option value="Remote">Remote</option>
                                                    <option value="On Leave">On Leave</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                                                {emp.checkIn}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    {emp.status === 'On Field' && <Map size={14} className="text-blue-500" />}
                                                    {emp.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                                Download Attendance Report
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
