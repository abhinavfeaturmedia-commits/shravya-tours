import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Map, Calendar, Users, Briefcase, CheckCircle,
    XCircle, Clock, AlertTriangle, Phone, MoreHorizontal,
    Car, Plus, Save
} from 'lucide-react';
import { Booking, SupplierBooking } from '../../types';
import { toast } from 'sonner';

export const Operations: React.FC = () => {
    const { bookings, packages, vendors, addSupplierBooking } = useData();
    const { staff, updateStaff, currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'Tours' | 'Attendance'>('Tours');

    // --- Tour Operations Logic ---
    const tourStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const live: (Booking & { paxCount: number, duration: number, endDate: Date })[] = [];
        const upcoming: (Booking & { paxCount: number })[] = [];
        const completed: Booking[] = [];

        bookings.forEach(b => {
            // Robust Date Parsing
            const dateParts = b.date ? b.date.split('-') : null;
            if (!dateParts || dateParts.length < 3) return;

            const start = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            start.setHours(0, 0, 0, 0);

            // Dynamic Duration from Package
            const pkg = packages.find(p => p.id === b.packageId) || packages.find(p => p.title === b.title);
            const duration = pkg?.days || 1; // Default to 1 day if unknown

            const end = new Date(start);
            end.setDate(start.getDate() + (duration - 1));
            end.setHours(23, 59, 59, 999);

            // Parse Pax Count
            let paxCount = 0;
            if (b.guests) {
                const numbers = b.guests.match(/\d+/g);
                if (numbers) {
                    paxCount = numbers.reduce((acc, num) => acc + parseInt(num), 0);
                }
            }
            if (paxCount === 0) paxCount = 1; // Fallback

            if (start <= today && end >= today && b.status === 'Confirmed') {
                live.push({ ...b, paxCount, duration, endDate: end });
            } else if (start > today && start <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) && b.status === 'Confirmed') {
                upcoming.push({ ...b, paxCount });
            } else if (end < today && b.status === 'Completed') {
                completed.push(b);
            }
        });

        // Sorting
        live.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return { live, upcoming, completed };
    }, [bookings, packages]);


    // --- Attendance Logic ---
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const updates: any = { attendanceStatus: newStatus as any };

            // Auto-set check-in time if marking as Present and not already set
            const targetStaff = staff.find(s => s.id === id);
            if (newStatus === 'Present' && !targetStaff?.checkInTime) {
                updates.checkInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            }
            // Clear check-in if Absent
            if (newStatus === 'Absent') {
                updates.checkInTime = '-';
            }

            await updateStaff(id, updates);
            toast.success("Attendance updated");
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleLocationChange = async (id: number, newLocation: string) => {
        try {
            await updateStaff(id, { currentLocation: newLocation });
            // toast.success("Location updated"); // Too noisy
        } catch (e) {
            console.error("Failed to update location");
        }
    };


    // --- Preparation / Assignment Modal ---
    const [selectedBookingForPrep, setSelectedBookingForPrep] = useState<Booking | null>(null);
    const [prepModalOpen, setPrepModalOpen] = useState(false);
    const [driverVendorId, setDriverVendorId] = useState('');
    const [driverCost, setDriverCost] = useState('');

    const openPrepModal = (booking: Booking) => {
        setSelectedBookingForPrep(booking);
        setDriverVendorId('');
        setDriverCost('');
        setPrepModalOpen(true);
    };

    const handleAssignDriver = () => {
        if (!selectedBookingForPrep || !driverVendorId) return;

        const newSupplierBooking: SupplierBooking = {
            id: `SB-${Date.now()}`,
            bookingId: selectedBookingForPrep.id,
            vendorId: driverVendorId,
            serviceType: 'Transport',
            cost: parseFloat(driverCost) || 0,
            paidAmount: 0,
            paymentStatus: 'Unpaid',
            bookingStatus: 'Confirmed',
            notes: 'Assigned via Operations Console'
        };

        addSupplierBooking(selectedBookingForPrep.id, newSupplierBooking);
        toast.success("Driver assigned successfully");
        setPrepModalOpen(false);
    };

    // Filter vendors for Transport
    const transportVendors = useMemo(() =>
        vendors.filter(v => v.category === 'Transport' || v.category === 'Guide'),
        [vendors]);

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
                                {tourStats.live.map(tour => {
                                    // Find Assigned Driver if any
                                    const assignedTransport = tour.supplierBookings?.find(sb => sb.serviceType === 'Transport');
                                    const driverName = assignedTransport ? vendors.find(v => v.id === assignedTransport.vendorId)?.name : 'Not Assigned';

                                    return (
                                        <div key={tour.id} className="bg-white dark:bg-[#1A2633] p-5 rounded-2xl border border-green-200 dark:border-green-900/30 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                <Map size={80} className="text-green-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">On Tour</span>
                                                    <span className="text-slate-400 text-xs font-mono">{tour.invoiceNo || tour.id}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate" title={tour.customer}>{tour.customer}</h4>
                                                <p className="text-sm text-slate-500 font-medium mb-4 truncate" title={tour.title}>{tour.title}</p>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        <Calendar size={14} />
                                                        Day {Math.ceil((new Date().getTime() - new Date(tour.date).getTime()) / (1000 * 60 * 60 * 24)) + 1} of {tour.duration}
                                                        <span className="text-slate-400 font-normal ml-1">
                                                            (Ends {tour.endDate.toLocaleDateString()})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        <Users size={14} /> {tour.paxCount} Guests
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        <Car size={14} /> {driverName}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                                    <button
                                                        onClick={() => window.open(`https://wa.me/${tour.phone?.replace(/\D/g, '')}`, '_blank')}
                                                        className="flex-1 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                                    >
                                                        WhatsApp Group
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/bookings?search=${tour.id}`)}
                                                        className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {tourStats.live.length === 0 && (
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
                                            <th className="px-6 py-4">Assignment</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {tourStats.upcoming.map(tour => {
                                            const assignedTransport = tour.supplierBookings?.find(sb => sb.serviceType === 'Transport');
                                            const driverName = assignedTransport ? vendors.find(v => v.id === assignedTransport.vendorId)?.name : null;

                                            return (
                                                <tr key={tour.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-6 py-4 font-bold text-blue-600">
                                                        {new Date(tour.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        {tour.customer}
                                                        <div className='text-[10px] text-slate-400 font-normal'>{tour.paxCount} Pax</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{tour.title}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {driverName ? (
                                                            <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                                                <CheckCircle size={12} /> {driverName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-500 flex items-center gap-1 text-xs font-medium">
                                                                <AlertTriangle size={12} /> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => openPrepModal(tour)}
                                                            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                                                        >
                                                            {driverName ? 'Manage' : 'Assign Driver'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
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
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div> {staff.filter(s => s.attendanceStatus === 'Present').length} Present
                                    </div>
                                    <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div> {staff.filter(s => s.attendanceStatus === 'Remote' || s.attendanceStatus === 'On Field').length} Remote/Field
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Check-In</th>
                                        <th className="px-6 py-4">Current Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {staff.map((emp, idx) => (
                                        <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <div className={`size-8 rounded-full flex items-center justify-center text-xs text-white font-bold bg-${emp.color}-500`}>
                                                        {emp.initials}
                                                    </div>
                                                    {emp.name}
                                                    {emp.id === currentUser?.id && (
                                                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded ml-1">YOU</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 pl-10 capitalize">{emp.role}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={emp.attendanceStatus || 'Absent'}
                                                    onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none outline-none cursor-pointer
                                                        ${emp.attendanceStatus === 'Present' ? 'bg-green-100 text-green-700' :
                                                            emp.attendanceStatus === 'Absent' || !emp.attendanceStatus ? 'bg-red-100 text-red-700' :
                                                                emp.attendanceStatus === 'On Field' ? 'bg-blue-100 text-blue-700' :
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
                                                {emp.checkInTime || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    {emp.attendanceStatus === 'On Field' && <Map size={14} className="text-blue-500" />}
                                                    <input
                                                        type="text"
                                                        defaultValue={emp.currentLocation || (emp.attendanceStatus === 'Present' ? 'Office' : '')}
                                                        onBlur={(e) => handleLocationChange(emp.id, e.target.value)}
                                                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-32 transition-colors text-xs"
                                                        placeholder="Set Location..."
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* --- PREP MODAL --- */}
            {prepModalOpen && selectedBookingForPrep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1A2633] rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                        <button
                            onClick={() => setPrepModalOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                        >
                            <XCircle size={20} className="text-slate-400" />
                        </button>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Assign Transport</h3>
                        <p className="text-sm text-slate-500 mb-6">Assign a driver or vehicle for {selectedBookingForPrep.customer}.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Driver / Agency</label>
                                <select
                                    value={driverVendorId}
                                    onChange={(e) => setDriverVendorId(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                >
                                    <option value="">-- Select Vendor --</option>
                                    {transportVendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
                                    ))}
                                </select>
                                {transportVendors.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">No Transport vendors found. Add one in Vendors tab.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Cost</label>
                                <input
                                    type="number"
                                    value={driverCost}
                                    onChange={(e) => setDriverCost(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 ring-blue-500/20"
                                />
                            </div>

                            <button
                                onClick={handleAssignDriver}
                                disabled={!driverVendorId}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

