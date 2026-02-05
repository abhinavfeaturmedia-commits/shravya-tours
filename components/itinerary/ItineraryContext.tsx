import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { MasterHotel, MasterActivity, MasterTransport, CurrencyCode, TaxConfig, DEFAULT_TAX_CONFIG } from '../../types';

// --- Types ---

export type ServiceType = 'flight' | 'hotel' | 'activity' | 'transport' | 'note' | 'visa' | 'guide' | 'other';

export interface ItineraryItem {
    id: string;
    type: ServiceType;
    day: number;
    title: string;
    description?: string;

    // Pricing fields
    netCost: number;
    baseMarkupPercent: number;
    extraMarkupFlat: number;
    sellPrice: number; // Computed: netCost * (1 + baseMarkupPercent/100) + extraMarkupFlat
    quantity: number;

    // Specifics
    time?: string;
    duration?: string;

    // Master Data Link
    masterId?: string;
    masterData?: MasterHotel | MasterActivity | MasterTransport | any;
}

// Helper to calculate sell price
export const calculateSellPrice = (netCost: number, baseMarkupPercent: number, extraMarkupFlat: number, quantity: number = 1): number => {
    const markedUp = netCost * (1 + baseMarkupPercent / 100) + extraMarkupFlat;
    return Math.round(markedUp * quantity * 100) / 100;
};

interface TripDetails {
    title: string;
    startDate: string;
    duration: number;
    destination: string;
    coverImage: string;
    adults: number;
    children: number;
}

// Currency exchange rates (base: INR)
export const CURRENCY_RATES: Record<CurrencyCode, number> = {
    INR: 1,
    USD: 0.012,
    AED: 0.044,
    EUR: 0.011,
    GBP: 0.0095
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    AED: 'د.إ',
    EUR: '€',
    GBP: '£'
};

interface ItineraryContextType {
    // State
    step: number;
    tripDetails: TripDetails;
    items: ItineraryItem[];
    currency: CurrencyCode;
    taxConfig: TaxConfig;

    // Computed
    subtotal: number;
    taxAmount: number;
    grandTotal: number;

    // Actions
    setStep: (step: number) => void;
    updateTripDetails: (details: Partial<TripDetails>) => void;
    addItem: (item: Omit<ItineraryItem, 'sellPrice'>) => void;
    updateItem: (id: string, updates: Partial<Omit<ItineraryItem, 'sellPrice'>>) => void;
    removeItem: (id: string) => void;
    replaceAllItems: (items: ItineraryItem[]) => void;
    reorderItems: (destDay: number, newOrder: ItineraryItem[]) => void;
    setCurrency: (currency: CurrencyCode) => void;
    updateTaxConfig: (config: Partial<TaxConfig>) => void;

    // Helpers
    getItemsForDay: (day: number) => ItineraryItem[];
    formatCurrency: (amount: number) => string;
    convertCurrency: (amountInINR: number) => number;
}

// --- Context ---

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const useItinerary = () => {
    const context = useContext(ItineraryContext);
    if (!context) {
        throw new Error('useItinerary must be used within an ItineraryProvider');
    }
    return context;
};

// --- Provider ---

export const ItineraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [step, setStep] = useState(1);
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [currency, setCurrency] = useState<CurrencyCode>('INR');
    const [taxConfig, setTaxConfig] = useState<TaxConfig>(DEFAULT_TAX_CONFIG);

    const [tripDetails, setTripDetails] = useState<TripDetails>({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: 3,
        destination: '',
        coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop',
        adults: 2,
        children: 0
    });

    // Currency helpers
    const convertCurrency = useCallback((amountInINR: number): number => {
        return Math.round(amountInINR * CURRENCY_RATES[currency] * 100) / 100;
    }, [currency]);

    const formatCurrency = useCallback((amount: number): string => {
        const converted = convertCurrency(amount);
        return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }, [currency, convertCurrency]);

    // Calculate totals
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.sellPrice || 0), 0);
    }, [items]);

    const taxAmount = useMemo(() => {
        const { cgstPercent, sgstPercent, igstPercent, tcsPercent, gstOnTotal } = taxConfig;
        const taxableAmount = gstOnTotal ? subtotal : items.reduce((sum, item) => {
            const markup = item.sellPrice - (item.netCost * item.quantity);
            return sum + markup;
        }, 0);

        const cgst = taxableAmount * (cgstPercent / 100);
        const sgst = taxableAmount * (sgstPercent / 100);
        const igst = taxableAmount * (igstPercent / 100);
        const tcs = subtotal * (tcsPercent / 100);

        return Math.round((cgst + sgst + igst + tcs) * 100) / 100;
    }, [subtotal, taxConfig, items]);

    const grandTotal = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

    const updateTripDetails = useCallback((details: Partial<TripDetails>) => {
        setTripDetails(prev => ({ ...prev, ...details }));
    }, []);

    const addItem = useCallback((item: Omit<ItineraryItem, 'sellPrice'>) => {
        const sellPrice = calculateSellPrice(item.netCost, item.baseMarkupPercent, item.extraMarkupFlat, item.quantity);
        setItems(prev => [...prev, { ...item, sellPrice }]);
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<Omit<ItineraryItem, 'sellPrice'>>) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates };
            updated.sellPrice = calculateSellPrice(updated.netCost, updated.baseMarkupPercent, updated.extraMarkupFlat, updated.quantity);
            return updated;
        }));
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const replaceAllItems = useCallback((newItems: ItineraryItem[]) => {
        setItems(newItems.map(item => ({
            ...item,
            sellPrice: calculateSellPrice(item.netCost, item.baseMarkupPercent, item.extraMarkupFlat, item.quantity)
        })));
    }, []);

    const reorderItems = useCallback((destDay: number, _newOrder: ItineraryItem[]) => {
        console.log("Reorder requested for day", destDay);
    }, []);

    const getItemsForDay = useCallback((day: number) => {
        return items.filter(i => i.day === day);
    }, [items]);

    const updateTaxConfig = useCallback((config: Partial<TaxConfig>) => {
        setTaxConfig(prev => ({ ...prev, ...config }));
    }, []);

    const value = useMemo(() => ({
        step,
        setStep,
        tripDetails,
        items,
        currency,
        taxConfig,
        subtotal,
        taxAmount,
        grandTotal,
        updateTripDetails,
        addItem,
        updateItem,
        removeItem,
        replaceAllItems,
        reorderItems,
        getItemsForDay,
        setCurrency,
        updateTaxConfig,
        formatCurrency,
        convertCurrency
    }), [step, tripDetails, items, currency, taxConfig, subtotal, taxAmount, grandTotal,
        updateTripDetails, addItem, updateItem, removeItem, replaceAllItems, reorderItems,
        getItemsForDay, updateTaxConfig, formatCurrency, convertCurrency]);

    return (
        <ItineraryContext.Provider value={value}>
            {children}
        </ItineraryContext.Provider>
    );
};
