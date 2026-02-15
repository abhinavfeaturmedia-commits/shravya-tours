import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StaffMember, StaffPermissions } from '../types';
import { supabase } from '../src/lib/supabase';
import { api } from '../src/lib/api'; // Import api helper

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
    dashboard: { view: true, manage: false },
    leads: { view: false, manage: false },
    customers: { view: false, manage: false },
    bookings: { view: false, manage: false },
    itinerary: { view: false, manage: false },
    inventory: { view: false, manage: false },
    masters: { view: false, manage: false },
    vendors: { view: false, manage: false },
    finance: { view: false, manage: false },
    marketing: { view: false, manage: false },
    staff: { view: false, manage: false },
    reports: { view: false, manage: false },
    audit: { view: false, manage: false },
};

const ADMIN_PERMISSIONS: StaffPermissions = {
    dashboard: { view: true, manage: true },
    leads: { view: true, manage: true },
    customers: { view: true, manage: true },
    bookings: { view: true, manage: true },
    itinerary: { view: true, manage: true },
    inventory: { view: true, manage: true },
    masters: { view: true, manage: true },
    vendors: { view: true, manage: true },
    finance: { view: true, manage: true },
    marketing: { view: true, manage: true },
    staff: { view: true, manage: true },
    reports: { view: true, manage: true },
    audit: { view: true, manage: true },
};

const INITIAL_STAFF: StaffMember[] = [];

interface AuthContextType {
    staff: StaffMember[];
    currentUser: StaffMember | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    addStaff: (member: StaffMember, password?: string) => void;
    updateStaff: (id: number, member: Partial<StaffMember>) => void;
    deleteStaff: (id: number) => void;
    hasPermission: (module: keyof StaffPermissions, action: 'view' | 'manage') => boolean;
    masqueradeAs: (staffId: number) => void;
    stopMasquerading: () => void;
    isMasquerading: boolean;
    realUser: StaffMember | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock persistence key
    const STORAGE_KEY_MOCK = 'shravya_mock_session';

    // Mock Admin User Constant
    const MOCK_ADMIN_USER: StaffMember = {
        id: 999,
        name: 'Admin User',
        email: 'admin@shravyatours.com',
        role: 'Administrator',
        userType: 'Admin',
        initials: 'AD',
        department: 'Executive',
        status: 'Active',
        lastActive: new Date().toISOString(),
        color: 'indigo',
        queryScope: 'Show All Queries',
        whatsappScope: 'All Messages',
        permissions: ADMIN_PERMISSIONS,
    };

    const mapUserToStaff = useCallback(async (email: string | undefined, distinctStaffList?: StaffMember[]) => {
        if (!email) {
            setLoading(false);
            return;
        }

        // Use provided list or current state
        let currentList = distinctStaffList || staff;

        // Final fallback if list is empty (shouldn't happen with initializeAuth sequence)
        if (currentList.length === 0) {
            try {
                currentList = await api.getStaff();
                setStaff(currentList);
            } catch (e) { console.error(e); }
        }

        const matchedStaff = currentList.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (matchedStaff) {
            setCurrentUser(matchedStaff);
        } else {
            // New User Logic - Create in DB
            const isFirstUser = currentList.length === 0;
            const isAdminEmail = email === 'toursshravya@gmail.com';

            const newStaff: Partial<StaffMember> = {
                name: email.split('@')[0],
                email: email,
                role: (isFirstUser || isAdminEmail) ? 'Administrator' : 'Agent',
                userType: (isFirstUser || isAdminEmail) ? 'Admin' : 'Staff',
                initials: email.substring(0, 2).toUpperCase(),
                department: (isFirstUser || isAdminEmail) ? 'Executive' : 'Sales',
                status: 'Active',
                lastActive: new Date().toISOString(),
                color: 'indigo',
                queryScope: 'Show All Queries',
                whatsappScope: 'All Messages',
                permissions: (isFirstUser || isAdminEmail) ? ADMIN_PERMISSIONS : DEFAULT_PERMISSIONS
            };

            try {
                const created = await api.createStaff(newStaff as any); // Type assertion for partial
                setStaff(prev => [created, ...prev]);
                setCurrentUser(created);
            } catch (e) {
                console.error("Failed to auto-create staff", e);
            }
        }
        setLoading(false);
    }, []); // No deps needed: staff is always passed explicitly as distinctStaffList

