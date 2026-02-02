import React, { useEffect, useState } from 'react';

interface TravelerSelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const TravelerSelector: React.FC<TravelerSelectorProps> = ({ value, onChange, className = '' }) => {
    // Parse initial value "X Adults, Y Children"
    const parseValue = (val: string) => {
        const adultsMatch = val.match(/(\d+)\s*Adults?/i);
        const childrenMatch = val.match(/(\d+)\s*Child(ren)?/i);

        return {
            adults: adultsMatch ? parseInt(adultsMatch[1]) : 2,
            children: childrenMatch ? parseInt(childrenMatch[1]) : 0
        };
    };

    const [counts, setCounts] = useState(parseValue(value));

    // Update internal state if external value changes significantly (and isn't just a re-render)
    useEffect(() => {
        const currentString = formatString(counts.adults, counts.children);
        if (value !== currentString && value) {
            setCounts(parseValue(value));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const formatString = (a: number, c: number) => {
        const parts = [];
        parts.push(`${a} Adult${a !== 1 ? 's' : ''}`);
        if (c > 0) {
            parts.push(`${c} Child${c !== 1 ? 'ren' : ''}`);
        }
        return parts.join(', ');
    };

    const updateCounts = (type: 'adults' | 'children', delta: number) => {
        setCounts(prev => {
            const newVal = Math.max(0, prev[type] + delta);
            // Ensure at least 1 adult
            if (type === 'adults' && newVal < 1) return prev;

            const newCounts = { ...prev, [type]: newVal };
            const newString = formatString(newCounts.adults, newCounts.children);
            onChange(newString);
            return newCounts;
        });
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Adults Row */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Adults</span>
                    <span className="text-xs text-slate-500">Age 12+</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => updateCounts('adults', -1)}
                        className="size-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        disabled={counts.adults <= 1}
                    >
                        <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="w-4 text-center font-bold text-slate-900 dark:text-white">{counts.adults}</span>
                    <button
                        type="button"
                        onClick={() => updateCounts('adults', 1)}
                        className="size-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
            </div>

            {/* Children Row */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Children</span>
                    <span className="text-xs text-slate-500">Age 2-12</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => updateCounts('children', -1)}
                        className="size-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        disabled={counts.children <= 0}
                    >
                        <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="w-4 text-center font-bold text-slate-900 dark:text-white">{counts.children}</span>
                    <button
                        type="button"
                        onClick={() => updateCounts('children', 1)}
                        className="size-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
