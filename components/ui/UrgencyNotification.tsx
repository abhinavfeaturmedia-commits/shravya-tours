import React, { useState, useEffect } from 'react';

const FAKE_BOOKINGS = [
    { name: 'Rahul from Mumbai', action: 'booked', pkg: 'Kerala Backwaters', time: '2 mins ago' },
    { name: 'Sarah from London', action: 'viewing', pkg: 'Golden Triangle', time: 'Now' },
    { name: 'Amit from Delhi', action: 'booked', pkg: 'Manali Escape', time: '5 mins ago' },
    { name: 'Priya from Bangalore', action: 'inquired about', pkg: 'Ladakh Adventure', time: '1 min ago' }
];

export const UrgencyNotification: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(FAKE_BOOKINGS[0]);

    useEffect(() => {
        // Initial delay
        const initialTimer = setTimeout(() => setVisible(true), 5000);

        // Cycle notifications
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                const randomBooking = FAKE_BOOKINGS[Math.floor(Math.random() * FAKE_BOOKINGS.length)];
                setCurrentBooking(randomBooking);
                setVisible(true);
            }, 1000); // Wait for fade out
        }, 15000); // Show every 15 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[100] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-5 duration-500 max-w-xs ring-1 ring-black/5">
            <button
                onClick={() => setVisible(false)}
                className="absolute -top-2 -right-2 size-6 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
                <span className="material-symbols-outlined text-xs">close</span>
            </button>
            <div className="flex gap-3 items-center">
                <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 animate-pulse">
                    <span className="material-symbols-outlined text-xl">
                        {currentBooking.action === 'booked' ? 'check_circle' : 'visibility'}
                    </span>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">{currentBooking.time}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        <span className="text-primary">{currentBooking.name}</span> just {currentBooking.action} <span className="underline decoration-slate-300 underline-offset-2">{currentBooking.pkg}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
