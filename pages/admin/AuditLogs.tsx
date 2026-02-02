
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AuditLog } from '../../types';

export const AuditLogs: React.FC = () => {
    const { auditLogs } = useData();
    const [filter, setFilter] = useState('');
    const [moduleFilter, setModuleFilter] = useState('All');

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(filter.toLowerCase()) ||
            log.details.toLowerCase().includes(filter.toLowerCase()) ||
            log.performedBy.toLowerCase().includes(filter.toLowerCase());
        const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
        return matchesSearch && matchesModule;
    });

    const uniqueModules = ['All', ...Array.from(new Set(auditLogs.map(l => l.module)))];

    return (
        <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900">

            {/* Header */}
            <div className="px-6 py-4 flex-shrink-0 bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Audit Logs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Track all system activities and critical actions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-xs shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
                    </button>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                        <input
                            placeholder="Search logs..."
                            className="w-full bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none shadow-sm"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="relative w-48">
                        <select
                            className="w-full appearance-none bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
                            value={moduleFilter}
                            onChange={e => setModuleFilter(e.target.value)}
                        >
                            {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 material-symbols-outlined text-[20px]">filter_list</span>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-[#1A2633] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Module</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Performed By</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
                                             ${log.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                                        log.severity === 'Warning' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'}
                                         `}>
                                                    {log.severity === 'Critical' && <span className="material-symbols-outlined text-[14px]">error</span>}
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{log.module}</td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600">
                                                    {log.performedBy.charAt(0)}
                                                </div>
                                                {log.performedBy}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">No logs found matching your filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};
