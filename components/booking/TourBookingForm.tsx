import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const tourBookingSchema = z.object({
    destination: z.string().min(2, 'Please enter a destination or tour name'),
});

type TourFormData = z.infer<typeof tourBookingSchema>;

interface TourBookingFormProps {
    onSubmit: (data: { destination: string }) => void;
}

export const TourBookingForm: React.FC<TourBookingFormProps> = ({ onSubmit }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<TourFormData>({
        resolver: zodResolver(tourBookingSchema),
        defaultValues: { destination: '' }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="md:col-span-10 relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Where would you like to go?</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">travel_explore</span>
                        <input
                            {...register('destination')}
                            className={`w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-lg placeholder:text-slate-400/80 transition-all ${errors.destination ? 'border-red-400' : 'border-transparent'}`}
                            placeholder="Search destinations, tours, experiences..."
                            type="text"
                        />
                    </div>
                    {errors.destination && <p className="text-red-500 text-xs mt-1 pl-1">{errors.destination.message}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-transparent uppercase tracking-wider mb-2 block select-none">Action</label>
                    <button
                        type="submit"
                        className="w-full h-[60px] bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-95"
                    >
                        Explore
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TourBookingForm;
