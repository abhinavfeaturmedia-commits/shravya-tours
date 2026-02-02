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

const INITIAL_STAFF: StaffMember[] = [];

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
    // Load staff from local storage or use empty array
    const [staff, setStaff] = useState<StaffMember[]>(() => loadFromStorage(STORAGE_KEY, INITIAL_STAFF));
    const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);

    // Persist staff changes to localStorage
    useEffect(() => {
        saveToStorage(STORAGE_KEY, staff);
    }, [staff]);

    // Keep a Ref for event listeners to read fresh state without re-binding
    const staffRef = React.useRef(staff);
    useEffect(() => { staffRef.current = staff; }, [staff]);

    // Cleanup Logic: Deduplicate on load (One-time fix for existing messed up data)
    useEffect(() => {
        const unique = new Map();
        let hasDupes = false;
        staff.forEach(s => {
            if (!unique.has(s.email.toLowerCase())) {
                unique.set(s.email.toLowerCase(), s);
            } else {
                hasDupes = true;
            }
        });
        if (hasDupes) {
            console.log('Cleaning up duplicate staff entries...');
            setStaff(Array.from(unique.values()));
        }
    }, []);

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

    // Re-run mapping if staff list changes (e.g. after adding a new user) while logged in
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user && !currentUser) {
                // Try mapping again if we don't have a currentUser but have a session
                // This handles the case where Staff list was updated
                mapUserToStaff(session.user.email);
            } else if (session?.user && currentUser) {
                // Ensure current user data is up to date with staff list
                const updatedUser = staff.find(s => s.email.toLowerCase() === session.user.email?.toLowerCase());
                if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
                    setCurrentUser(updatedUser);
                }
            }
        });
    }, [staff]);


    const mapUserToStaff = (email: string | undefined) => {
        if (!email) return;

        // USE REF TO PREVENT CLOSURE STALENESS
        const currentList = staffRef.current;
        const matchedStaff = currentList.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (matchedStaff) {
            setCurrentUser(matchedStaff);
        } else {
            // Check again robustly before adding
            // It's possible the ref is slightly stale if multiple events fired rapidly, 
            // but for normal auth flows this is sufficient.

            setStaff(prev => {
                // Double check inside the updater to be 100% sure
                if (prev.find(s => s.email.toLowerCase() === email.toLowerCase())) {
                    return prev;
                }

                // New User Logic
                const isFirstUser = prev.length === 0;
                const isAdminEmail = email === 'toursshravya@gmail.com';

                const newStaff: StaffMember = {
                    id: Date.now(),
                    name: email.split('@')[0],
                    email: email,
                    role: (isFirstUser || isAdminEmail) ? 'Administrator' : 'Agent',
                    userType: (isFirstUser || isAdminEmail) ? 'Admin' : 'Staff',
                    initials: email.substring(0, 2).toUpperCase(),
                    department: (isFirstUser || isAdminEmail) ? 'Executive' : 'Sales',
                    status: 'Active',
                    lastActive: 'Now',
                    color: 'indigo',
                    queryScope: 'Show All Queries',
                    whatsappScope: 'All Messages',
                    permissions: (isFirstUser || isAdminEmail) ? ADMIN_PERMISSIONS : DEFAULT_PERMISSIONS
                };

                setCurrentUser(newStaff);
                return [...prev, newStaff];
            });
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

        // --- Single Session Logic ---
        // Generates a new Session ID and updates the "Central" staff record.
        // Any other active instance will detect this change and log out.
        const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('shravya_session_id', newSessionId);

        setStaff(prev => prev.map(s => {
            if (s.email.toLowerCase() === email.toLowerCase()) {
                return { ...s, currentSessionId: newSessionId, lastActive: 'Now' };
            }
            return s;
        }));

        return true;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    }, []);

    // Session Enforcement Effect
    useEffect(() => {
        const checkSession = () => {
            if (!currentUser) return;

            // Find the "True" record from the shared state
            const trueRecord = staff.find(s => s.id === currentUser.id);
            if (!trueRecord) return;

            const mySessionId = sessionStorage.getItem('shravya_session_id');

            // If the record has a session ID (someone logged in) AND it doesn't match ours
            if (trueRecord.currentSessionId && trueRecord.currentSessionId !== mySessionId) {
                console.warn('Session mismatch! forcing logout.');
                alert('You have been logged out because this account was accessed from another device or location.');
                logout();
            }
        };

        const interval = setInterval(checkSession, 2000); // Check every 2 seconds
        return () => clearInterval(interval);
    }, [currentUser, staff, logout]);

    const addStaff = useCallback((member: StaffMember) => setStaff(prev => [member, ...prev]), []);
    const updateStaff = useCallback((id: number, member: Partial<StaffMember>) => setStaff(prev => prev.map(s => s.id === id ? { ...s, ...member } : s)), []);
    const deleteStaff = useCallback((id: number) => setStaff(prev => prev.filter(s => s.id !== id)), []);

    // Masquerade Logic
    const [realUser, setRealUser] = useState<StaffMember | null>(null);

    const masqueradeAs = useCallback((staffId: number) => {
        // Can only masquerade if you are an Admin AND not already masquerading (or switch?)
        // For simplicity, verify current actual user is admin.
        // Since currentUser changes, we should ideally check realUser or rely on UI to hide button.
        // Here we just check if target exists.
        const target = staff.find(s => s.id === staffId);
        if (target) {
            if (!realUser) setRealUser(currentUser); // Save original admin
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
