import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const busBookingSchema = z.object({
    from: z.string().min(2, 'Departure city is required'),
    to: z.string().min(2, 'Destination city is required'),
    date: z.string().min(1, 'Travel date is required'),
    seats: z.number().min(1, 'At least 1 seat required').max(10, 'Maximum 10 seats per booking'),
}).refine(data => data.from.toLowerCase() !== data.to.toLowerCase(), {
    message: 'Departure and destination must be different',
    path: ['to']
});

type BusFormData = z.infer<typeof busBookingSchema>;

interface BusBookingFormProps {
    onSubmit: (data: BusBookingData) => void;
}

export interface BusBookingData {
    from: string;
    to: string;
    date: string;
    seats: number;
}

export const BusBookingForm: React.FC<BusBookingFormProps> = ({ onSubmit }) => {
    const today = new Date().toISOString().split('T')[0];

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BusFormData>({
        resolver: zodResolver(busBookingSchema),
        defaultValues: { from: '', to: '', date: '', seats: 1 }
    });

    const seats = watch('seats');

    const updateSeats = (delta: number) => {
        const newVal = Math.max(1, Math.min(10, seats + delta));
        setValue('seats', newVal);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* From */}
                <div className="md:col-span-3 relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">From</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">trip_origin</span>
                        <input
                            {...register('from')}
                            className={`w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-base placeholder:text-slate-400/80 transition-all ${errors.from ? 'border-red-400' : 'border-transparent'}`}
                            placeholder="Departure City"
                            type="text"
                        />
                    </div>
                    {errors.from && <p className="text-red-500 text-xs mt-1 pl-1">{errors.from.message}</p>}
                </div>

                {/* To */}
                <div className="md:col-span-3 relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">To</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">location_on</span>
                        <input
                            {...register('to')}
                            className={`w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-base placeholder:text-slate-400/80 transition-all ${errors.to ? 'border-red-400' : 'border-transparent'}`}
                            placeholder="Destination City"
                            type="text"
                        />
                    </div>
                    {errors.to && <p className="text-red-500 text-xs mt-1 pl-1">{errors.to.message}</p>}
                </div>

                {/* Date */}
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Date</label>
                    <input
                        {...register('date')}
                        className={`w-full px-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-sm transition-all ${errors.date ? 'border-red-400' : 'border-transparent'}`}
                        type="date"
                        min={today}
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1 pl-1">{errors.date.message}</p>}
                </div>

                {/* Seats */}
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Seats</label>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2">
                        <button
                            type="button"
                            onClick={() => updateSeats(-1)}
                            disabled={seats <= 1}
                            className="size-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <input
                            type="hidden"
                            {...register('seats', { valueAsNumber: true })}
                        />
                        <span className="flex-1 text-center font-bold text-lg text-slate-900 dark:text-white">{seats}</span>
                        <button
                            type="button"
                            onClick={() => updateSeats(1)}
                            disabled={seats >= 10}
                            className="size-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                    {errors.seats && <p className="text-red-500 text-xs mt-1 pl-1">{errors.seats.message}</p>}
                </div>

                {/* Submit */}
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-transparent uppercase tracking-wider mb-2 block select-none">Action</label>
                    <button
                        type="submit"
                        className="w-full h-[60px] bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-95"
                    >
                        Search Buses
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BusBookingForm;
