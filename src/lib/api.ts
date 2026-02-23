import { supabase } from './supabase';
import { Package, Booking, Lead, BookingStatus, StaffMember, Customer, MasterRoomType, MasterMealPlan, MasterActivity, MasterTransport, MasterPlan, MasterLeadSource, MasterTermsTemplate, CMSBanner, CMSTestimonial, CMSGalleryImage, CMSPost, FollowUp, Proposal, DailyTarget, TimeSession, AssignmentRule, UserActivity, Campaign, MasterHotel, Task, AuditLog } from '../../types';

const mapPackage = (row: any): Package => ({
    id: row.id,
    title: row.title,
    days: row.days,
    groupSize: row.group_size || 'Family',
    location: row.location || '',
    description: row.description || '',
    price: row.price,
    image: row.image || '',
    remainingSeats: row.remaining_seats,
    highlights: (row.features || []).map((f: string) => ({ icon: 'star', label: f })), // Legacy array of strings
    itinerary: [], // Requires separate fetch or JSON column parsing if implemented
    gallery: [],
    theme: row.theme || 'Tour',
    overview: row.overview || row.description || '',
    status: row.status as any || 'Active',
    offerEndTime: row.offer_end_time,
    included: row.included || [],
    notIncluded: row.not_included || [],
    builderData: row.builder_data
});

