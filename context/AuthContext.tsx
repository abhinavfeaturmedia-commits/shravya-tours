import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StaffMember, StaffPermissions } from '../types';
import { supabase } from '../src/lib/supabase';

// Helper for localStorage
const STORAGE_KEY = 'shravya_auth_data';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
};

const saveToStorage = <T,>(key: string, data: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
};

// Default permissions
const DEFAULT_PERMISSIONS: StaffPermissions = {
    transfer: { view: false, manage: false },
    dayItinerary: { view: false, manage: false },
    destinations: { view: false, manage: false },
    roomType: { view: false, manage: false },
    mealPlan: { view: false, manage: false },
    leadSource: { view: false, manage: false },
    expenseType: { view: false, manage: false },
    packageTheme: { view: false, manage: false },
    currency: { view: false, manage: false },
};

const ADMIN_PERMISSIONS: StaffPermissions = {
    transfer: { view: true, manage: true },
    dayItinerary: { view: true, manage: true },
    destinations: { view: true, manage: true },
    roomType: { view: true, manage: true },
    mealPlan: { view: true, manage: true },
    leadSource: { view: true, manage: true },
    expenseType: { view: true, manage: true },
    packageTheme: { view: true, manage: true },
    currency: { view: true, manage: true },
};

const INITIAL_STAFF: StaffMember[] = [
    {
        id: 1,
        name: 'Alice Johnson',
        initials: 'AJ',
        role: 'CEO (TravelBit Holidays)',
        department: 'Executive',
        email: 'alice@shravya.com',
        phone: '+91 98765 00001',
        status: 'Active',
        lastActive: 'Just now',
        color: 'purple',
        userType: 'Admin',
        queryScope: 'Show All Queries',
        whatsappScope: 'All Messages',
        permissions: ADMIN_PERMISSIONS,
    },
    {
        id: 2,
        name: 'Bob Smith',
        initials: 'BS',
        role: 'Manager',
        department: 'Operations',
        email: 'bob@shravya.com',
        phone: '+91 98765 00002',
        status: 'Active',
        lastActive: '2h ago',
        color: 'blue',
        userType: 'Staff',
        queryScope: 'Show All Queries',
        whatsappScope: 'Assigned Queries Messages',
        permissions: { ...DEFAULT_PERMISSIONS, destinations: { view: true, manage: true } },
    },
    {
        id: 3,
        name: 'Charlie Davis',
        initials: 'CD',
        role: 'Support',
        department: 'Support',
        email: 'support@shravya.com',
        phone: '+91 98765 00003',
        status: 'Active',
        lastActive: '5m ago',
        color: 'green',
        userType: 'Staff',
        queryScope: 'Show Assigned Query Only',
        whatsappScope: 'Assigned Queries Messages',
        permissions: DEFAULT_PERMISSIONS,
    },
];

interface AuthContextType {
    staff: StaffMember[];
    currentUser: StaffMember | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    addStaff: (member: StaffMember) => void;
    updateStaff: (id: number, member: Partial<StaffMember>) => void;
    deleteStaff: (id: number) => void;
    hasPermission: (module: keyof StaffPermissions, action: 'view' | 'manage') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Keep staff list for permission mapping (Hybrid approach)
    const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
    const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize Supabase Auth
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                mapUserToStaff(session.user.email);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                mapUserToStaff(session.user.email);
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapUserToStaff = (email: string | undefined) => {
        if (!email) return;
        // Find if this email matches a known staff member
        const matchedStaff = staff.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (matchedStaff) {
            setCurrentUser(matchedStaff);
        } else {
            // New/Unknown user - Give default restrict access or create basic profile
            const newStaff: StaffMember = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                role: 'Agent',
                userType: 'Staff',
                initials: email.substring(0, 2).toUpperCase(),
                department: 'Sales',
                status: 'Active',
                lastActive: 'Now',
                color: 'gray',
                queryScope: 'Show Assigned Query Only',
                whatsappScope: 'Assigned Queries Messages',
                permissions: DEFAULT_PERMISSIONS
            };
            setCurrentUser(newStaff);
        }
        setLoading(false);
    };

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login failed:', error.message);
            return false;
        }
        return true;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    }, []);

    // ... (Keep addStaff/updateStaff etc. for Admin UI, but they won't create Supabase users automatically yet without Cloud Functions)
    const addStaff = useCallback((member: StaffMember) => setStaff(prev => [member, ...prev]), []);
    const updateStaff = useCallback((id: number, member: Partial<StaffMember>) => setStaff(prev => prev.map(s => s.id === id ? { ...s, ...member } : s)), []);
    const deleteStaff = useCallback((id: number) => setStaff(prev => prev.filter(s => s.id !== id)), []);

    const hasPermission = useCallback(
        (module: keyof StaffPermissions, action: 'view' | 'manage'): boolean => {
            if (!currentUser) return false;
            if (currentUser.userType === 'Admin') return true;
            return currentUser.permissions?.[module]?.[action] ?? false;
        },
        [currentUser]
    );

    const value = useMemo(
        () => ({
            staff,
            currentUser,
            isAuthenticated: !!currentUser,
            isLoading: loading,
            login,
            logout,
            addStaff,
            updateStaff,
            deleteStaff,
            hasPermission,
        }),
        [staff, currentUser, loading, login, logout, addStaff, updateStaff, deleteStaff, hasPermission]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export { DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS };
