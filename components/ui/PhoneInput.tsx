import React, { useState, useEffect, forwardRef } from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    countryCode?: string;
    id?: string;
    name?: string;
}

/**
 * A phone input component with automatic formatting.
 * Formats as: +91 98765 43210 (for Indian numbers)
 * Stores the raw digits for form submission.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({
    value,
    onChange,
    placeholder = "Enter phone number",
    required = false,
    className = "",
    countryCode = "+91",
    id,
    name
}, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Format phone number for display
    const formatPhoneNumber = (raw: string): string => {
        // Remove all non-digits
        const digits = raw.replace(/\D/g, '');

        // Remove country code if present at start
        let phoneDigits = digits;
        if (digits.startsWith('91') && digits.length > 10) {
            phoneDigits = digits.slice(2);
        }

        // Limit to 10 digits
        phoneDigits = phoneDigits.slice(0, 10);

        if (phoneDigits.length === 0) return '';

        // Format as: XXXXX XXXXX (Indian format)
        if (phoneDigits.length <= 5) {
            return phoneDigits;
        }
        return `${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`;
    };

    // Extract raw digits from input
    const extractDigits = (input: string): string => {
        return input.replace(/\D/g, '').slice(0, 10);
    };

    // Sync display value when prop value changes
    useEffect(() => {
        setDisplayValue(formatPhoneNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const digits = extractDigits(input);

        // Update display immediately for responsive feel
        setDisplayValue(formatPhoneNumber(digits));

        // Pass raw digits to parent
        onChange(digits);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const isValid = value.length === 10;
    const showValidation = value.length > 0 && !isFocused;

    return (
        <div className="relative">
            <div className="flex">
                {/* Country Code Badge */}
                <div className="flex items-center justify-center px-3 bg-slate-100 dark:bg-slate-700 border border-r-0 border-slate-200 dark:border-slate-600 rounded-l-xl text-sm font-bold text-slate-600 dark:text-slate-300 select-none">
                    {countryCode}
                </div>

                {/* Phone Input */}
                <input
                    ref={ref}
                    type="tel"
                    id={id}
                    name={name}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    inputMode="numeric"
                    autoComplete="tel"
                    className={`
                        flex-1 rounded-r-xl border border-slate-200 dark:border-slate-700 
                        bg-slate-50 dark:bg-slate-800 p-3.5 font-medium 
                        outline-none focus:ring-2 focus:ring-primary transition-all
                        ${showValidation ? (isValid ? 'border-green-400 dark:border-green-500' : 'border-red-300 dark:border-red-500') : ''}
                        ${className}
                    `}
                />
            </div>

            {/* Validation Indicator */}
            {showValidation && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium ${isValid ? 'text-green-500' : 'text-red-400'}`}>
                    <span className="material-symbols-outlined text-[16px]">
                        {isValid ? 'check_circle' : 'error'}
                    </span>
                    <span className="hidden sm:inline">
                        {isValid ? 'Valid' : `${10 - value.length} more digits`}
                    </span>
                </div>
            )}
        </div>
    );
});

PhoneInput.displayName = 'PhoneInput';
