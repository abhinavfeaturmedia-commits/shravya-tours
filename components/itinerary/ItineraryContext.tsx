import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MasterHotel, MasterActivity, MasterTransport } from '../../types';

// --- Types ---

export type ServiceType = 'flight' | 'hotel' | 'activity' | 'transport' | 'note';

export interface ItineraryItem {
    id: string;
    type: ServiceType;
    day: number;
    title: string;
    description?: string;
    cost: number;

    // Specifics
    time?: string; // e.g. "10:00 AM"
    duration?: string; // e.g. "2 Hours"

    // Master Data Link
    masterId?: string;
    masterData?: MasterHotel | MasterActivity | MasterTransport | any; // Store original reference
}

interface TripDetails {
    title: string;
    startDate: string;
    duration: number; // Total days
    destination: string;
    coverImage: string;
    // guests: string; // Deprecated
    adults: number;
    children: number;
}

interface ItineraryContextType {
    // ... existing ...
    // State
    step: number;
    tripDetails: TripDetails;
    items: ItineraryItem[];

    // Computed
    totalCost: number;

    // Actions
    setStep: (step: number) => void;
    updateTripDetails: (details: Partial<TripDetails>) => void;
    addItem: (item: ItineraryItem) => void;
    updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
    removeItem: (id: string) => void;
    replaceAllItems: (items: ItineraryItem[]) => void;
    reorderItems: (destDay: number, newOrder: ItineraryItem[]) => void;

    // Helpers
    getItemsForDay: (day: number) => ItineraryItem[];
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
    const [tripDetails, setTripDetails] = useState<TripDetails>({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        duration: 3,
        destination: '',
        coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop', // Default beautiful travel image
        adults: 2,
        children: 0
    });

    // Calculate Total Cost
    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

    const updateTripDetails = (details: Partial<TripDetails>) => {
        setTripDetails(prev => ({ ...prev, ...details }));
    };

    const addItem = (item: ItineraryItem) => {
        setItems(prev => [...prev, item]);
    };

    const updateItem = (id: string, updates: Partial<ItineraryItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const replaceAllItems = (newItems: ItineraryItem[]) => {
        setItems(newItems);
    };

    // Reorder is a bit complex across days, simplistic implementation for now:
    // We just expect the UI to pass the new list of items for a specific day
    // But since we store a flat list, we need to merge.
    // Actually, for simplicity in this version, we will just rely on the day property.
    // True reordering within a day would require an 'order' index. 
    // Let's assume natural sort by time or just insertion order for now. 
    // If drag-and-drop is needed, we'll add 'orderIndex'.
    const reorderItems = (destDay: number, _newOrder: ItineraryItem[]) => {
        // Placeholder for drag-drop logic if needed later.
        console.log("Reorder requested for day", destDay);
    };

    const getItemsForDay = (day: number) => {
        return items.filter(i => i.day === day);
    };

    const value = {
        step,
        setStep,
        tripDetails,
        items,
        totalCost,
        updateTripDetails,
        addItem,
        updateItem,
        removeItem,
        replaceAllItems,
        reorderItems,
        getItemsForDay
    };

    return (
        <ItineraryContext.Provider value={value}>
            {children}
        </ItineraryContext.Provider>
    );
};
