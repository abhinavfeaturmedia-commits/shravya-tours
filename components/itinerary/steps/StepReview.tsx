import React, { useState } from 'react';
import { useItinerary, ItineraryItem } from '../ItineraryContext';
import { useData } from '../../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Package } from '../../../types';
import { Check, DollarSign, Save, ArrowLeft, MapPin, Calendar, Users, FileText, Share2, Printer } from 'lucide-react';

export const StepReview: React.FC = () => {
    const { tripDetails, items, totalCost, setStep } = useItinerary();
    const { addPackage } = useData();
    const navigate = useNavigate();

    const [markupType, setMarkupType] = useState<'percentage' | 'fixed'>('percentage');
    const [markupValue, setMarkupValue] = useState<number>(20); // Default 20%

    // Calculate Final Price
    const markupAmount = markupType === 'percentage'
        ? Math.round(totalCost * (markupValue / 100))
        : markupValue;

    const finalPrice = totalCost + markupAmount;

    // Helper to format itinerary for the Package object
    const generatePackageItinerary = () => {
        const days = Array.from({ length: tripDetails.duration }, (_, i) => i + 1);

        return days.map(day => {
            const dayItems = items.filter(i => i.day === day);

            // Build a description from the items
            let desc = dayItems.length === 0
                ? "Leisure day for personal exploration."
                : dayItems.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                    .map(item => `• ${item.time ? item.time + ': ' : ''}${item.title}${item.description ? ' - ' + item.description : ''}`)
                    .join('\n');

            return {
                day: day,
                title: dayItems.find(i => i.type === 'activity')?.title || (day === 1 ? 'Arrival' : `Day ${day} Itinerary`),
                desc: desc,
                items: dayItems // Keep ref for custom rendering if needed
            };
        });
    };

    const handleSave = () => {
        if (!tripDetails.title) {
            alert("Title is missing!");
            return;
        }

        const newPackage: Package = {
            id: `pkg-${Date.now()}`,
            title: tripDetails.title,
            days: tripDetails.duration,
            groupSize: tripDetails.guests,
            location: tripDetails.destination || 'Custom',
            description: `Custom itinerary created for ${tripDetails.guests}.`,
            price: finalPrice,
            image: tripDetails.coverImage,
            theme: 'Custom',
            rating: 'New',
            reviews: '0',
            overview: `A ${tripDetails.duration}-day journey to ${tripDetails.destination || 'Paradise'}.`,
            highlights: items.slice(0, 4).map(i => ({ icon: 'star', label: i.title })),
            itinerary: generatePackageItinerary(),
            gallery: [tripDetails.coverImage],
            status: 'Active'
        };

        addPackage(newPackage);
        // Maybe show a success toast here
        navigate('/admin/packages');
    };

    const itineraryList = generatePackageItinerary();

    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#0B1116] overflow-hidden">

            {/* LEFT: Document Preview */}
            <div className="flex-1 overflow-y-auto p-4 md:p-12">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 min-h-[800px] shadow-2xl rounded-sm p-6 md:p-12 relative animate-in zoom-in-95 duration-500">

                    {/* Document Header */}
                    <div className="border-b-2 border-slate-900 dark:border-white pb-6 md:pb-6 mb-6 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{tripDetails.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {tripDetails.destination}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {tripDetails.startDate}</span>
                                <span className="flex items-center gap-1"><Users size={12} /> {tripDetails.guests}</span>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Cost</div>
                            <div className="text-xl md:text-2xl font-black text-indigo-600">₹{finalPrice.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Itinerary Timeline */}
                    <div className="space-y-8 relative">
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />

                        {itineraryList.map((day) => (
                            <div key={day.day} className="relative pl-10">
                                <div className="absolute left-0 top-0 size-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-bold text-sm z-10">
                                    {day.day}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{day.title}</h3>
                                <div className="text-slate-500 text-sm leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    {day.desc}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-400 text-xs uppercase tracking-widest font-bold">
                        <span>Generated by Shravya Tours</span>
                        <span>Page 1 of 1</span>
                    </div>

                </div>
            </div>

            {/* RIGHT: Costing Panel */}
            <div className="w-full md:w-96 bg-white dark:bg-[#1A2633] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-20">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-green-500" /> Costing & Margins
                    </h3>
                </div>

                <div className="flex-1 p-6 space-y-8 overflow-y-auto">

                    {/* Net Cost Display */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Net Cost (Expenses)</div>
                        <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">₹{totalCost.toLocaleString()}</div>
                    </div>

                    {/* Markup Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Markup Strategy</label>
                            <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                + ₹{markupAmount.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                            <button
                                onClick={() => setMarkupType('percentage')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${markupType === 'percentage' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Percentage %
                            </button>
                            <button
                                onClick={() => setMarkupType('fixed')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${markupType === 'fixed' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Fixed Amount
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                value={markupValue}
                                onChange={(e) => setMarkupValue(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 font-black text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 pointer-events-none">
                                {markupType === 'percentage' ? '%' : '₹'}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:border-slate-800 my-4" />

                    {/* Final Price */}
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Suggested Selling Price</label>
                        <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">₹{finalPrice.toLocaleString()}</div>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 group"
                    >
                        <Save size={20} /> Save Package
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} /> Edit
                        </button>
                        <button className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                            <Printer size={16} /> Print
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};
