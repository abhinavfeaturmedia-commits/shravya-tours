
import { supabase } from './supabase';
import { Package, Booking, Lead, BookingStatus } from '../../types';

// Helper to map DB row to Package type
const mapPackage = (row: any): Package => ({
    id: row.id,
    title: row.title,
    days: row.days,
    groupSize: 'Family', // Default or add to DB
    location: row.location || '',
    description: row.description || '',
    price: row.price,
    image: row.image || '',
    remainingSeats: row.remaining_seats,
    highlights: (row.features || []).map((f: string) => ({ icon: 'star', label: f })), // Simple map
    itinerary: [], // Need separate table or JSON column
    gallery: [],
    theme: 'Tour',
    rating: '4.5',
    reviews: '0',
    overview: row.description || '',
    status: 'Active'
});

export const api = {
    // --- PACKAGES ---
    getPackages: async (): Promise<Package[]> => {
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapPackage);
    },

    createPackage: async (pkg: Partial<Package>) => {
        // Map App type to DB columns
        const dbPkg = {
            title: pkg.title,
            description: pkg.description,
            price: pkg.price,
            location: pkg.location,
            days: pkg.days,
            image: pkg.image,
            features: pkg.highlights?.map(h => h.label) || [],
            remaining_seats: pkg.remainingSeats ?? 10
        };

        const { data, error } = await supabase.from('packages').insert(dbPkg).select().single();
        if (error) throw error;
        return mapPackage(data);
    },

    updatePackage: async (id: string, pkg: Partial<Package>) => {
        const dbPkg: any = {};
        if (pkg.remainingSeats !== undefined) dbPkg.remaining_seats = pkg.remainingSeats;
        // Add other fields if needed for editing

        const { error } = await supabase.from('packages').update(dbPkg).eq('id', id);
        if (error) throw error;
    },

    // --- BOOKINGS ---
    getBookings: async (): Promise<Booking[]> => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, packages(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            type: 'Tour', // Default
            customer: row.customer_name,
            email: row.email,
            phone: row.phone,
            title: row.packages?.title || 'Unknown Package',
            date: row.date,
            amount: row.amount,
            status: row.status as BookingStatus,
            payment: row.payment_status === 'Paid' ? 'Paid' : 'Unpaid',
            packageId: row.package_id
        }));
    },

    createBooking: async (booking: Partial<Booking>) => {
        const { data, error } = await supabase.from('bookings').insert({
            customer_name: booking.customer,
            email: booking.email,
            phone: booking.phone,
            date: booking.date, // Ensure YYYY-MM-DD
            amount: booking.amount,
            package_id: booking.packageId,
            status: 'Pending',
            payment_status: 'Unpaid'
        }).select().single();

        if (error) throw error;
        return data;
    },

    updateBookingStatus: async (id: string, status: string) => {
        const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
        if (error) throw error;
    },

    // --- LEADS ---
    getLeads: async (): Promise<Lead[]> => {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            destination: row.destination,
            status: row.status,
            source: row.source,
            addedOn: row.created_at,
            travelers: 'Unknown', // Column missing in simple schema
            budget: 'Unknown',
            priority: 'Medium',
            potentialValue: 0,
            type: 'Tour',
            logs: []
        }));
    },

    createLead: async (lead: Partial<Lead>) => {
        const { error } = await supabase.from('leads').insert({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            destination: lead.destination,
            source: lead.source || 'Website',
            status: 'New'
        });
        if (error) throw error;
    },

    // --- INVENTORY ---
    getInventory: async (): Promise<Record<number, any>> => {
        // Fetch for current month/future. For MVP fetch all to map
        const { data, error } = await supabase.from('daily_inventory').select('*');
        if (error) throw error;

        const inventoryMap: Record<number, any> = {};
        data?.forEach((slot: any) => {
            const day = new Date(slot.date).getDate(); // Simplified mapping
            inventoryMap[day] = {
                date: day,
                capacity: slot.capacity,
                booked: slot.booked,
                price: slot.price,
                isBlocked: slot.is_blocked
            };
        });
        return inventoryMap;
    },

    updateInventory: async (dateStr: string, updates: any) => {
        // dateStr should be 'YYYY-MM-DD'
        const { error } = await supabase.from('daily_inventory').upsert({
            date: dateStr,
            ...updates
        });
        if (error) throw error;
    },

    // --- VENDORS ---
    getVendors: async () => {
        const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            category: v.category,
            location: v.location,
            contactName: v.contact_name,
            contactPhone: v.contact_phone,
            rating: v.rating,
            balanceDue: v.balance_due,
            status: 'Active',
            services: [], documents: [], transactions: [], notes: []
        }));
    },

    createVendor: async (vendor: any) => {
        const { data, error } = await supabase.from('vendors').insert({
            name: vendor.name,
            category: vendor.category,
            location: vendor.location,
            contact_name: vendor.contactName,
            contact_phone: vendor.contactPhone,
            rating: vendor.rating
        }).select().single();
        if (error) throw error;
        return data;
    },

    // --- ACCOUNTS ---
    getAccounts: async () => {
        const { data, error } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            companyName: a.company_name,
            type: a.type,
            email: a.email,
            phone: a.phone,
            currentBalance: a.current_balance,
            status: a.status,
            transactions: []
        }));
    },

    createAccount: async (acc: any) => {
        const { data, error } = await supabase.from('accounts').insert({
            name: acc.name,
            company_name: acc.companyName,
            type: acc.type,
            email: acc.email,
            phone: acc.phone
        }).select().single();
        if (error) throw error;
        return data;
    }
};
