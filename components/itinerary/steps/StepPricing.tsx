import React, { useState } from 'react';
import { useItinerary, CURRENCY_SYMBOLS, ItineraryItem } from '../ItineraryContext';
import { CurrencyCode } from '../../../types';
import { DollarSign, Percent, Calculator, Settings, ArrowLeft, FileCheck, IndianRupee, Receipt } from 'lucide-react';

const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'AED', 'EUR', 'GBP'];

export const StepPricing: React.FC = () => {
    const {
        items, updateItem, setStep, currency, setCurrency,
        taxConfig, updateTaxConfig, subtotal, taxAmount, grandTotal,
        formatCurrency, tripDetails
    } = useItinerary();

    const [showTaxSettings, setShowTaxSettings] = useState(false);

    const categoryGroups: Record<string, ItineraryItem[]> = items.reduce((groups, item) => {
        const cat = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
        return groups;
    }, {} as Record<string, ItineraryItem[]>);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Calculator className="text-emerald-500" size={24} />
                            Pricing & Costing
                        </h2>
                        <p className="text-sm text-slate-500">Set markups, taxes, and finalize costs for: <span className="font-bold text-primary">{tripDetails.title || 'Untitled Trip'}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Currency Selector */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {CURRENCIES.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === c
                                        ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {CURRENCY_SYMBOLS[c]} {c}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowTaxSettings(!showTaxSettings)}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            <Settings size={16} /> Tax Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Tax Settings Panel */}
                    {showTaxSettings && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
                            <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                                <Receipt size={18} /> Tax Configuration (GST & TCS)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">CGST %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full mt-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-sm font-bold"
                                        value={taxConfig.cgstPercent}
                                        onChange={e => updateTaxConfig({ cgstPercent: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">SGST %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full mt-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-sm font-bold"
                                        value={taxConfig.sgstPercent}
                                        onChange={e => updateTaxConfig({ sgstPercent: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">IGST %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full mt-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-sm font-bold"
                                        value={taxConfig.igstPercent}
                                        onChange={e => updateTaxConfig({ igstPercent: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">TCS %</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full mt-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 text-sm font-bold"
                                        value={taxConfig.tcsPercent}
                                        onChange={e => updateTaxConfig({ tcsPercent: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={taxConfig.gstOnTotal}
                                            onChange={e => updateTaxConfig({ gstOnTotal: e.target.checked })}
                                            className="size-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                        />
                                        GST on Total
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Table */}
                    {Object.entries(categoryGroups).map(([category, catItems]) => (
                        <div key={category} className="bg-white dark:bg-[#1A2633] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-sm">{category}s ({catItems.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase text-xs">Item</th>
                                            <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase text-xs">Qty</th>
                                            <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase text-xs">Net Cost</th>
                                            <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase text-xs">
                                                <span className="flex items-center justify-center gap-1"><Percent size={12} /> Markup</span>
                                            </th>
                                            <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase text-xs">
                                                <span className="flex items-center justify-end gap-1"><IndianRupee size={12} /> Extra</span>
                                            </th>
                                            <th className="text-right px-4 py-3 font-bold text-emerald-600 uppercase text-xs">Sell Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {catItems.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                                                    <div className="text-xs text-slate-500">Day {item.day}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-16 text-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-28 text-right bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm font-bold"
                                                        value={item.netCost}
                                                        onChange={e => updateItem(item.id, { netCost: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            className="w-16 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-1 text-sm font-bold text-blue-700 dark:text-blue-300"
                                                            value={item.baseMarkupPercent}
                                                            onChange={e => updateItem(item.id, { baseMarkupPercent: parseFloat(e.target.value) || 0 })}
                                                        />
                                                        <span className="text-blue-500 font-bold">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className="text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-20 text-right bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-2 py-1 text-sm font-bold text-purple-700 dark:text-purple-300"
                                                            value={item.extraMarkupFlat}
                                                            onChange={e => updateItem(item.id, { extraMarkupFlat: parseFloat(e.target.value) || 0 })}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                                                        {formatCurrency(item.sellPrice)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-[#1A2633] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <DollarSign size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-500">No items to price</h3>
                            <p className="text-sm text-slate-400">Go back to the planner and add Hotels, Activities, or Transports</p>
                        </div>
                    )}

                    {/* Totals */}
                    {items.length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between gap-16 text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between gap-16 text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Tax ({taxConfig.cgstPercent + taxConfig.sgstPercent + taxConfig.igstPercent + taxConfig.tcsPercent}%)
                                        </span>
                                        <span className="font-bold text-amber-600">{formatCurrency(taxAmount)}</span>
                                    </div>
                                    <div className="h-px bg-emerald-300 dark:bg-emerald-700 my-2"></div>
                                    <div className="flex justify-between gap-16">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Grand Total</span>
                                        <span className="font-black text-2xl text-emerald-600 dark:text-emerald-300">{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-400 transition-colors"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                                    >
                                        <FileCheck size={18} /> Finalize & Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