    // Consolidated Initialization
    const initializeAuth = useCallback(async () => {
        // Safety Timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth initialization timed out')), 8000)
        );

        try {
            await Promise.race([
                (async () => {
                    // 1. Check for Mock Session first (Fastest)
                    const isMockSession = localStorage.getItem(STORAGE_KEY_MOCK) === 'true';

                    // 2. Fetch Staff List (Required for mapping real users too)
                    let currentStaff: StaffMember[] = [];
                    try {
                        // Add catch to api call to prevent it from throwing up completely
                        currentStaff = await api.getStaff().catch(e => {
                            console.warn("Staff fetch failed, proceeding with empty list", e);
                            return [];
                        });
                        setStaff(currentStaff);
                    } catch (e) {
                        console.error("Critical error fetching staff", e);
                    }

                    // 3. Restore Session
                    if (isMockSession) {
                        // Ensure mock admin is in the staff list
                        if (!currentStaff.find(s => s.id === 999)) {
                            setStaff(prev => [MOCK_ADMIN_USER, ...prev]);
                        }
                        setCurrentUser(MOCK_ADMIN_USER);
                        return;
                    }

                    // 4. Check Supabase Session
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError) throw sessionError;

                    if (session?.user) {
                        await mapUserToStaff(session.user.email, currentStaff);
                    }
                })(),
                timeoutPromise
            ]);
        } catch (error) {
            console.error("Auth initialization failed or timed out", error);
            // Ensure we don't leave the user in limbo - unauthorized state will trigger redirect to login
        } finally {
            if (loading) setLoading(false);
        }
    }, [mapUserToStaff]);

    // Force safety timeout for loading state
    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            setLoading(false);
        }, 10000); // 10s absolute max loading time
        return () => clearTimeout(safetyTimer);
    }, []);

    useEffect(() => {
        initializeAuth();

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const freshStaff = await api.getStaff();
                setStaff(freshStaff);
                mapUserToStaff(session.user.email, freshStaff);
            } else {
                if (localStorage.getItem(STORAGE_KEY_MOCK) !== 'true') {
                    setCurrentUser(null);
                    setLoading(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [initializeAuth, mapUserToStaff]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        // Dev/Demo Bypass
        if (email === 'admin@shravyatours.com' && password === 'admin') {
            localStorage.setItem(STORAGE_KEY_MOCK, 'true');
            // Ensure it's in the staff list
            setStaff(prev => {
                if (!prev.find(s => s.id === 999)) return [MOCK_ADMIN_USER, ...prev];
                return prev;
            });
            setCurrentUser(MOCK_ADMIN_USER);
            return true;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('Login failed:', error.message);
                return false;
            }

            if (data.session?.user) {
                // Explicitly map user immediately to avoid race condition with onAuthStateChange
                await mapUserToStaff(data.session.user.email);
            }
            return true;
        } catch (e) {
            console.error("Login exception:", e);
            return false;
        }
    }, [mapUserToStaff]);

    const logout = useCallback(async () => {
        localStorage.removeItem(STORAGE_KEY_MOCK);
        await supabase.auth.signOut();
        setCurrentUser(null);
    }, []);

    const addStaff = useCallback(async (member: StaffMember, password?: string) => {
        try {
            // We use api.createStaff usually, but context might call this for UI optimism?
            // Let's assume the component calls API and simpler updates list.
            // Actually, components should call Context.addStaff -> Context calls API -> Context updates state.
            const created = await api.createStaff(member, password);
            setStaff(prev => [created, ...prev]);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }, []);

    const updateStaff = useCallback(async (id: number, member: Partial<StaffMember>) => {
        try {
            await api.updateStaff(id, member);
            setStaff(prev => prev.map(s => s.id === id ? { ...s, ...member } : s));
        } catch (e) {
            console.error(e);
            throw e;
        }
    }, []);

    const deleteStaff = useCallback(async (id: number) => {
        try {
            await api.deleteStaff(id);
            setStaff(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            console.error(e);
            throw e;
        }
    }, []);

    // Masquerade Logic (Client-side mainly)
    const [realUser, setRealUser] = useState<StaffMember | null>(null);

    const masqueradeAs = useCallback((staffId: number) => {
        const target = staff.find(s => s.id === staffId);
        if (target) {
            if (!realUser) setRealUser(currentUser);
            setCurrentUser(target);
        }
    }, [currentUser, staff, realUser]);

    const stopMasquerading = useCallback(() => {
        if (realUser) {
            setCurrentUser(realUser);
            setRealUser(null);
        }
    }, [realUser]);

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
            masqueradeAs,
            stopMasquerading,
            isMasquerading: !!realUser,
            realUser,
        }),
        [staff, currentUser, loading, login, logout, addStaff, updateStaff, deleteStaff, hasPermission, masqueradeAs, stopMasquerading, realUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export { DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS };
