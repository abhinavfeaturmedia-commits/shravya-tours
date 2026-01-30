import React from 'react';

export const Analytics: React.FC = () => {
  const handleExport = () => {
    alert("Downloading analytics report...");
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A2633] border-b border-border-light dark:border-border-dark px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of business performance and growth metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg p-2.5 pr-8 font-medium focus:ring-primary focus:border-primary">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Year</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm px-4 py-2.5 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { label: 'Total Revenue', value: '₹1,20,00,000', change: '+15%', trend: 'up', color: 'green' },
               { label: 'Total Bookings', value: '145', change: '+5%', trend: 'up', color: 'green' },
               { label: 'Conversion Rate', value: '3.2%', change: '-1%', trend: 'down', color: 'red' },
               { label: 'Pending Enquiries', value: '42', change: '0%', trend: 'flat', color: 'slate' }
             ].map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-1">
                   <div className="flex justify-between items-start">
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
                      <div className={`bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30 text-${kpi.color}-700 dark:text-${kpi.color}-400 p-1 rounded text-xs font-bold flex items-center gap-0.5`}>
                         <span className="material-symbols-outlined text-sm">{kpi.trend === 'up' ? 'trending_up' : kpi.trend === 'down' ? 'trending_down' : 'remove'}</span> {kpi.change}
                      </div>
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</h3>
                   <p className="text-slate-400 text-xs mt-2">Vs previous period</p>
                </div>
             ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h3>
                   <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><span className="w-2 h-2 rounded-full bg-primary"></span> Current</span>
                   </div>
                </div>
                <div className="w-full h-[300px] relative">
                    {/* Simplified SVG Chart */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300">
                        <defs>
                           <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#137fec" stopOpacity="0.2"></stop>
                              <stop offset="100%" stopColor="#137fec" stopOpacity="0"></stop>
                           </linearGradient>
                        </defs>
                        <path d="M0 250 C 100 240, 150 100, 200 120 C 250 140, 300 200, 350 180 C 400 160, 450 80, 500 60 C 550 40, 600 90, 650 70 C 700 50, 750 20, 800 40" fill="none" stroke="#137fec" strokeLinecap="round" strokeWidth="3"></path>
                        <path d="M0 250 C 100 240, 150 100, 200 120 C 250 140, 300 200, 350 180 C 400 160, 450 80, 500 60 C 550 40, 600 90, 650 70 C 700 50, 750 20, 800 40 L 800 300 L 0 300 Z" fill="url(#gradient)" opacity="0.5"></path>
                    </svg>
                </div>
             </div>
             
             <div className="bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lead Sources</h3>
                <div className="flex-1 flex flex-col items-center justify-center">
                   <div className="relative w-48 h-48 rounded-full" style={{ background: 'conic-gradient(#137fec 0% 40%, #8b5cf6 40% 70%, #10b981 70% 90%, #f59e0b 90% 100%)' }}>
                      <div className="absolute inset-4 bg-white dark:bg-[#1A2633] rounded-full flex items-center justify-center flex-col">
                         <span className="text-3xl font-bold text-slate-900 dark:text-white">1,450</span>
                         <span className="text-xs text-slate-500">Total Leads</span>
                      </div>
                   </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
                   {[{l:'Google', c:'bg-[#137fec]', p:'40%'}, {l:'Instagram', c:'bg-violet-500', p:'30%'}, {l:'Direct', c:'bg-emerald-500', p:'20%'}, {l:'Referral', c:'bg-amber-500', p:'10%'}].map((s,i)=>(
                      <div key={i} className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${s.c}`}></div><span className="text-slate-600 dark:text-slate-300">{s.l} ({s.p})</span></div>
                   ))}
                </div>
             </div>
          </div>
          
          {/* Transactions Table */}
          <div className="bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden flex flex-col">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                   <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                      <tr>
                         <th className="px-4 py-3 rounded-l-lg">ID</th>
                         <th className="px-4 py-3">Customer</th>
                         <th className="px-4 py-3">Package</th>
                         <th className="px-4 py-3">Amount</th>
                         <th className="px-4 py-3 rounded-r-lg">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {[
                        {id:'#TRX-9821', user:'Rahul Verma', pkg:'Kerala Houseboat', amt:'₹12,500', status:'Paid'},
                        {id:'#TRX-9820', user:'Sneha Patel', pkg:'Goa Beach Party', amt:'₹8,000', status:'Pending'},
                        {id:'#TRX-9819', user:'Amit Kumar', pkg:'Shimla Retreat', amt:'₹15,200', status:'Paid'},
                        {id:'#TRX-9818', user:'Priya Singh', pkg:'Bali Getaway', amt:'₹45,000', status:'Paid'},
                        {id:'#TRX-9817', user:'John Doe', pkg:'Manali Trip', amt:'₹10,500', status:'Failed'},
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                           <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.user}</td>
                           <td className="px-4 py-3">{row.pkg}</td>
                           <td className="px-4 py-3">{row.amt}</td>
                           <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${row.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{row.status}</span></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};