import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const carBookingSchema = z.object({
    pickupLocation: z.string().min(2, 'Pickup location is required'),
    dropoffLocation: z.string().optional(),
    pickupDate: z.string().min(1, 'Pickup date is required'),
    pickupTime: z.string().min(1, 'Pickup time is required'),
    vehicleType: z.string().min(1, 'Please select a vehicle type'),
});

type CarFormData = z.infer<typeof carBookingSchema>;

interface CarBookingFormProps {
    onSubmit: (data: CarBookingData) => void;
}

export interface CarBookingData {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    vehicleType: string;
    sameDropOff: boolean;
}

const carTypes = ['Hatchback', 'Sedan', 'SUV', 'Innova', 'Tempo Traveller', 'Luxury'];

export const CarBookingForm: React.FC<CarBookingFormProps> = ({ onSubmit }) => {
    const today = new Date().toISOString().split('T')[0];
    const [sameDropOff, setSameDropOff] = useState(true);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<CarFormData>({
        resolver: zodResolver(carBookingSchema),
        defaultValues: {
            pickupLocation: '',
            dropoffLocation: '',
            pickupDate: '',
            pickupTime: '',
            vehicleType: 'Sedan'
        }
    });

    const onFormSubmit = (data: CarFormData) => {
        onSubmit({
            ...data,
            dropoffLocation: sameDropOff ? data.pickupLocation : (data.dropoffLocation || data.pickupLocation),
            sameDropOff
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Same drop-off toggle */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSameDropOff(true)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${sameDropOff ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                        Round Trip
                    </button>
                    <button
                        type="button"
                        onClick={() => setSameDropOff(false)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${!sameDropOff ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                        One Way
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Pickup Location */}
                    <div className={`${sameDropOff ? 'md:col-span-4' : 'md:col-span-3'} relative group`}>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Pickup Location</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">my_location</span>
                            <input
                                {...register('pickupLocation')}
                                className={`w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-base placeholder:text-slate-400/80 transition-all ${errors.pickupLocation ? 'border-red-400' : 'border-transparent'}`}
                                placeholder="City or Airport"
                                type="text"
                            />
                        </div>
                        {errors.pickupLocation && <p className="text-red-500 text-xs mt-1 pl-1">{errors.pickupLocation.message}</p>}
                    </div>

                    {/* Drop-off Location (only if different) */}
                    {!sameDropOff && (
                        <div className="md:col-span-3 relative group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Drop-off Location</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">location_on</span>
                                <input
                                    {...register('dropoffLocation')}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-base placeholder:text-slate-400/80 transition-all"
                                    placeholder="Destination"
                                    type="text"
                                />
                            </div>
                        </div>
                    )}

                    {/* Date & Time */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Date</label>
                        <input
                            {...register('pickupDate')}
                            className={`w-full px-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-sm transition-all ${errors.pickupDate ? 'border-red-400' : 'border-transparent'}`}
                            type="date"
                            min={today}
                        />
                        {errors.pickupDate && <p className="text-red-500 text-xs mt-1 pl-1">{errors.pickupDate.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Time</label>
                        <input
                            {...register('pickupTime')}
                            className={`w-full px-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-sm transition-all ${errors.pickupTime ? 'border-red-400' : 'border-transparent'}`}
                            type="time"
                        />
                        {errors.pickupTime && <p className="text-red-500 text-xs mt-1 pl-1">{errors.pickupTime.message}</p>}
                    </div>

                    {/* Vehicle Type */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Vehicle</label>
                        <select
                            {...register('vehicleType')}
                            className="w-full px-4 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold text-sm transition-all appearance-none cursor-pointer"
                        >
                            {carTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-transparent uppercase tracking-wider mb-2 block select-none">Action</label>
                        <button
                            type="submit"
                            className="w-full h-[60px] bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-95"
                        >
                            Get Quote
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CarBookingForm;
