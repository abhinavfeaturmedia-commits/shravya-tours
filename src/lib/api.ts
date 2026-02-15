import { supabase } from './supabase';
import { Package, Booking, Lead, BookingStatus, StaffMember, Customer } from '../../types';

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

            packageId: row.package_id,
            invoiceNo: row.invoice_no // Map from DB
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
            payment_status: 'Unpaid',
            invoice_no: booking.invoiceNo // Attempt to save invoice number
        }).select().single();

        if (error) throw error;
        return data;
    },

    updateBookingStatus: async (id: string, status: string) => {
        const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
        if (error) throw error;
    },

    deleteBooking: async (id: string) => {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
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
    },

    // --- STAFF ---
    getStaff: async (): Promise<StaffMember[]> => {
        const { data, error } = await supabase.from('staff_members').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            role: s.role,
            userType: s.user_type,
            department: s.department,
            status: s.status,
            initials: s.initials,
            color: s.color,
            permissions: s.permissions,
            queryScope: s.query_scope,
            whatsappScope: s.whatsapp_scope,
            lastActive: s.last_active
        }));
    },

    createStaff: async (staff: Partial<StaffMember>, password?: string) => {
        // 1. If password provided, create Auth User via Edge Function
        if (password) {
            const { error } = await supabase.functions.invoke('create-user', {
                body: { email: staff.email, password, role: staff.role }
            });
            if (error) throw error;
        }

        // 2. Create Staff Profile
        const { data, error } = await supabase.from('staff_members').insert({
            name: staff.name,
            email: staff.email,
            role: staff.role,
            user_type: staff.userType,
            department: staff.department,
            status: staff.status,
            initials: staff.initials,
            color: staff.color,
            permissions: staff.permissions,
            query_scope: staff.queryScope,
            whatsapp_scope: staff.whatsappScope
        }).select().single();

        if (error) throw error;

        // Map response to StaffMember type
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            userType: data.user_type,
            department: data.department,
            status: data.status,
            initials: data.initials,
            color: data.color,
            permissions: data.permissions,
            queryScope: data.query_scope,
            whatsappScope: data.whatsapp_scope,
            lastActive: data.last_active
        };
    },

    updateStaff: async (id: number, updates: Partial<StaffMember>) => {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.role) dbUpdates.role = updates.role;
        if (updates.permissions) dbUpdates.permissions = updates.permissions;
        // ... map other fields

        const { error } = await supabase.from('staff_members').update(dbUpdates).eq('id', id);
        if (error) throw error;
    },

    deleteStaff: async (id: number) => {
        const { error } = await supabase.from('staff_members').delete().eq('id', id);
        if (error) throw error;
    },

    // --- CUSTOMERS ---
    getCustomers: async (): Promise<Customer[]> => {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            location: c.location,
            type: c.type,
            status: c.status,
            totalSpent: c.total_spent,
            bookingsCount: c.bookings_count,
            joinedDate: c.created_at
        }));
    },

    // --- MASTERS ---
    getLocations: async () => {
        const { data, error } = await supabase.from('master_locations').select('*');
        if (error) throw error;
        return data;
    }
};