export const api = {
    // --- PACKAGES ---
    getPackages: async (): Promise<Package[]> => {
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('API Error (getPackages):', error);
            throw new Error(error.message || 'Failed to fetch packages');
        }
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
            remaining_seats: pkg.remainingSeats ?? 10,
            group_size: pkg.groupSize || 'Family',
            theme: pkg.theme || 'Tour',
            overview: pkg.overview || pkg.description || '',
            status: pkg.status || 'Active',
            offer_end_time: pkg.offerEndTime,
            included: pkg.included || [],
            not_included: pkg.notIncluded || [],
            builder_data: pkg.builderData
        };

        const { data, error } = await supabase.from('packages').insert(dbPkg).select().single();
        if (error) {
            console.error('API Error (createPackage):', error);
            throw new Error(error.message || 'Failed to create package');
        }
        return mapPackage(data);
    },

    updatePackage: async (id: string, pkg: Partial<Package>) => {
        const dbPkg: any = {};
        if (pkg.title !== undefined) dbPkg.title = pkg.title;
        if (pkg.description !== undefined) dbPkg.description = pkg.description;
        if (pkg.price !== undefined) dbPkg.price = pkg.price;
        if (pkg.location !== undefined) dbPkg.location = pkg.location;
        if (pkg.days !== undefined) dbPkg.days = pkg.days;
        if (pkg.image !== undefined) dbPkg.image = pkg.image;
        if (pkg.highlights !== undefined) dbPkg.features = pkg.highlights.map(h => h.label);
        if (pkg.remainingSeats !== undefined) dbPkg.remaining_seats = pkg.remainingSeats;
        if (pkg.groupSize !== undefined) dbPkg.group_size = pkg.groupSize;
        if (pkg.theme !== undefined) dbPkg.theme = pkg.theme;
        if (pkg.overview !== undefined) dbPkg.overview = pkg.overview;
        if (pkg.status !== undefined) dbPkg.status = pkg.status;
        if (pkg.offerEndTime !== undefined) dbPkg.offer_end_time = pkg.offerEndTime;
        if (pkg.included !== undefined) dbPkg.included = pkg.included;
        if (pkg.notIncluded !== undefined) dbPkg.not_included = pkg.notIncluded;
        if (pkg.builderData !== undefined) dbPkg.builder_data = pkg.builderData;

        const { error } = await supabase.from('packages').update(dbPkg).eq('id', id);
        if (error) {
            console.error(`API Error (updatePackage ${id}):`, error);
            throw new Error(error.message || 'Failed to update package');
        }
    },

    deletePackage: async (id: string) => {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deletePackage ${id}):`, error);
            throw new Error(error.message || 'Failed to delete package');
        }
    },

    // --- TRANSACTIONS & SYSTEM ---
    generateInvoiceNumber: async (type: string): Promise<string> => {
        const { data, error } = await supabase.rpc('generate_invoice_number', { param_type: type });
        if (error) {
            console.error('API Error (generateInvoiceNumber):', error);
            throw new Error(error.message || 'Failed to generate invoice number');
        }
        return (data || []) as string;
    },

    bookInventorySlot: async (dateStr: string, paxCount: number): Promise<void> => {
        const { data, error } = await supabase.rpc('book_inventory_slot', { p_date: dateStr, p_pax_count: paxCount });
        if (error) {
            console.error('API Error (bookInventorySlot RPC):', error);
            throw new Error(error.message || 'Failed to lock inventory');
        }
        if (data && !data.success) {
            throw new Error(data.error || 'Inventory locking failed');
        }
    },

    unlockInventorySlot: async (dateStr: string, paxCount: number): Promise<void> => {
        const { data, error } = await supabase.rpc('unlock_inventory_slot', { p_date: dateStr, p_pax_count: paxCount });
        if (error) {
            console.error('API Error (unlockInventorySlot RPC):', error);
            throw new Error(error.message || 'Failed to unlock inventory');
        }
        if (data && !data.success) {
            throw new Error(data.error || 'Inventory unlocking failed');
        }
    },

    createBookingTransaction: async (bookingId: string, tx: any) => {
        const { error } = await supabase.from('booking_transactions').insert({
            booking_id: bookingId,
            date: tx.date,
            amount: tx.amount,
            type: tx.type,
            method: tx.method,
            reference: tx.reference,
            notes: tx.notes
        });
        if (error) {
            console.error('API Error (createBookingTransaction):', error);
            throw new Error(error.message || 'Failed to save booking transaction');
        }
    },

    createAccountTransaction: async (accountId: string, tx: any) => {
        const { error } = await supabase.from('account_transactions').insert({
            account_id: accountId,
            date: tx.date,
            amount: tx.amount,
            type: tx.type,
            status: tx.status || 'Pending',
            description: tx.description,
            reference: tx.reference
        });
        if (error) {
            console.error('API Error (createAccountTransaction):', error);
            throw new Error(error.message || 'Failed to save account transaction');
        }
    },

    updateAccountTransactionStatus: async (txId: string, status: string) => {
        const { error } = await supabase.from('account_transactions').update({ status }).eq('id', txId);
        if (error) {
            console.error('API Error (updateAccountTransactionStatus):', error);
            throw new Error(error.message || 'Failed to update transaction status');
        }
    },

    // --- BOOKINGS ---
    getBookings: async (limit: number = 100): Promise<Booking[]> => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, packages(title)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('API Error (getBookings):', error);
            throw new Error(error.message || 'Failed to fetch bookings');
        }

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

        if (error) {
            console.error('API Error (createBooking):', error);
            throw new Error(error.message || 'Failed to create booking');
        }
        return data;
    },

    updateBookingStatus: async (id: string, status: string) => {
        const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
        if (error) {
            console.error(`API Error (updateBookingStatus ${id}):`, error);
            throw new Error(error.message || 'Failed to update booking status');
        }
    },

    updateBooking: async (id: string, updates: Partial<Booking>) => {
        const { error } = await supabase.from('bookings').update({
            customer_name: updates.customer,
            email: updates.email,
            phone: updates.phone,
            date: updates.date,
            amount: updates.amount,
            package_id: updates.packageId
        }).eq('id', id);

        if (error) {
            console.error(`API Error (updateBooking ${id}):`, error);
            throw new Error(error.message || 'Failed to update booking');
        }
    },

    deleteBooking: async (id: string) => {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deleteBooking ${id}):`, error);
            throw new Error(error.message || 'Failed to delete booking');
        }
    },

    // --- LEADS ---
    getLeads: async (limit: number = 100): Promise<Lead[]> => {
        const { data, error } = await supabase.from('leads').select('*, lead_logs(*)').order('created_at', { ascending: false }).limit(limit);
        if (error) {
            console.error('API Error (getLeads):', error);
            throw new Error(error.message || 'Failed to fetch leads');
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            location: row.location || '',
            destination: row.destination,
            startDate: row.start_date,
            endDate: row.end_date,
            travelers: row.travelers || 'Unknown',
            budget: row.budget || 'Unknown',
            type: row.type || 'Tour',
            status: row.status as any,
            priority: row.priority || 'Medium',
            potentialValue: Number(row.potential_value) || 0,
            addedOn: row.created_at,
            source: row.source || 'Website',
            preferences: row.preferences,
            logs: (row.lead_logs || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((l: any) => ({
                id: l.id,
                type: l.type,
                content: l.content,
                timestamp: l.timestamp
            })),
            avatarColor: row.avatar_color,
            assignedTo: row.assigned_to,
            whatsapp: row.whatsapp,
            isWhatsappSame: row.is_whatsapp_same,
            aiScore: row.ai_score,
            aiSummary: row.ai_summary,
            serviceType: row.service_type,
            paxAdult: row.pax_adult,
            paxChild: row.pax_child,
            paxInfant: row.pax_infant
        }));
    },

    createLead: async (lead: Partial<Lead>) => {
        const { error } = await supabase.from('leads').insert({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            location: lead.location,
            destination: lead.destination,
            start_date: lead.startDate,
            end_date: lead.endDate,
            travelers: lead.travelers,
            budget: lead.budget,
            type: lead.type || 'Tour',
            status: lead.status || 'New',
            priority: lead.priority || 'Medium',
            potential_value: lead.potentialValue || 0,
            source: lead.source || 'Website',
            preferences: lead.preferences,
            avatar_color: lead.avatarColor,
            assigned_to: lead.assignedTo,
            whatsapp: lead.whatsapp,
            is_whatsapp_same: lead.isWhatsappSame,
            service_type: lead.serviceType,
            pax_adult: lead.paxAdult,
            pax_child: lead.paxChild,
            pax_infant: lead.paxInfant
        });
        if (error) {
            console.error('API Error (createLead):', error);
            throw new Error(error.message || 'Failed to create lead');
        }
    },

    updateLead: async (id: string, updates: Partial<Lead>) => {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.travelers !== undefined) dbUpdates.travelers = updates.travelers;
        if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.potentialValue !== undefined) dbUpdates.potential_value = updates.potentialValue;
        if (updates.source !== undefined) dbUpdates.source = updates.source;
        if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;
        if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
        if (updates.isWhatsappSame !== undefined) dbUpdates.is_whatsapp_same = updates.isWhatsappSame;
        if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
        if (updates.paxAdult !== undefined) dbUpdates.pax_adult = updates.paxAdult;
        if (updates.paxChild !== undefined) dbUpdates.pax_child = updates.paxChild;
        if (updates.paxInfant !== undefined) dbUpdates.pax_infant = updates.paxInfant;

        const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id);
        if (error) {
            console.error(`API Error (updateLead ${id}):`, error);
            throw new Error(error.message || 'Failed to update lead');
        }
    },

    deleteLead: async (id: string) => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deleteLead ${id}):`, error);
            throw new Error(error.message || 'Failed to delete lead');
        }
    },

    getLeadLogs: async (leadId: string) => {
        const { data, error } = await supabase.from('lead_logs').select('*').eq('lead_id', leadId).order('timestamp', { ascending: false });
        if (error) {
            console.error(`API Error (getLeadLogs ${leadId}):`, error);
            throw new Error(error.message || 'Failed to fetch lead logs');
        }
        return (data || []).map((row: any) => ({
            id: row.id,
            type: row.type,
            content: row.content,
            timestamp: row.timestamp
        }));
    },

    createLeadLog: async (leadId: string, log: any) => {
        const { error } = await supabase.from('lead_logs').insert({
            lead_id: leadId,
            type: log.type,
            content: log.content,
            timestamp: log.timestamp || new Date().toISOString()
        });
        if (error) {
            console.error('API Error (createLeadLog):', error);
            throw new Error(error.message || 'Failed to create lead log');
        }
    },

    // --- INVENTORY ---
    getInventory: async (): Promise<Record<number, any>> => {
        // Fetch for current month/future. For MVP fetch all to map
        const { data, error } = await supabase.from('daily_inventory').select('*');
        if (error) {
            console.error('API Error (getInventory):', error);
            throw new Error(error.message || 'Failed to fetch inventory');
        }

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
        if (error) {
            console.error(`API Error (updateInventory ${dateStr}):`, error);
            throw new Error(error.message || 'Failed to update inventory');
        }
    },

    // --- VENDORS ---
    getVendors: async () => {
        const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('API Error (getVendors):', error);
            throw new Error(error.message || 'Failed to fetch vendors');
        }
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
        if (error) {
            console.error('API Error (createVendor):', error);
            throw new Error(error.message || 'Failed to create vendor');
        }
        return data;
    },

    // --- ACCOUNTS ---
    getAccounts: async () => {
        const { data, error } = await supabase.from('accounts').select('*, account_transactions(*)').order('created_at', { ascending: false });
        if (error) {
            console.error('API Error (getAccounts):', error);
            throw new Error(error.message || 'Failed to fetch accounts');
        }
        return (data || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            companyName: a.company_name,
            type: a.type,
            email: a.email,
            phone: a.phone,
            currentBalance: a.current_balance,
            status: a.status,
            transactions: (a.account_transactions || [])
                .sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())
                .map((t: any) => ({
                    id: t.id,
                    date: t.date,
                    amount: Number(t.amount),
                    type: t.type,
                    status: t.status || 'Pending',
                    description: t.description,
                    reference: t.reference
                }))
        }));
    },

    updateAccount: async (id: string, updates: any) => {
        const dbUpdates: any = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.currentBalance !== undefined) dbUpdates.current_balance = updates.currentBalance;

        const { error } = await supabase.from('accounts').update(dbUpdates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update account');
    },

    createAccount: async (acc: any) => {
        const { data, error } = await supabase.from('accounts').insert({
            name: acc.name,
            company_name: acc.companyName,
            type: acc.type,
            email: acc.email,
            phone: acc.phone
        }).select().single();
        if (error) {
            console.error('API Error (createAccount):', error);
            throw new Error(error.message || 'Failed to create account');
        }
        return data;
    },

    // --- STAFF ---
    getStaff: async (): Promise<StaffMember[]> => {
        const { data, error } = await supabase.from('staff_members').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('API Error (getStaff):', error);
            throw new Error(error.message || 'Failed to fetch staff');
        }
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

    getStaffByEmail: async (email: string): Promise<StaffMember | null> => {
        const { data, error } = await supabase.from('staff_members').select('*').eq('email', email).single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
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

    createStaff: async (staff: Partial<StaffMember>, password?: string) => {
        // 1. If password provided, create Auth User via Edge Function
        if (password) {
            try {
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({ email: staff.email, password, role: staff.role })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('API Error (create-user HTTP):', response.status, errorData);
                    throw new Error(errorData.error || `Failed to create auth user (Status: ${response.status})`);
                }
            } catch (err: any) {
                console.error('API Error (create-user edge function fetch):', err);
                throw new Error(err.message || 'Failed to connect to auth service');
            }
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

        if (error) {
            console.error('API Error (createStaff record):', error);
            throw new Error(error.message || 'Failed to create staff record');
        }

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
        if (error) {
            console.error(`API Error (updateStaff ${id}):`, error);
            throw new Error(error.message || 'Failed to update staff member');
        }
    },

    deleteStaff: async (id: number) => {
        const { error } = await supabase.from('staff_members').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deleteStaff ${id}):`, error);
            throw new Error(error.message || 'Failed to delete staff member');
        }
    },

    // --- CUSTOMERS ---
    getCustomers: async (): Promise<Customer[]> => {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('API Error (getCustomers):', error);
            throw new Error(error.message || 'Failed to fetch customers');
        }
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

    createCustomer: async (customer: Partial<Customer>) => {
        const { data, error } = await supabase.from('customers').insert({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            location: customer.location,
            type: customer.type || 'New',
            status: customer.status || 'Active',
            total_spent: customer.totalSpent || 0,
            bookings_count: customer.bookingsCount || 0
        }).select().single();
        if (error) {
            console.error('API Error (createCustomer):', error);
            throw new Error(error.message || 'Failed to create customer');
        }
        return data;
    },

    updateCustomer: async (id: string, updates: Partial<Customer>) => {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;
        if (updates.bookingsCount !== undefined) dbUpdates.bookings_count = updates.bookingsCount;

        const { error } = await supabase.from('customers').update(dbUpdates).eq('id', id);
        if (error) {
            console.error(`API Error (updateCustomer ${id}):`, error);
            throw new Error(error.message || 'Failed to update customer');
        }
    },

    deleteCustomer: async (id: string) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deleteCustomer ${id}):`, error);
            throw new Error(error.message || 'Failed to delete customer');
        }
    },

    // --- CAMPAIGNS ---
    getCampaigns: async (): Promise<Campaign[]> => {
        const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('API Error (getCampaigns):', error);
            throw new Error(error.message || 'Failed to fetch campaigns');
        }
        return (data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            audience: c.audience,
            status: c.status,
            metrics: c.metrics || { sent: 0, opened: 0, clicked: 0 }
        }));
    },
    createCampaign: async (campaign: Partial<Campaign>) => {
        const { error } = await supabase.from('campaigns').insert({
            name: campaign.name,
            type: campaign.type,
            audience: campaign.audience,
            status: campaign.status || 'Draft',
            metrics: campaign.metrics || { sent: 0, opened: 0, clicked: 0 }
        });
        if (error) {
            console.error('API Error (createCampaign):', error);
            throw new Error(error.message || 'Failed to create campaign');
        }
    },

    // --- MASTERS ---
    getLocations: async () => {
        const { data, error } = await supabase.from('master_locations').select('*').order('name', { ascending: true });
        if (error) {
            console.error('API Error (getLocations):', error);
            throw new Error(error.message || 'Failed to fetch locations');
        }
        return data;
    },
    createMasterLocation: async (location: any) => {
        const { error } = await supabase.from('master_locations').insert([location]);
        if (error) throw new Error(error.message);
    },
    updateMasterLocation: async (id: string, updates: any) => {
        const { error } = await supabase.from('master_locations').update(updates).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteMasterLocation: async (id: string) => {
        const { error } = await supabase.from('master_locations').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    // Hotels
    getMasterHotels: async (): Promise<MasterHotel[]> => {
        const { data, error } = await supabase.from('master_hotels').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('API Error (getMasterHotels):', error);
            throw new Error(error.message || 'Failed to fetch custom hotels');
        }
        return (data || []).map((h: any) => ({
            id: h.id,
            name: h.name,
            locationId: h.location_id,
            rating: h.rating,
            amenities: h.amenities || [],
            pricePerNight: h.price_per_night,
            image: h.image,
            status: h.status
        }));
    },
    createMasterHotel: async (hotel: Partial<MasterHotel>) => {
        const { error } = await supabase.from('master_hotels').insert({
            name: hotel.name,
            location_id: hotel.locationId,
            rating: hotel.rating,
            amenities: hotel.amenities,
            price_per_night: hotel.pricePerNight,
            image: hotel.image,
            status: hotel.status || 'Active'
        });
        if (error) {
            console.error('API Error (createMasterHotel):', error);
            throw new Error(error.message || 'Failed to create hotel');
        }
    },
    updateMasterHotel: async (id: string, hotel: Partial<MasterHotel>) => {
        const dbHotel: any = {};
        if (hotel.name !== undefined) dbHotel.name = hotel.name;
        if (hotel.locationId !== undefined) dbHotel.location_id = hotel.locationId;
        if (hotel.rating !== undefined) dbHotel.rating = hotel.rating;
        if (hotel.amenities !== undefined) dbHotel.amenities = hotel.amenities;
        if (hotel.pricePerNight !== undefined) dbHotel.price_per_night = hotel.pricePerNight;
        if (hotel.image !== undefined) dbHotel.image = hotel.image;
        if (hotel.status !== undefined) dbHotel.status = hotel.status;
        const { error } = await supabase.from('master_hotels').update(dbHotel).eq('id', id);
        if (error) {
            console.error(`API Error (updateMasterHotel ${id}):`, error);
            throw new Error(error.message || 'Failed to update hotel');
        }
    },
    deleteMasterHotel: async (id: string) => {
        const { error } = await supabase.from('master_hotels').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deleteMasterHotel ${id}):`, error);
            throw new Error(error.message || 'Failed to delete hotel');
        }
    },

    // --- TASKS ---
    getTasks: async (): Promise<Task[]> => {
        const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
        if (error) {
            console.error('API Error (getTasks):', error);
            throw new Error(error.message || 'Failed to fetch tasks');
        }
        return (data || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            assignedTo: t.assigned_to,
            assignedBy: t.assigned_by,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date,
            createdAt: t.created_at,
            completedAt: t.completed_at,
            relatedLeadId: t.related_lead_id,
            relatedBookingId: t.related_booking_id
        }));
    },
    createTask: async (task: Partial<Task>) => {
        const { error } = await supabase.from('tasks').insert({
            title: task.title,
            description: task.description,
            assigned_to: task.assignedTo,
            assigned_by: task.assignedBy,
            status: task.status || 'Pending',
            priority: task.priority || 'Medium',
            due_date: task.dueDate,
            completed_at: task.completedAt,
            related_lead_id: task.relatedLeadId,
            related_booking_id: task.relatedBookingId
        });
        if (error) {
            console.error('API Error (createTask):', error);
            throw new Error(error.message || 'Failed to create task');
        }
    },
    updateTask: async (id: string, updates: Partial<Task>) => {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.assignedBy !== undefined) dbUpdates.assigned_by = updates.assignedBy;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        if (updates.relatedLeadId !== undefined) dbUpdates.related_lead_id = updates.relatedLeadId;
        if (updates.relatedBookingId !== undefined) dbUpdates.related_booking_id = updates.relatedBookingId;
        const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
        if (error) {
            console.error(`API Error (updateTask ${id}):`, error);
            throw new Error(error.message || 'Failed to update task');
        }
    },
    deleteTask: async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
            console.error(`API Error (deleteTask ${id}):`, error);
            throw new Error(error.message || 'Failed to delete task');
        }
    },

    // --- PHASE 3: MASTER DATA ---
    getMasterRoomTypes: async (): Promise<MasterRoomType[]> => {
        const { data, error } = await supabase.from('master_room_types').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterRoomType[];
    },
    createMasterRoomType: async (item: Partial<MasterRoomType>) => {
        const { error } = await supabase.from('master_room_types').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create room type');
    },
    updateMasterRoomType: async (id: string, updates: Partial<MasterRoomType>) => {
        const { error } = await supabase.from('master_room_types').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update room type');
    },
    deleteMasterRoomType: async (id: string) => {
        const { error } = await supabase.from('master_room_types').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete room type');
    },

    getMasterMealPlans: async (): Promise<MasterMealPlan[]> => {
        const { data, error } = await supabase.from('master_meal_plans').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterMealPlan[];
    },
    createMasterMealPlan: async (item: Partial<MasterMealPlan>) => {
        const { error } = await supabase.from('master_meal_plans').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create meal plan');
    },
    updateMasterMealPlan: async (id: string, updates: Partial<MasterMealPlan>) => {
        const { error } = await supabase.from('master_meal_plans').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update meal plan');
    },
    deleteMasterMealPlan: async (id: string) => {
        const { error } = await supabase.from('master_meal_plans').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete meal plan');
    },

    getMasterActivities: async (): Promise<MasterActivity[]> => {
        const { data, error } = await supabase.from('master_activities').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterActivity[];
    },
    createMasterActivity: async (item: Partial<MasterActivity>) => {
        const { error } = await supabase.from('master_activities').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create activity');
    },
    updateMasterActivity: async (id: string, updates: Partial<MasterActivity>) => {
        const { error } = await supabase.from('master_activities').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update activity');
    },
    deleteMasterActivity: async (id: string) => {
        const { error } = await supabase.from('master_activities').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete activity');
    },

    getMasterTransports: async (): Promise<MasterTransport[]> => {
        const { data, error } = await supabase.from('master_transports').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterTransport[];
    },
    createMasterTransport: async (item: Partial<MasterTransport>) => {
        const { error } = await supabase.from('master_transports').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create transport');
    },
    updateMasterTransport: async (id: string, updates: Partial<MasterTransport>) => {
        const { error } = await supabase.from('master_transports').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update transport');
    },
    deleteMasterTransport: async (id: string) => {
        const { error } = await supabase.from('master_transports').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete transport');
    },

    getMasterPlans: async (): Promise<MasterPlan[]> => {
        const { data, error } = await supabase.from('master_plans').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterPlan[];
    },
    createMasterPlan: async (item: Partial<MasterPlan>) => {
        const { error } = await supabase.from('master_plans').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create plan');
    },
    updateMasterPlan: async (id: string, updates: Partial<MasterPlan>) => {
        const { error } = await supabase.from('master_plans').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update plan');
    },
    deleteMasterPlan: async (id: string) => {
        const { error } = await supabase.from('master_plans').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete plan');
    },

    getMasterLeadSources: async (): Promise<MasterLeadSource[]> => {
        const { data, error } = await supabase.from('master_lead_sources').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterLeadSource[];
    },
    createMasterLeadSource: async (item: Partial<MasterLeadSource>) => {
        const { error } = await supabase.from('master_lead_sources').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create lead source');
    },
    updateMasterLeadSource: async (id: string, updates: Partial<MasterLeadSource>) => {
        const { error } = await supabase.from('master_lead_sources').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update lead source');
    },
    deleteMasterLeadSource: async (id: string) => {
        const { error } = await supabase.from('master_lead_sources').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete lead source');
    },

    getMasterTermsTemplates: async (): Promise<MasterTermsTemplate[]> => {
        const { data, error } = await supabase.from('master_terms_templates').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []) as MasterTermsTemplate[];
    },
    createMasterTermsTemplate: async (item: Partial<MasterTermsTemplate>) => {
        const { error } = await supabase.from('master_terms_templates').insert([item]);
        if (error) throw new Error(error.message || 'Failed to create terms template');
    },
    updateMasterTermsTemplate: async (id: string, updates: Partial<MasterTermsTemplate>) => {
        const { error } = await supabase.from('master_terms_templates').update(updates).eq('id', id);
        if (error) throw new Error(error.message || 'Failed to update terms template');
    },
    deleteMasterTermsTemplate: async (id: string) => {
        const { error } = await supabase.from('master_terms_templates').delete().eq('id', id);
        if (error) throw new Error(error.message || 'Failed to delete terms template');
    },

    // --- PHASE 3: CMS ---
    getCMSBanners: async (): Promise<CMSBanner[]> => {
        const { data, error } = await supabase.from('cms_banners').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, imageUrl: r.image_url, ctaText: r.cta_text, ctaLink: r.cta_link, isActive: r.is_active }));
    },
    createCMSBanner: async (item: Partial<CMSBanner>) => {
        const dbItem = { ...item, image_url: item.imageUrl, cta_text: item.ctaText, cta_link: item.ctaLink, is_active: item.isActive };
        delete (dbItem as any).imageUrl; delete (dbItem as any).ctaText; delete (dbItem as any).ctaLink; delete (dbItem as any).isActive;
        const { error } = await supabase.from('cms_banners').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateCMSBanner: async (id: string, updates: Partial<CMSBanner>) => {
        const dbItem = { ...updates, image_url: updates.imageUrl, cta_text: updates.ctaText, cta_link: updates.ctaLink, is_active: updates.isActive };
        if (dbItem.imageUrl === undefined) delete dbItem.image_url;
        if (dbItem.ctaText === undefined) delete dbItem.cta_text;
        if (dbItem.ctaLink === undefined) delete dbItem.cta_link;
        if (dbItem.isActive === undefined) delete dbItem.is_active;
        delete (dbItem as any).imageUrl; delete (dbItem as any).ctaText; delete (dbItem as any).ctaLink; delete (dbItem as any).isActive;
        const { error } = await supabase.from('cms_banners').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteCMSBanner: async (id: string) => {
        const { error } = await supabase.from('cms_banners').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getCMSTestimonials: async (): Promise<CMSTestimonial[]> => {
        const { data, error } = await supabase.from('cms_testimonials').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, customerName: r.customer_name, avatarUrl: r.avatar_url, isActive: r.is_active }));
    },
    createCMSTestimonial: async (item: Partial<CMSTestimonial>) => {
        const dbItem = { ...item, customer_name: item.customerName, avatar_url: item.avatarUrl, is_active: item.isActive };
        delete (dbItem as any).customerName; delete (dbItem as any).avatarUrl; delete (dbItem as any).isActive;
        const { error } = await supabase.from('cms_testimonials').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateCMSTestimonial: async (id: string, updates: Partial<CMSTestimonial>) => {
        const dbItem = { ...updates, customer_name: updates.customerName, avatar_url: updates.avatarUrl, is_active: updates.isActive };
        if (dbItem.customerName === undefined) delete dbItem.customer_name;
        if (dbItem.avatarUrl === undefined) delete dbItem.avatar_url;
        if (dbItem.isActive === undefined) delete dbItem.is_active;
        delete (dbItem as any).customerName; delete (dbItem as any).avatarUrl; delete (dbItem as any).isActive;
        const { error } = await supabase.from('cms_testimonials').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteCMSTestimonial: async (id: string) => {
        const { error } = await supabase.from('cms_testimonials').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getCMSGalleryImages: async (): Promise<CMSGalleryImage[]> => {
        const { data, error } = await supabase.from('cms_gallery_images').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, imageUrl: r.image_url }));
    },
    createCMSGalleryImage: async (item: Partial<CMSGalleryImage>) => {
        const dbItem = { ...item, image_url: item.imageUrl };
        delete (dbItem as any).imageUrl;
        const { error } = await supabase.from('cms_gallery_images').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    deleteCMSGalleryImage: async (id: string) => {
        const { error } = await supabase.from('cms_gallery_images').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getCMSPosts: async (): Promise<CMSPost[]> => {
        const { data, error } = await supabase.from('cms_posts').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, coverImage: r.cover_image, publishedDate: r.published_date }));
    },
    createCMSPost: async (item: Partial<CMSPost>) => {
        const dbItem = { ...item, cover_image: item.coverImage, published_date: item.publishedDate };
        delete (dbItem as any).coverImage; delete (dbItem as any).publishedDate;
        const { error } = await supabase.from('cms_posts').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateCMSPost: async (id: string, updates: Partial<CMSPost>) => {
        const dbItem = { ...updates, cover_image: updates.coverImage, published_date: updates.publishedDate };
        if (dbItem.coverImage === undefined) delete dbItem.cover_image;
        if (dbItem.publishedDate === undefined) delete dbItem.published_date;
        delete (dbItem as any).coverImage; delete (dbItem as any).publishedDate;
        const { error } = await supabase.from('cms_posts').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteCMSPost: async (id: string) => {
        const { error } = await supabase.from('cms_posts').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- PHASE 3: PRODUCTIVITY & EXTRAS ---
    getFollowUps: async (): Promise<FollowUp[]> => {
        const { data, error } = await supabase.from('follow_ups').select('*, leads(name)').order('scheduled_at', { ascending: true });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map((r: any) => ({
            ...r,
            leadId: r.lead_id,
            leadName: r.leads?.name || 'Unknown',
            scheduledAt: r.scheduled_at,
            reminderEnabled: r.reminder_enabled,
            assignedTo: r.assigned_to,
            completedAt: r.completed_at,
            createdAt: r.created_at
        }));
    },
    createFollowUp: async (item: Partial<FollowUp>) => {
        const dbItem = { ...item, lead_id: item.leadId, scheduled_at: item.scheduledAt, reminder_enabled: item.reminderEnabled, assigned_to: item.assignedTo, completed_at: item.completedAt };
        delete (dbItem as any).leadId; delete (dbItem as any).leadName; delete (dbItem as any).scheduledAt; delete (dbItem as any).reminderEnabled; delete (dbItem as any).assignedTo; delete (dbItem as any).completedAt; delete (dbItem as any).createdAt;
        const { error } = await supabase.from('follow_ups').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateFollowUp: async (id: string, updates: Partial<FollowUp>) => {
        const dbItem = { ...updates, lead_id: updates.leadId, scheduled_at: updates.scheduledAt, reminder_enabled: updates.reminderEnabled, assigned_to: updates.assignedTo, completed_at: updates.completedAt };
        if (dbItem.leadId === undefined) delete dbItem.lead_id;
        if (dbItem.scheduledAt === undefined) delete dbItem.scheduled_at;
        if (dbItem.reminderEnabled === undefined) delete dbItem.reminder_enabled;
        if (dbItem.assignedTo === undefined) delete dbItem.assigned_to;
        if (dbItem.completedAt === undefined) delete dbItem.completed_at;
        delete (dbItem as any).leadId; delete (dbItem as any).leadName; delete (dbItem as any).scheduledAt; delete (dbItem as any).reminderEnabled; delete (dbItem as any).assignedTo; delete (dbItem as any).completedAt; delete (dbItem as any).createdAt;
        const { error } = await supabase.from('follow_ups').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteFollowUp: async (id: string) => {
        const { error } = await supabase.from('follow_ups').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getProposals: async (): Promise<Proposal[]> => {
        const { data, error } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, leadId: r.lead_id, validUntil: r.valid_until, createdAt: r.created_at }));
    },
    createProposal: async (item: Partial<Proposal>) => {
        const dbItem = { ...item, lead_id: item.leadId, valid_until: item.validUntil };
        delete (dbItem as any).leadId; delete (dbItem as any).validUntil; delete (dbItem as any).createdAt;
        const { error } = await supabase.from('proposals').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateProposal: async (id: string, updates: Partial<Proposal>) => {
        const dbItem = { ...updates, lead_id: updates.leadId, valid_until: updates.validUntil };
        if (dbItem.leadId === undefined) delete dbItem.lead_id;
        if (dbItem.validUntil === undefined) delete dbItem.valid_until;
        delete (dbItem as any).leadId; delete (dbItem as any).validUntil; delete (dbItem as any).createdAt;
        const { error } = await supabase.from('proposals').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteProposal: async (id: string) => {
        const { error } = await supabase.from('proposals').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getDailyTargets: async (): Promise<DailyTarget[]> => {
        const { data, error } = await supabase.from('daily_targets').select('*').order('date', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, staffId: r.staff_id, targetLeads: r.target_leads, targetCalls: r.target_calls, targetConversions: r.target_conversions, targetBookings: r.target_bookings, actualLeads: r.actual_leads, actualCalls: r.actual_calls, actualConversions: r.actual_conversions, actualBookings: r.actual_bookings }));
    },
    createDailyTarget: async (item: Partial<DailyTarget>) => {
        const dbItem = { ...item, staff_id: item.staffId, target_leads: item.targetLeads, target_calls: item.targetCalls, target_conversions: item.targetConversions, target_bookings: item.targetBookings, actual_leads: item.actualLeads, actual_calls: item.actualCalls, actual_conversions: item.actualConversions, actual_bookings: item.actualBookings };
        delete (dbItem as any).staffId; delete (dbItem as any).targetLeads; delete (dbItem as any).targetCalls; delete (dbItem as any).targetConversions; delete (dbItem as any).targetBookings; delete (dbItem as any).actualLeads; delete (dbItem as any).actualCalls; delete (dbItem as any).actualConversions; delete (dbItem as any).actualBookings;
        const { error } = await supabase.from('daily_targets').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateDailyTarget: async (id: string, updates: Partial<DailyTarget>) => {
        const dbItem = { ...updates, staff_id: updates.staffId, target_leads: updates.targetLeads, target_calls: updates.targetCalls, target_conversions: updates.targetConversions, target_bookings: updates.targetBookings, actual_leads: updates.actualLeads, actual_calls: updates.actualCalls, actual_conversions: updates.actualConversions, actual_bookings: updates.actualBookings };
        if (dbItem.staffId === undefined) delete dbItem.staff_id;
        if (dbItem.targetLeads === undefined) delete dbItem.target_leads;
        if (dbItem.targetCalls === undefined) delete dbItem.target_calls;
        if (dbItem.targetConversions === undefined) delete dbItem.target_conversions;
        if (dbItem.targetBookings === undefined) delete dbItem.target_bookings;
        if (dbItem.actualLeads === undefined) delete dbItem.actual_leads;
        if (dbItem.actualCalls === undefined) delete dbItem.actual_calls;
        if (dbItem.actualConversions === undefined) delete dbItem.actual_conversions;
        if (dbItem.actualBookings === undefined) delete dbItem.actual_bookings;
        delete (dbItem as any).staffId; delete (dbItem as any).targetLeads; delete (dbItem as any).targetCalls; delete (dbItem as any).targetConversions; delete (dbItem as any).targetBookings; delete (dbItem as any).actualLeads; delete (dbItem as any).actualCalls; delete (dbItem as any).actualConversions; delete (dbItem as any).actualBookings;
        const { error } = await supabase.from('daily_targets').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },

    getTimeSessions: async (): Promise<TimeSession[]> => {
        const { data, error } = await supabase.from('time_sessions').select('*').order('start_time', { ascending: false });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, staffId: r.staff_id, taskId: r.task_id, startTime: r.start_time, endTime: r.end_time, idleTime: r.idle_time }));
    },
    createTimeSession: async (item: Partial<TimeSession>) => {
        const dbItem = { ...item, staff_id: item.staffId, task_id: item.taskId, start_time: item.startTime, end_time: item.endTime, idle_time: item.idleTime };
        delete (dbItem as any).staffId; delete (dbItem as any).taskId; delete (dbItem as any).startTime; delete (dbItem as any).endTime; delete (dbItem as any).idleTime;
        const { error } = await supabase.from('time_sessions').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateTimeSession: async (id: string, updates: Partial<TimeSession>) => {
        const dbItem = { ...updates, staff_id: updates.staffId, task_id: updates.taskId, start_time: updates.startTime, end_time: updates.endTime, idle_time: updates.idleTime };
        if (dbItem.staffId === undefined) delete dbItem.staff_id;
        if (dbItem.taskId === undefined) delete dbItem.task_id;
        if (dbItem.startTime === undefined) delete dbItem.start_time;
        if (dbItem.endTime === undefined) delete dbItem.end_time;
        if (dbItem.idleTime === undefined) delete dbItem.idle_time;
        delete (dbItem as any).staffId; delete (dbItem as any).taskId; delete (dbItem as any).startTime; delete (dbItem as any).endTime; delete (dbItem as any).idleTime;
        const { error } = await supabase.from('time_sessions').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },

    getAssignmentRules: async (): Promise<AssignmentRule[]> => {
        const { data, error } = await supabase.from('assignment_rules').select('*').order('priority', { ascending: true });
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, isActive: r.is_active, triggerOn: r.trigger_on, eligibleStaffIds: r.eligible_staff_ids, updatedAt: r.updated_at, createdAt: r.created_at }));
    },
    createAssignmentRule: async (item: Partial<AssignmentRule>) => {
        const dbItem = { ...item, is_active: item.isActive, trigger_on: item.triggerOn, eligible_staff_ids: item.eligibleStaffIds };
        delete (dbItem as any).isActive; delete (dbItem as any).triggerOn; delete (dbItem as any).eligibleStaffIds; delete (dbItem as any).createdAt; delete (dbItem as any).updatedAt;
        const { error } = await supabase.from('assignment_rules').insert([dbItem]);
        if (error) throw new Error(error.message);
    },
    updateAssignmentRule: async (id: string, updates: Partial<AssignmentRule>) => {
        const dbItem = { ...updates, is_active: updates.isActive, trigger_on: updates.triggerOn, eligible_staff_ids: updates.eligibleStaffIds, updated_at: new Date().toISOString() };
        if (dbItem.isActive === undefined) delete dbItem.is_active;
        if (dbItem.triggerOn === undefined) delete dbItem.trigger_on;
        if (dbItem.eligibleStaffIds === undefined) delete dbItem.eligible_staff_ids;
        delete (dbItem as any).isActive; delete (dbItem as any).triggerOn; delete (dbItem as any).eligibleStaffIds; delete (dbItem as any).createdAt; delete (dbItem as any).updatedAt;
        const { error } = await supabase.from('assignment_rules').update(dbItem).eq('id', id);
        if (error) throw new Error(error.message);
    },
    deleteAssignmentRule: async (id: string) => {
        const { error } = await supabase.from('assignment_rules').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getUserActivities: async (): Promise<UserActivity[]> => {
        const { data, error } = await supabase.from('user_activities').select('*').order('timestamp', { ascending: false }).limit(500);
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, staffId: r.staff_id, staffName: r.staff_name }));
    },
    createUserActivity: async (item: Partial<UserActivity>) => {
        const dbItem = { ...item, staff_id: item.staffId, staff_name: item.staffName };
        delete (dbItem as any).staffId; delete (dbItem as any).staffName;
        const { error } = await supabase.from('user_activities').insert([dbItem]);
        if (error) throw new Error(error.message);
    },

    // --- AUDIT LOGS ---
    getAuditLogs: async (): Promise<AuditLog[]> => {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(500);
        if (error) { console.error('API Error:', error); return []; }
        return (data || []).map(r => ({ ...r, performedBy: r.performed_by }));
    },
    createAuditLog: async (log: Omit<AuditLog, 'id'>) => {
        const dbLog = { ...log, performed_by: log.performedBy };
        delete (dbLog as any).performedBy;
        const { error } = await supabase.from('audit_logs').insert([dbLog]);
        if (error) throw new Error(error.message);
    },

    // --- STORAGE ---
    uploadFile: async (file: File, bucketPath: string = 'documents'): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketPath)
            .upload(filePath, file);

        if (uploadError) {
            console.error('API Error (uploadFile):', uploadError);
            throw new Error(uploadError.message || 'Failed to upload file to storage');
        }

        const { data } = supabase.storage.from(bucketPath).getPublicUrl(filePath);
        return data.publicUrl;
    }
};
