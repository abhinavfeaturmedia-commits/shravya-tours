import React from 'react';

export const Analytics: React.FC = () => {
   const handleExport = () => {
      alert("No data to export.");
   };

   return (
      <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
         {/* Header */}
         <div className="bg-white dark:bg-[#1A2633] border-b border-border-light dark:border-border-dark px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                     { label: 'Total Revenue', value: '₹0', change: '0%', trend: 'flat', color: 'slate' },
                     { label: 'Total Bookings', value: '0', change: '0%', trend: 'flat', color: 'slate' },
                     { label: 'Conversion Rate', value: '0%', change: '0%', trend: 'flat', color: 'slate' },
                     { label: 'Pending Enquiries', value: '0', change: '0%', trend: 'flat', color: 'slate' }
                  ].map((kpi, idx) => (
                     <div key={idx} className="bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
                           <div className={`bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30 text-${kpi.color}-700 dark:text-${kpi.color}-400 p-1 rounded text-xs font-bold flex items-center gap-0.5`}>
                              <span className="material-symbols-outlined text-sm">remove</span> {kpi.change}
                           </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</h3>
                        <p className="text-slate-400 text-xs mt-2">No data recorded</p>
                     </div>
                  ))}
               </div>

               {/* Main Charts */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-center min-h-[300px]">
                     <div className="text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                        <p>Revenue & Growth data will appear here.</p>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col min-h-[300px]">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lead Sources</h3>
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">pie_chart</span>
                        <p>No leads source data.</p>
                     </div>
                  </div>
               </div>

               {/* Transactions Table */}
               <div className="bg-white dark:bg-[#1A2633] p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden flex flex-col min-h-[200px]">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                     <p>No transactions found.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};