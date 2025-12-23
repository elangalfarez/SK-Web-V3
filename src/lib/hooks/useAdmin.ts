// src/lib/hooks/useAdmin.ts
// Created: Admin authentication hook for custom admin_users table

import { useState, useEffect, useCallback, createContext, useContext, createElement, type ReactNode } from 'react';
import { supabase } from '../supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AdminRole {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    color: string;
}

export interface AdminSession {
    user: AdminUser;
    roles: AdminRole[];
    permissions: string[];
}

interface AdminState {
    session: AdminSession | null;
    isLoading: boolean;
    error: string | null;
}

interface AdminContextValue extends AdminState {
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
    hasPermission: (permission: string) => boolean;
    hasRole: (roleName: string) => boolean;
    isAdmin: boolean;
}

// ============================================================================
// SESSION STORAGE KEY
// ============================================================================

const ADMIN_SESSION_KEY = 'smk_admin_session';

// ============================================================================
// ADMIN CONTEXT
// ============================================================================

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
    const context = useContext(AdminContext);
    if (!context) {
        // Return a default non-authenticated state if used outside provider
        return {
            session: null,
            isLoading: false,
            error: null,
            signIn: async () => ({ success: false, error: 'AdminProvider not found' }),
            signOut: () => {},
            hasPermission: () => false,
            hasRole: () => false,
            isAdmin: false,
        };
    }
    return context;
}

// ============================================================================
// STANDALONE HOOK (for use without provider)
// ============================================================================

export function useAdminAuth(): AdminContextValue {
    const [state, setState] = useState<AdminState>({
        session: null,
        isLoading: true,
        error: null,
    });

    // Load session from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(ADMIN_SESSION_KEY);
        if (stored) {
            try {
                const session = JSON.parse(stored) as AdminSession;
                setState({
                    session,
                    isLoading: false,
                    error: null,
                });
            } catch {
                localStorage.removeItem(ADMIN_SESSION_KEY);
                setState({
                    session: null,
                    isLoading: false,
                    error: null,
                });
            }
        } else {
            setState({
                session: null,
                isLoading: false,
                error: null,
            });
        }
    }, []);

    // Sign in function
    const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // 1. Verify admin credentials
            const { data: adminUser, error: userError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .eq('is_active', true)
                .single();

            if (userError || !adminUser) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Invalid email or password',
                }));
                return { success: false, error: 'Invalid email or password' };
            }

            // 2. Check password (simple comparison for now - matches your current setup)
            // Note: In production, use bcrypt.compare() with properly hashed passwords
            if (adminUser.password_hash !== password) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Invalid email or password',
                }));
                return { success: false, error: 'Invalid email or password' };
            }

            // 3. Fetch user roles
            const { data: userRoles, error: rolesError } = await supabase
                .from('admin_user_roles')
                .select(`
                    role_id,
                    admin_roles (
                        id,
                        name,
                        display_name,
                        description,
                        color
                    )
                `)
                .eq('user_id', adminUser.id);

            if (rolesError) {
                console.error('Error fetching roles:', rolesError);
            }

            // 4. Fetch user permissions via RPC or direct query
            let permissionNames: string[] = [];

            // Try RPC function first
            const { data: permissions, error: permError } = await supabase
                .rpc('get_user_permissions', { user_uuid: adminUser.id });

            if (permError) {
                // Fallback: direct query if RPC doesn't exist
                console.warn('RPC get_user_permissions not found, using direct query');
                const { data: directPerms } = await supabase
                    .from('admin_role_permissions')
                    .select(`
                        admin_permissions (name)
                    `)
                    .in('role_id', (userRoles || []).map(r => r.role_id));

                if (directPerms) {
                    permissionNames = directPerms
                        .map(p => {
                            const perms = p.admin_permissions as { name: string } | { name: string }[] | null;
                            if (Array.isArray(perms)) {
                                return perms.map(perm => perm.name);
                            }
                            return perms?.name;
                        })
                        .flat()
                        .filter((name): name is string => typeof name === 'string');
                }
            } else {
                permissionNames = (permissions || [])
                    .map((p: { permission_name: string }) => p.permission_name);
            }

            // 5. Build session
            const roles: AdminRole[] = (userRoles || [])
                .map(ur => ur.admin_roles as unknown as AdminRole)
                .filter(Boolean);

            const session: AdminSession = {
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    full_name: adminUser.full_name,
                    avatar_url: adminUser.avatar_url,
                    is_active: adminUser.is_active,
                    created_at: adminUser.created_at,
                    updated_at: adminUser.updated_at,
                },
                roles,
                permissions: permissionNames,
            };

            // 6. Store session
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

            setState({
                session,
                isLoading: false,
                error: null,
            });

            return { success: true };

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMsg,
            }));
            return { success: false, error: errorMsg };
        }
    }, []);

    // Sign out function
    const signOut = useCallback(() => {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setState({
            session: null,
            isLoading: false,
            error: null,
        });
    }, []);

    // Check if user has specific permission
    const hasPermission = useCallback((permission: string): boolean => {
        if (!state.session) return false;
        return state.session.permissions.includes(permission);
    }, [state.session]);

    // Check if user has specific role
    const hasRole = useCallback((roleName: string): boolean => {
        if (!state.session) return false;
        return state.session.roles.some(r => r.name === roleName);
    }, [state.session]);

    return {
        ...state,
        signIn,
        signOut,
        hasPermission,
        hasRole,
        isAdmin: !!state.session,
    };
}

// ============================================================================
// ADMIN PROVIDER COMPONENT
// ============================================================================

interface AdminProviderProps {
    children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
    const admin = useAdminAuth();

    // Use createElement instead of JSX since this is a .ts file
    return createElement(AdminContext.Provider, { value: admin }, children);
}

// ============================================================================
// HELPER: Check permission without hook (for non-component code)
// ============================================================================

export function getStoredAdminSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as AdminSession;
    } catch {
        return null;
    }
}

export function isAdminLoggedIn(): boolean {
    return getStoredAdminSession() !== null;
}

export function clearAdminSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ADMIN_SESSION_KEY);
    }
}
