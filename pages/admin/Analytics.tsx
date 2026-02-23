import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Booking, SupplierBooking } from '../../types';
import {
   BarChart, TrendingUp, TrendingDown, DollarSign,
   PieChart, CreditCard, Calendar, Filter, Download,
   Users, Map as MapIcon, Link as LinkIcon, Timer, Clock
} from 'lucide-react';

export const Analytics: React.FC = () => {
   const { bookings, vendors, leads } = useData();
   const { staff } = useAuth();
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

   // --- NEW: 1. Monthly Revenue vs. Cost (Trendly) ---
   const monthlyTrends = useMemo(() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();

      const data = months.map(m => ({ month: m, revenue: 0, cost: 0, profit: 0 }));

      // Only process bookings that fall in the current year for this specific chart (can be adapted to timeRange)
      filteredBookings.forEach(b => {
         const bDate = new Date(b.date);
         if (bDate.getFullYear() === currentYear) {
            const mIndex = bDate.getMonth();
            const cost = (b.supplierBookings || []).reduce((sum, sb) => sum + sb.cost, 0);
            data[mIndex].revenue += b.amount;
            data[mIndex].cost += cost;
            data[mIndex].profit += (b.amount - cost);
         }
      });

      return data;
   }, [filteredBookings]);

   // --- NEW: 2. Top Selling Agents (Team Performance) ---
   const agentPerformance = useMemo(() => {
      const map = new Map<number, { name: string, initials: string, color: string, revenue: number, profit: number }>();

      filteredBookings.forEach(b => {
         if (b.assignedTo) {
            const st = staff.find(s => s.id === b.assignedTo);
            if (st) {
               const existing = map.get(st.id) || { name: st.name, initials: st.initials, color: st.color, revenue: 0, profit: 0 };
               const cost = (b.supplierBookings || []).reduce((sum, sb) => sum + sb.cost, 0);
               existing.revenue += b.amount;
               existing.profit += (b.amount - cost);
               map.set(st.id, existing);
            }
         }
      });

      return Array.from(map.values())
         .sort((a, b) => b.profit - a.profit); // Primary sort by profit generated for company
   }, [filteredBookings, staff]);

   // --- NEW: 3. Lead Source ROI ---
   const leadSourceROI = useMemo(() => {
      const srcMap = new Map<string, { totalLeads: number, converted: number, revenueFromConverted: number }>();

      (leads || []).forEach(l => {
         const source = l.source || 'Direct/Other';
         const existing = srcMap.get(source) || { totalLeads: 0, converted: 0, revenueFromConverted: 0 };
         existing.totalLeads += 1;
         if (l.status === 'Converted') {
            existing.converted += 1;
            existing.revenueFromConverted += (l.potentialValue || 0); // Approx ROI
         }
         srcMap.set(source, existing);
      });

      return Array.from(srcMap.entries())
         .map(([source, data]) => ({ source, ...data, rate: Math.round((data.converted / data.totalLeads) * 100) }))
         .sort((a, b) => b.revenueFromConverted - a.revenueFromConverted);
   }, [leads]);

   // --- NEW: 4. Most Profitable Destinations ---
   const destProfitability = useMemo(() => {
      const destMap = new Map<string, { count: number, revenue: number, profit: number }>();

      filteredBookings.forEach(b => {
         const dest = (b.title || '').split('-')[0].trim() || 'Unknown Package';
         const existing = destMap.get(dest) || { count: 0, revenue: 0, profit: 0 };
         const cost = (b.supplierBookings || []).reduce((sum, sb) => sum + sb.cost, 0);

         existing.count += 1;
         existing.revenue += b.amount;
         existing.profit += (b.amount - cost);
         destMap.set(dest, existing);
      });

      return Array.from(destMap.entries())
         .map(([name, data]) => ({
            name,
            ...data,
            margin: data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0
         }))
         .filter(d => d.count > 0)
         .sort((a, b) => b.profit - a.profit)
         .slice(0, 5); // Top 5
   }, [filteredBookings]);

   // --- NEW: 5. Average Conversion Time ---
   const averageConversionTimeDays = useMemo(() => {
      let totalDays = 0;
      let convertedCount = 0;

      (leads || []).forEach(l => {
         if (l.status === 'Converted' && l.addedOn) {
            // Approximate by assuming if it's converted now, the difference between addedOn and current date (or a specific closing date if we tracked it)
            // Since we don't have a strict strict closing date tracked, we'll use a simulated or proxy method if needed.
            // Let's assume it was converted recently.
            const start = new Date(l.addedOn).getTime();
            const end = new Date().getTime(); // Proxy for 'date converted'
            const days = Math.round((end - start) / (1000 * 3600 * 24));
            totalDays += Math.max(days, 1); // at least 1 day
            convertedCount++;
         }
      });

      return convertedCount > 0 ? Math.round(totalDays / convertedCount) : 0;
   }, [leads]);

   // --- NEW: 6. Accounts Aging Report (Receivables) ---
   const agingReport = useMemo(() => {
      const buckets = { current: 0, days1to15: 0, days16to30: 0, over30: 0 };
      const now = new Date().getTime();

      filteredBookings.forEach(b => {
         if (b.payment === 'Unpaid' || b.payment === 'Deposit') {
            const paid = (b.transactions || []).filter(t => t.type === 'Payment').reduce((sum, t) => sum + t.amount, 0);
            const refunded = (b.transactions || []).filter(t => t.type === 'Refund').reduce((sum, t) => sum + t.amount, 0);
            const remaining = b.amount - (paid - refunded);

            if (remaining > 0) {
               const bDate = new Date(b.date).getTime();
               const daysOld = Math.floor((now - bDate) / (1000 * 3600 * 24));

               if (daysOld <= 7) buckets.current += remaining;
               else if (daysOld <= 15) buckets.days1to15 += remaining;
               else if (daysOld <= 30) buckets.days16to30 += remaining;
               else buckets.over30 += remaining;
            }
         }
      });

      return buckets;
   }, [filteredBookings]);

   // Format Currency
   const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
   // Format Short Currency (e.g. 5.2L)
   const fmtShort = (n: number) => `₹${(n / 100000).toFixed(n > 1000000 ? 1 : 2)}L`;

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
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity flex items-center gap-1">
                     <Timer size={48} className="text-blue-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Avg Time to Close</p>
                  <h3 className="text-4xl kpi-number text-slate-900 dark:text-white mt-2">
                     {averageConversionTimeDays} <span className="text-lg text-slate-500">days</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-2">
                     From lead to conversion
                  </p>
               </div>
            </div>

            {/* NEW 1. Monthly Revenue & Profit Trend Chart */}
            <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 section-heading-accent">
                     <TrendingUp size={20} className="text-primary" /> Year-to-Date Performance Trend
                  </h4>
               </div>

               {/* Visual Chart Area */}
               <div className="w-full overflow-x-auto pb-4">
                  <div className="min-w-[800px] h-64 flex items-end gap-2 px-4 relative">
                     {/* Y-Axis Grid Lines */}
                     <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10 z-0">
                        <div className="border-t border-slate-400 w-full h-0"></div>
                        <div className="border-t border-slate-400 w-full h-0"></div>
                        <div className="border-t border-slate-400 w-full h-0"></div>
                        <div className="border-t border-slate-400 w-full h-0"></div>
                     </div>

                     {/* Bars */}
                     {monthlyTrends.map((data, i) => {
                        // Find max revenue for scaling
                        const maxRev = Math.max(...monthlyTrends.map(m => m.revenue), 100000);

                        const heightRev = Math.max((data.revenue / maxRev) * 100, 2); // % of container height
                        const heightProfit = Math.max((data.profit / maxRev) * 100, 2);

                        return (
                           <div key={i} className="flex-1 flex flex-col justify-end items-center group relative z-10">
                              {/* Tooltip on hover */}
                              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded whitespace-nowrap z-20 pointer-events-none shadow-xl border border-white/10">
                                 <p className="font-bold">{data.month}</p>
                                 <p className="text-indigo-300">Rev: {fmt(data.revenue)}</p>
                                 <p className="text-emerald-400">Profit: {fmt(data.profit)}</p>
                              </div>

                              {/* Double Bar Construction */}
                              <div className="flex items-end gap-1 w-full max-w-[40px] h-[200px]">
                                 <div
                                    className="w-1/2 bg-indigo-500 dark:bg-indigo-600 rounded-t-sm opacity-90 group-hover:opacity-100 transition-all"
                                    style={{ height: `${heightRev}%` }}
                                 />
                                 <div
                                    className="w-1/2 bg-emerald-400 dark:bg-emerald-500 rounded-t-sm opacity-90 group-hover:opacity-100 transition-all"
                                    style={{ height: `${heightProfit}%` }}
                                 />
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 mt-3 uppercase">{data.month}</span>
                           </div>
                        );
                     })}
                  </div>
                  {/* Chart Legend */}
                  <div className="flex justify-center gap-6 mt-2 pb-2">
                     <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-indigo-500"></div><span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Gross Revenue</span></div>
                     <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-emerald-400"></div><span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Net Profit</span></div>
                  </div>
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

            {/* NEW Grid: Agent Perf & Lead Source ROI */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

               {/* 2. Agent Leaderboard */}
               <div className="bg-white dark:bg-[#1A2633] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 section-heading-accent">
                        <Users size={20} className="text-primary" /> Top Performing Agents
                     </h4>
                  </div>
                  <div className="p-0 overflow-x-auto flex-1">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                           <tr>
                              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Agent</th>
                              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Revenue</th>
                              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs text-right">Net Profit</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                           {agentPerformance.map((agent, i) => {
                              const margin = agent.revenue > 0 ? (agent.profit / agent.revenue) * 100 : 0;
                              return (
                                 <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className={`size-8 rounded-full bg-${agent.color}-100 dark:bg-${agent.color}-900/40 text-${agent.color}-600 dark:text-${agent.color}-400 font-bold flex items-center justify-center text-xs shadow-sm`}>
                                             {agent.initials}
                                          </div>
                                          <span className="font-bold text-slate-900 dark:text-white">{agent.name}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">{fmtShort(agent.revenue)}</td>
                                    <td className="px-6 py-4 text-right">
                                       <span className="block kpi-number text-emerald-600 dark:text-emerald-400">{fmtShort(agent.profit)}</span>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{margin.toFixed(0)}% mgn</span>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* 3. Lead Source ROI & Aging Report */}
               <div className="flex flex-col gap-8">
                  {/* Lead Source ROI */}
                  <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 section-heading-accent">
                        <LinkIcon size={20} className="text-primary" /> Lead Source ROI (Potential)
                     </h4>
                     <div className="space-y-4 flex-1">
                        {leadSourceROI.map((src, i) => (
                           <div key={i} className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0">
                              <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{src.source}</span>
                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{src.rate}% Conv.</span>
                                 </div>
                                 <span className="kpi-number text-indigo-600 dark:text-indigo-400">{fmtShort(src.revenueFromConverted)}</span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                 {src.converted} won / {src.totalLeads} total leads
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* 6. Accounts Aging Report */}
                  <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 section-heading-accent">
                        <Clock size={20} className="text-primary" /> Receivables Aging
                     </h4>
                     <div className="grid grid-cols-4 gap-2 text-center items-end h-24 mb-2">
                        {[
                           { label: '< 7 Days', val: agingReport.current, color: 'bg-emerald-400' },
                           { label: '7 - 15', val: agingReport.days1to15, color: 'bg-amber-400' },
                           { label: '16 - 30', val: agingReport.days16to30, color: 'bg-orange-500' },
                           { label: '> 30 Days', val: agingReport.over30, color: 'bg-rose-600' }
                        ].map((b, i) => {
                           const height = Math.max((b.val / (metrics.pendingCollections || 1)) * 100, 10);
                           return (
                              <div key={i} className="flex flex-col items-center justify-end h-full">
                                 <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 leading-tight">{b.val > 0 ? fmtShort(b.val) : '-'}</span>
                                 <div className={`w-full max-w-[40px] rounded-t-sm ${b.color} transition-all opacity-90 hover:opacity-100`} style={{ height: `${height}%` }}></div>
                              </div>
                           )
                        })}
                     </div>
                     <div className="grid grid-cols-4 gap-2 text-center border-t border-slate-100 dark:border-slate-800 pt-2">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">&lt; 7 Days</div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">7 - 15D</div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">16 - 30D</div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">&gt; 30 Days</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* 4. Most Profitable Packages (Grid bottom) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col xl:col-span-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 section-heading-accent">
                     <MapIcon size={20} className="text-primary" /> Most Profitable Packages
                  </h4>
                  <div className="space-y-4 flex-1">
                     {destProfitability.map((dest, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
                                 #{i + 1}
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{dest.name}</p>
                                 <p className="text-xs font-medium text-slate-500">{dest.count} trips booked</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="kpi-number text-sm text-emerald-600 dark:text-emerald-400">{fmtShort(dest.profit)}</p>
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-[10px] font-bold rounded uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                 {dest.margin}% Mgn
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};