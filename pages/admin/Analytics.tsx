import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Booking, SupplierBooking } from '../../types';
import {
   BarChart, TrendingUp, TrendingDown, DollarSign,
   PieChart, CreditCard, Calendar, Filter, Download
} from 'lucide-react';

export const Analytics: React.FC = () => {
   const { bookings, vendors } = useData();
   const [timeRange, setTimeRange] = useState<'all' | '30days' | 'thisMonth' | 'thisYear'>('all');

   // --- Data Processing ---
   const filteredBookings = useMemo(() => {
      const now = new Date();
      return bookings.filter(b => {
         if (b.status === 'Cancelled') return false; // Exclude cancelled usually
         // Apply Date Filter logic here if needed
         return true;
      });
   }, [bookings, timeRange]);

   const metrics = useMemo(() => {
      let totalRevenue = 0; // Total Customer Price
      let totalReceived = 0; // Actual Money In
      let totalCost = 0;    // Total Supplier Cost
      let totalPaidOut = 0; // Actual Money Out

      let pendingCollections = 0;
      let pendingPayables = 0;

      const categoryExpenses: Record<string, number> = {};

      filteredBookings.forEach(booking => {
         // Customer Side
         totalRevenue += booking.amount;

         const received = (booking.transactions || [])
            .filter(t => t.type === 'Payment')
            .reduce((sum, t) => sum + t.amount, 0);

         const refunded = (booking.transactions || [])
            .filter(t => t.type === 'Refund')
            .reduce((sum, t) => sum + t.amount, 0);

         totalReceived += (received - refunded);
         pendingCollections += (booking.amount - (received - refunded));

         // Supplier Side
         (booking.supplierBookings || []).forEach(sb => {
            totalCost += sb.cost;
            totalPaidOut += sb.paidAmount;
            pendingPayables += (sb.cost - sb.paidAmount);

            // Expense Categorization (MIS)
            const cat = sb.serviceType || 'Other';
            categoryExpenses[cat] = (categoryExpenses[cat] || 0) + sb.cost;
         });
      });

      const netProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const cashFlow = totalReceived - totalPaidOut;

      return {
         totalRevenue,
         totalReceived,
         totalCost,
         totalPaidOut,
         pendingCollections,
         pendingPayables,
         netProfit,
         profitMargin,
         cashFlow,
         categoryExpenses
      };
   }, [filteredBookings]);

   // Format Currency
   const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

   return (
      <div className="flex flex-col h-full admin-page-bg">
         {/* Header */}
         <div className="bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
            <div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart className="text-primary" /> Financial Reports
               </h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm">Profit & Loss, Cash Flow, and Expense Breakdown</p>
            </div>
            <div className="flex items-center gap-3">
               <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm rounded-lg px-4 py-2.5 font-bold shadow-sm focus:ring-2 focus:ring-primary outline-none"
               >
                  <option value="all">All Time</option>
                  <option value="thisMonth">This Month</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="thisYear">This Year</option>
               </select>
               <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-sm px-4 py-2.5 shadow-lg active:scale-95 transition-all btn-glow">
                  <Download size={18} /> Export Report
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* 1. Profit & Loss Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-cards">
               {/* Revenue Card */}
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <TrendingUp size={64} className="text-emerald-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
                  <h3 className="text-4xl kpi-number text-slate-900 dark:text-white mt-2">{fmt(metrics.totalRevenue)}</h3>
                  <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1">
                     <span className="bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Sales</span>
                     from {filteredBookings.length} bookings
                  </p>
               </div>

               {/* Cost Card */}
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <TrendingDown size={64} className="text-red-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Expenses</p>
                  <h3 className="text-4xl kpi-number text-slate-900 dark:text-white mt-2">{fmt(metrics.totalCost)}</h3>
                  <p className="text-red-400 text-xs font-bold mt-2 flex items-center gap-1">
                     <span className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">COGS</span>
                     Paid to Vendors
                  </p>
               </div>

               {/* Net Profit Card */}
               <div className="card-brand-gradient p-6 rounded-2xl shadow-lg shadow-primary/25 relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <DollarSign size={64} />
                  </div>
                  <p className="text-orange-100 text-sm font-bold uppercase tracking-wider">Net Profit</p>
                  <h3 className="text-4xl kpi-number mt-2">{fmt(metrics.netProfit)}</h3>
                  <div className="flex items-center gap-3 mt-3">
                     <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">
                        {metrics.profitMargin.toFixed(1)}% Margin
                     </span>
                  </div>
               </div>

               {/* Cash Flow Card */}
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <CreditCard size={64} className="text-blue-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Net Cash Flow</p>
                  <h3 className={`text-4xl kpi-number mt-2 ${metrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                     {metrics.cashFlow >= 0 ? '+' : ''}{fmt(metrics.cashFlow)}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-2">
                     (Received - Paid Out)
                  </p>
               </div>
            </div>

            {/* 2. Outstanding Balance Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 section-heading-accent">
                     <Calendar size={20} className="text-primary" /> Receivables & Payables
                  </h4>

                  <div className="space-y-6">
                     {/* Receivables */}
                     <div>
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-bold text-slate-500">Pending from Customers</span>
                           <span className="text-lg kpi-number text-orange-500">{fmt(metrics.pendingCollections)}</span>
                        </div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-orange-400 rounded-full progress-bar-animated"
                              style={{ width: `${Math.min((metrics.pendingCollections / metrics.totalRevenue) * 100, 100)}%` }}
                           />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-right">{((metrics.pendingCollections / metrics.totalRevenue) * 100 || 0).toFixed(1)}% of Revenue uncollected</p>
                     </div>

                     {/* Payables */}
                     <div>
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-sm font-bold text-slate-500">Pending to Vendors</span>
                           <span className="text-lg kpi-number text-blue-500">{fmt(metrics.pendingPayables)}</span>
                        </div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-blue-400 rounded-full progress-bar-animated"
                              style={{ width: `${Math.min((metrics.pendingPayables / metrics.totalCost) * 100, 100)}%` }}
                           />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-right">{((metrics.pendingPayables / metrics.totalCost) * 100 || 0).toFixed(1)}% of Cost unpaid</p>
                     </div>
                  </div>
               </div>

               {/* Expense Breakdown (MIS) */}
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 section-heading-accent">
                     <PieChart size={20} className="text-primary" /> Expense Breakdown (MIS)
                  </h4>

                  <div className="space-y-4">
                     {Object.entries(metrics.categoryExpenses as Record<string, number>)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, amount], idx) => (
                           <div key={cat} className="group">
                              <div className="flex justify-between items-center mb-1 text-sm">
                                 <span className="font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                                 <span className="kpi-number text-slate-900 dark:text-white">{fmt(amount)}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div
                                    className={`h-full rounded-full ${['bg-purple-500', 'bg-sky-500', 'bg-pink-500', 'bg-amber-500'][idx % 4]}`}
                                    style={{ width: `${(amount / metrics.totalCost) * 100}%` }}
                                 />
                              </div>
                           </div>
                        ))}
                     {Object.keys(metrics.categoryExpenses).length === 0 && (
                        <p className="text-slate-400 text-sm italic text-center py-10">No expense data available yet.</p>
                     )}
                  </div>
               </div>
            </div>

            {/* 3. Trip Profitability Table */}
            <div className="bg-white dark:bg-[#1A2633] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
               <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 section-heading-accent">
                     <Filter size={20} className="text-primary" /> Trip Profitability
                  </h4>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                           <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Customer</th>
                           <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Trip</th>
                           <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Revenue</th>
                           <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Cost</th>
                           <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Profit</th>
                           <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Margin</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredBookings.map(booking => {
                           const revenue = booking.amount;
                           const cost = (booking.supplierBookings || []).reduce((sum, sb) => sum + sb.cost, 0);
                           const profit = revenue - cost;
                           const margin = revenue ? (profit / revenue) * 100 : 0;

                           return (
                              <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{booking.customer}</td>
                                 <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{booking.title}</td>
                                 <td className="px-6 py-4 text-right kpi-number text-emerald-600">{fmt(revenue)}</td>
                                 <td className="px-6 py-4 text-right kpi-number text-red-500">{fmt(cost)}</td>
                                 <td className={`px-6 py-4 text-right kpi-number ${profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                    {fmt(profit)}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${margin >= 15 ? 'bg-green-100 text-green-700' : margin >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                       {margin.toFixed(1)}%
                                    </span>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>
      </div>
   );
};