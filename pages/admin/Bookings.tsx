
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { BookingStatus, Booking, BookingType } from '../../types';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const Bookings: React.FC = () => {
    const { bookings, packages, addBooking, updateBooking, deleteBooking } = useData();
    const { currentUser } = useAuth();
    const location = useLocation();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        customer: '',
        email: '',
        phone: '',
        type: 'Tour' as BookingType,
        title: '',
        date: today,
        amount: '' as string | number,
        status: BookingStatus.PENDING,
        payment: 'Unpaid',
        packageId: '',
        guests: '2 Adults',
        details: ''
    });

    // Check for navigation state from Leads page
    useEffect(() => {
        if (location.state && location.state.prefill && !isModalOpen) {
            const prefill = location.state.prefill;
            setFormData(prev => ({
                ...prev,
                id: '', // Reset ID for new booking
                customer: prefill.customer || '',
                email: prefill.email || '',
                phone: prefill.phone || '',
                amount: prefill.amount || '',
                details: prefill.details || '',
                guests: prefill.guests || '2 Adults',
                type: 'Tour', // Defaulting to Tour for converted leads
                title: `Booking for ${prefill.customer}`,
                status: BookingStatus.PENDING
            }));
            setIsEditMode(false);
            setIsModalOpen(true);
            // Clean up location state to prevent re-triggering (optional but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Check for query params (e.g. from Dashboard)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const statusParam = searchParams.get('status');
        if (statusParam) {
            // Find matching status enum logic - simple string match for now
            // Assuming statusParam matches the enum values (Pending, Confirmed, etc.)
            setActiveTab(statusParam);
        }
    }, [location.search]);

    // --- Handlers ---

    const openCreateModal = () => {
        setIsEditMode(false);
        setFormData({
            id: '',
            customer: '',
            email: '',
            phone: '',
            type: 'Tour',
            title: '',
            date: today,
            amount: '',
            status: BookingStatus.PENDING,
            payment: 'Unpaid',
            packageId: '',
            guests: '2 Adults',
            details: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (booking: Booking) => {
        setIsEditMode(true);
        setFormData({
            id: booking.id,
            customer: booking.customer,
            email: booking.email,
            phone: booking.phone || '',
            type: booking.type,
            title: booking.title,
            date: booking.date,
            amount: booking.amount,
            status: booking.status,
            payment: booking.payment as string,
            packageId: booking.packageId || '',
            guests: booking.guests || '2 Adults',
            details: booking.details || ''
        });
        setIsModalOpen(true);
    };

    const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pkgId = e.target.value;
        const selectedPkg = packages.find(p => p.id === pkgId);
        setFormData(prev => ({
            ...prev,
            packageId: pkgId,
            title: selectedPkg ? selectedPkg.title : '',
            amount: selectedPkg ? selectedPkg.price : prev.amount
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const bookingData: Partial<Booking> = {
            type: formData.type,
            customer: formData.customer,
            email: formData.email,
            phone: formData.phone,
            packageId: formData.packageId,
            title: formData.title || `${formData.type} Booking`,
            date: formData.date,
            amount: Number(formData.amount) || 0,
            status: formData.status,
            payment: formData.payment as any,
            guests: formData.guests,
            details: formData.details
        };

        if (isEditMode && formData.id) {
            updateBooking(formData.id, bookingData);
        } else {
            const newBooking: Booking = {
                id: `#BK-${Math.floor(1000 + Math.random() * 9000)}`,
                ...bookingData as any // safely cast for new object
            };
            addBooking(newBooking);
        }

        setIsModalOpen(false);
    };

    const handleExport = () => {
        // Escape csv fields
        const escapeCsv = (str: string | number | undefined) => {
            if (str === undefined || str === null) return '';
            const stringValue = String(str);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const csvHeader = "ID,Customer,Email,Type,Title,Date,Amount,Status,Payment\n";
        const csvRows = filteredBookings.map(b =>
            `${escapeCsv(b.id)},${escapeCsv(b.customer)},${escapeCsv(b.email)},${escapeCsv(b.type)},${escapeCsv(b.title)},${escapeCsv(b.date)},${escapeCsv(b.amount)},${escapeCsv(b.status)},${escapeCsv(b.payment)}`
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + csvRows);

        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Actions Logic ---

    const handleCancelBooking = (id: string) => {
        if (confirm("Are you sure you want to cancel this booking? This action will set the status to 'Cancelled'.")) {
            updateBooking(id, { status: BookingStatus.CANCELLED });
        }
    };

    const handleProcessRefund = (id: string) => {
        if (confirm("Process refund for this booking? This will mark the payment as 'Refunded'.")) {
            updateBooking(id, { payment: 'Refunded' });
            setIsModalOpen(false); // Close modal if open
        }
    };

    const handleGenerateInvoice = (booking: Booking) => {
        const invoiceWindow = window.open('', '_blank');
        if (invoiceWindow) {
            const isPaid = booking.payment === 'Paid';
            const amountPaid = isPaid ? booking.amount : (booking.payment === 'Deposit' ? booking.amount * 0.3 : 0);
            const balanceDue = booking.amount - amountPaid;
            const invoiceDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            const dueDate = new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            invoiceWindow.document.write(`
            <html>
            <head>
                <title>Invoice ${booking.id}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                    body { font-family: 'Inter', sans-serif; background: #e5e7eb; padding: 40px 0; margin: 0; -webkit-print-color-adjust: exact; }
                    .invoice-container { max-width: 794px; min-height: 1123px; margin: 0 auto; background: white; padding: 50px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); box-sizing: border-box; }
                    
                    /* Header */
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #374151; }
                    .logo-section { display: flex; align-items: center; gap: 15px; }
                    .logo-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; }
                    .company-name { font-size: 22px; font-weight: 800; color: #374151; margin: 0; text-transform: uppercase; line-height: 1; }
                    .company-tagline { font-size: 11px; color: #6B7280; font-weight: 500; margin-top: 4px; }
                    
                    .invoice-details { text-align: right; }
                    .invoice-title { font-size: 36px; font-weight: 900; color: #111827; margin: 0 0 10px 0; letter-spacing: 0.5px; text-transform: uppercase; }
                    .detail-row { font-size: 12px; color: #111827; font-weight: 600; margin-bottom: 3px; }
                    .detail-row span { display: inline-block; min-width: 80px; text-align: right; color: #6B7280; font-weight: 500; margin-right: 10px; }

                    /* Addresses */
                    .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; padding-top: 10px; }
                    .addr-col { width: 45%; }
                    .addr-title { font-size: 11px; font-weight: 800; color: #111827; text-transform: uppercase; margin-bottom: 8px; }
                    .addr-name { font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 4px 0; }
                    .addr-text { font-size: 12px; color: #374151; line-height: 1.5; margin: 0; }
                    .contact-info { margin-top: 8px; font-size: 12px; color: #374151; font-weight: 500; }
                    .contact-item { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }

                    /* Service Summary */
                    .section-header { font-size: 11px; font-weight: 800; color: #374151; text-transform: uppercase; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { text-align: left; background: #E5E7EB; padding: 10px; font-size: 11px; font-weight: 700; color: #111827; border: 1px solid #D1D5DB; }
                    td { padding: 10px; border: 1px solid #E5E7EB; font-size: 12px; color: #1F2937; vertical-align: top; }
                    .text-right { text-align: right; }
                    .col-grey { background: #F9FAFB; }

                    /* Bottom Layout */
                    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    
                    /* Payment Details */
                    .payment-block { font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 15px; }
                    .payment-label { font-weight: 700; color: #111827; margin-bottom: 2px; font-size: 12px; }
                    .qr-section { display: flex; align-items: center; gap: 15px; margin-top: 15px; }
                    .qr-box { width: 70px; height: 70px; border: 1px solid #D1D5DB; display: flex; align-items: center; justify-content: center; }
                    
                    /* Financial Breakdown */
                    .breakdown-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    .breakdown-table td { border: none; padding: 6px 10px; }
                    .breakdown-table .row-total { background: #E5E7EB; font-weight: 700; }
                    .breakdown-table .row-final { background: #4B5563; color: white; font-weight: 700; font-size: 13px; }
                    .breakdown-table .row-final td { border: 1px solid #4B5563; }
                    
                    .amount-paid-text { color: #166534; font-weight: 700; text-align: right; margin-top: 8px; font-size: 13px; }
                    .amount-words { font-size: 11px; color: #4B5563; margin-top: 5px; font-style: italic; }

                    /* Terms */
                    .terms { border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 11px; color: #374151; }
                    .terms h4 { margin: 0 0 10px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; }
                    .terms ol { margin: 0; padding-left: 15px; line-height: 1.5; }
                    
                    /* Footer */
                    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 15px; }

                    @media print {
                        body { background: white; padding: 0; }
                        .invoice-container { box-shadow: none; padding: 40px; margin: 0; width: 100%; max-width: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <!-- Invoice content matching the previous update -->
                    <div class="header">
                        <div class="logo-section">
                            <div class="logo-icon">
                                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="25" cy="25" r="25" fill="#F3F4F6"/>
                                    <path d="M25 10L10 40H40L25 10Z" fill="#374151"/>
                                    <path d="M18 40L25 25L32 40H18Z" fill="#9CA3AF"/>
                                </svg>
                            </div>
                            <div>
                                <h1 class="company-name">Shravya Tours</h1>
                                <p class="company-tagline">Your Dream Destination</p>
                            </div>
                        </div>
                        <div class="invoice-details">
                            <h2 class="invoice-title">INVOICE</h2>
                            <div class="detail-row"><span>Invoice No:</span> ${booking.id.replace('#', '')}</div>
                            <div class="detail-row"><span>Invoice Date:</span> ${invoiceDate}</div>
                            <div class="detail-row"><span>Due Date:</span> ${dueDate}</div>
                        </div>
                    </div>

                    <div class="addresses">
                        <div class="addr-col">
                            <div class="addr-title">BILLED FROM</div>
                            <h3 class="addr-name">Shravya Tours</h3>
                            <p class="addr-text">Pimpri Chinchwad, Pune<br>Maharashtra, India - 411062</p>
                            <div class="contact-info">
                                <div class="contact-item">✉ shravyatours23@gmail.com</div>
                                <div class="contact-item">📞 +91 80109 55675</div>
                            </div>
                        </div>
                        <div class="addr-col">
                            <div class="addr-title">BILLED TO</div>
                            <h3 class="addr-name">${booking.customer}</h3>
                            <p class="addr-text">${booking.email}<br>${booking.phone || ''}</p>
                        </div>
                    </div>

                    <div>
                        <div class="section-header">SERVICE SUMMARY</div>
                        <table>
                            <thead>
                                <tr>
                                    <th width="40%">Item Description</th>
                                    <th>Duration</th>
                                    <th>Service Dates</th>
                                    <th class="text-right">Rate</th>
                                    <th class="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="col-grey">
                                        <strong>${booking.title}</strong><br>
                                        <span style="color: #6B7280; font-size: 10px;">${booking.type} Package</span>
                                    </td>
                                    <td>${Math.floor(Math.random() * 4) + 2} Days</td>
                                    <td>${dueDate}</td>
                                    <td class="text-right">₹${booking.amount.toLocaleString()}.00</td>
                                    <td class="text-right col-grey"><strong>₹${booking.amount.toLocaleString()}.00</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-right" style="border:none; padding-top:5px; font-weight:700; font-size:11px;">Subtotal</td>
                                    <td class="text-right" style="border:none; padding-top:5px; font-weight:700; font-size:11px;">₹${booking.amount.toLocaleString()}.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bottom-grid">
                        <div>
                            <div class="section-header">PAYMENT DETAILS</div>
                            <div class="payment-block">
                                <div class="payment-label">Bank Transfer</div>
                                Bank: Federal Bank<br>Account Name: Shravya Tours and Travels<br>Account Type: Current<br>Account No: 14960200014487<br>IFSC: FDRL0001496
                            </div>
                            <div class="payment-block">
                                <div class="payment-label">UPI Payment</div>
                                UPI ID: shravyatours23@okicici
                            </div>
                            <div class="qr-section">
                                <div class="qr-box">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=upi://pay?pa=shravyatours23@okicici&pn=ShravyaTours" alt="QR" width="60" height="60"/>
                                </div>
                                <div style="font-size: 10px; color: #4B5563; line-height: 1.2;">Scan to pay<br>via UPI</div>
                            </div>
                        </div>
                        <div>
                            <div class="section-header">FINANCIAL BREAKDOWN</div>
                            <table class="breakdown-table">
                                <tr><td>Base Package Total</td><td class="text-right">₹${booking.amount.toLocaleString()}.00</td></tr>
                                <tr><td>(+) Toll/Parking charges</td><td class="text-right">₹0.00</td></tr>
                                <tr class="row-total"><td>Gross Total</td><td class="text-right">₹${booking.amount.toLocaleString()}.00</td></tr>
                                <tr><td>(-) Diesel Paid by Customer</td><td class="text-right">(₹0.00)</td></tr>
                                <tr><td>(-) Advance Received</td><td class="text-right">(₹${amountPaid.toLocaleString()}.00)</td></tr>
                                <tr class="row-final"><td>TOTAL DUE (INR)</td><td class="text-right">₹${balanceDue.toLocaleString()}.00</td></tr>
                            </table>
                            <div class="amount-words">Total in words: (System generated approximate)</div>
                            <div class="amount-paid-text">Amount Paid: ₹${amountPaid.toLocaleString()}.00</div>
                        </div>
                    </div>

                    <div class="terms">
                        <h4>TERMS & CONDITIONS</h4>
                        <ol>
                            <li>Please pay within 3 days from the date of invoice. Overdue interest @ 14% will be charged on delayed payments.</li>
                            <li>Additional 5% charges applicable for Credit card payments.</li>
                            <li>Additional ₹1200/- charges if trip ends after 11:45 PM.</li>
                        </ol>
                    </div>

                    <div class="footer">
                        This is a system-generated invoice. Thank you for choosing Shravya Tours!<br>
                        For enquiries: shravyatours23@gmail.com | +91 80109 55675
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
          `);
            invoiceWindow.document.close();
        }
    };

    // --- Filters ---

    const filteredBookings = bookings.filter(b => {
        const matchesTab = activeTab === 'All' || b.status === activeTab;
        const matchesSearch = b.customer.toLowerCase().includes(search.toLowerCase()) ||
            b.id.toLowerCase().includes(search.toLowerCase()) ||
            b.title.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // --- Helpers ---

    const getStatusColor = (status: string) => {
        switch (status) {
            case BookingStatus.CONFIRMED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case BookingStatus.CANCELLED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case BookingStatus.COMPLETED: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Car': return 'directions_car';
            case 'Bus': return 'directions_bus';
            case 'Hotel': return 'hotel';
            case 'Tour': return 'travel_explore';
            default: return 'confirmation_number';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#1A2633] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditMode ? 'Edit Booking' : 'Create New Booking'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                            {/* Customer Details */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Full Name</label>
                                        <input required value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Email Address</label>
                                        <input required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Phone</label>
                                        <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} type="tel" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Guests</label>
                                        <input value={formData.guests} onChange={e => setFormData({ ...formData, guests: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 2 Adults, 1 Child" />
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Service Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Booking Type</label>
                                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as BookingType, packageId: '', title: '' })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value="Tour">Tour Package</option>
                                            <option value="Hotel">Hotel Stay</option>
                                            <option value="Car">Car Rental</option>
                                            <option value="Bus">Bus Ticket</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">{formData.type === 'Tour' ? 'Select Package' : 'Service Title'}</label>
                                        {formData.type === 'Tour' ? (
                                            <select value={formData.packageId} onChange={handlePackageChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                                <option value="" disabled>Select a package</option>
                                                {packages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                        ) : (
                                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Innova Rental" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Travel Date</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Total Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none ${isEditMode && currentUser?.userType !== 'Admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            disabled={isEditMode && currentUser?.userType !== 'Admin'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status & Payment */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Status & Payment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Booking Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as BookingStatus })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value={BookingStatus.PENDING}>Pending</option>
                                            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                                            <option value={BookingStatus.COMPLETED}>Completed</option>
                                            <option value={BookingStatus.CANCELLED}>Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Payment Status</label>
                                        <select value={formData.payment} onChange={e => setFormData({ ...formData, payment: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Deposit">Deposit Paid</option>
                                            <option value="Paid">Fully Paid</option>
                                            <option value="Refunded">Refunded</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Internal Notes</label>
                                    <textarea value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none h-20 resize-none" placeholder="Add specific requirements or notes..." />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                {/* New Refund Button in Modal */}
                                {currentUser?.userType === 'Admin' && formData.status === BookingStatus.CANCELLED && (formData.payment === 'Paid' || formData.payment === 'Deposit') ? (
                                    <button type="button" onClick={() => handleProcessRefund(formData.id)} className="px-6 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">currency_exchange</span> Process Refund
                                    </button>
                                ) : <div></div>}

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors">{isEditMode ? 'Save Changes' : 'Create Booking'}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Header */}
            <div className="px-4 md:px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2633]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Booking Management</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Track reservations, manage payments, and assign services.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleExport} className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-white">
                            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
                        </button>
                        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">add</span> New Booking
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                        {['All', BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-white dark:bg-[#1A2633] text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab === 'All' ? 'All Bookings' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search by ID, Name or Title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary/50 dark:text-white placeholder:text-slate-400 outline-none"
                            />
                        </div>
                        <div className="flex bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 rounded-xl p-1 shrink-0">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">table_rows</span>
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-slate-100 dark:bg-slate-700 text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">view_kanban</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">

                {/* LIST VIEW */}
                {viewMode === 'list' && (
                    <div className="h-full overflow-y-auto p-4 md:p-8">
                        <div className="bg-white dark:bg-[#1A2633] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID & Type</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking) => (
                                                <tr key={booking.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold font-mono text-primary">{booking.id}</span>
                                                            <div className="flex items-center gap-1 text-slate-500 mt-1">
                                                                <span className="material-symbols-outlined text-[14px]">{getTypeIcon(booking.type)}</span>
                                                                <span className="text-[10px] font-bold uppercase">{booking.type}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                                                {booking.customer.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.customer}</p>
                                                                <p className="text-xs text-slate-500">{booking.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[180px] truncate">{booking.title}</p>
                                                        <p className="text-xs text-slate-500">{booking.guests}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{booking.date}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">₹{booking.amount.toLocaleString()}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit font-bold uppercase ${booking.payment === 'Paid' ? 'bg-green-100 text-green-700' : booking.payment === 'Deposit' ? 'bg-blue-100 text-blue-700' : booking.payment === 'Refunded' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {booking.payment}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                                            <span className="size-1.5 rounded-full bg-current"></span>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleGenerateInvoice(booking)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Invoice">
                                                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                            </button>
                                                            <button onClick={() => openEditModal(booking)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>

                                                            {/* Logic for Refund Button */}
                                                            {booking.status === BookingStatus.CANCELLED && (booking.payment === 'Paid' || booking.payment === 'Deposit') && (
                                                                <button onClick={() => handleProcessRefund(booking.id)} className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Refund">
                                                                    <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                                                                </button>
                                                            )}

                                                            {/* Logic for Cancel Button */}
                                                            {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) && (
                                                                <button onClick={() => handleCancelBooking(booking.id)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Cancel Booking">
                                                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                                </button>
                                                            )}

                                                            <button onClick={() => deleteBooking(booking.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                                    <span className="material-symbols-outlined text-4xl opacity-20 mb-2">search_off</span>
                                                    <p>No bookings found matching your criteria.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* KANBAN BOARD VIEW */}
                {viewMode === 'board' && (
                    <div className="h-full overflow-x-auto overflow-y-hidden p-4 md:p-8">
                        <div className="flex h-full gap-6 min-w-[1000px]">
                            {[BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED].map(status => {
                                const statusBookings = filteredBookings.filter(b => b.status === status);
                                const columnColor = status === BookingStatus.CONFIRMED ? 'border-green-500' : status === BookingStatus.PENDING ? 'border-yellow-500' : status === BookingStatus.CANCELLED ? 'border-red-500' : 'border-blue-500';

                                return (
                                    <div key={status} className="flex-1 flex flex-col min-w-[280px] h-full bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <div className={`p-4 border-t-4 rounded-t-2xl ${columnColor} bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800`}>
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{status}</h3>
                                                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">{statusBookings.length}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                            {statusBookings.map(booking => (
                                                <div
                                                    key={booking.id}
                                                    onClick={() => openEditModal(booking)}
                                                    className="bg-white dark:bg-[#1A2633] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-mono font-bold text-slate-400">{booking.id}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${booking.payment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{booking.payment}</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{booking.customer}</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-1 mb-3">{booking.title}</p>
                                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                        <span className="font-bold text-slate-900 dark:text-white">₹{(booking.amount / 1000).toFixed(1)}k</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {statusBookings.length === 0 && (
                                                <div className="text-center py-10 text-slate-400 text-xs italic">No bookings</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
