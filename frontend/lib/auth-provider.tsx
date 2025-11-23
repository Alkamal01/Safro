'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { isAuthenticated, getPrincipal, login as icLogin, logout as icLogout } from '@/lib/ic-agent';
import Loader from '@/components/ui/Loader';

// DEV MODE: Skip Internet Identity for easier development
const DEV_MODE_SKIP_AUTH = process.env.NEXT_PUBLIC_DEV_MODE_SKIP_AUTH === 'true';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            if (DEV_MODE_SKIP_AUTH) {
                // In dev mode, automatically authenticate with anonymous identity
                console.log('DEV MODE: Using anonymous identity');
                setAuthenticated(true, 'anonymous-dev-principal');
                setIsLoading(false);
                return;
            }

            const authenticated = await isAuthenticated();
            if (authenticated) {
                const principal = await getPrincipal();
                setAuthenticated(true, principal.toString());
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <Loader fullScreen text="Authenticating..." />;
    }

    return <>{children}</>;
}

export function useAuth() {
    const router = useRouter();
    const { isAuthenticated: isAuth, principal, setAuthenticated, logout: storeLogout } = useAuthStore();

    const login = async () => {
        if (DEV_MODE_SKIP_AUTH) {
            // In dev mode, skip Internet Identity and use anonymous identity
            console.log('DEV MODE: Logging in with anonymous identity');
            setAuthenticated(true, 'anonymous-dev-principal');
            router.push('/dashboard');
            return true;
        }

        const success = await icLogin();
        if (success) {
            const principal = await getPrincipal();
            setAuthenticated(true, principal.toString());
            router.push('/dashboard');
        }
        return success;
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            const { authApi } = await import('@/lib/api/auth');
            const response = await authApi.login(email, password);
            setAuthenticated(true, response.user.id);
            router.push('/dashboard');
            return true;
        } catch (error) {
            console.error('Email login failed:', error);
            throw error;
        }
    };

    const registerWithEmail = async (email: string, password: string) => {
        try {
            const { authApi } = await import('@/lib/api/auth');
            const response = await authApi.register(email, password);
            setAuthenticated(true, response.user.id);
            router.push('/dashboard');
            return true;
        } catch (error) {
            console.error('Email registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        if (DEV_MODE_SKIP_AUTH) {
            storeLogout();
            router.push('/');
            return;
        }

        // Try to logout from email/password session
        try {
            const { authApi } = await import('@/lib/api/auth');
            if (authApi.isAuthenticated()) {
                await authApi.logout();
            }
        } catch (error) {
            console.error('Email logout failed:', error);
        }

        // Logout from Internet Identity
        await icLogout();
        storeLogout();
        router.push('/');
    };

    return {
        isAuthenticated: isAuth,
        principal,
        login,
        loginWithEmail,
        registerWithEmail,
        logout,
    };
}

