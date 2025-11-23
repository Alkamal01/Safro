'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Principal } from '@dfinity/principal';
import {
    loginWithII,
    logoutII,
    isAuthenticated as checkAuth,
    getPrincipal,
} from '../canisters/agent';
import { escrowCanister } from '../canisters/escrow';

interface IcpContextType {
    principal: Principal | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const IcpContext = createContext<IcpContextType | undefined>(undefined);

export function IcpProvider({ children }: { children: ReactNode }) {
    const [principal, setPrincipal] = useState<Principal | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    async function checkAuthStatus() {
        setIsLoading(true);
        try {
            const authenticated = await checkAuth();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                const userPrincipal = await getPrincipal();
                setPrincipal(userPrincipal);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function login() {
        setIsLoading(true);
        try {
            const userPrincipal = await loginWithII();
            if (userPrincipal) {
                setPrincipal(userPrincipal);
                setIsAuthenticated(true);

                // Reset canister actors with new identity
                escrowCanister.resetActor();
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function logout() {
        setIsLoading(true);
        try {
            await logoutII();
            setPrincipal(null);
            setIsAuthenticated(false);

            // Reset canister actors
            escrowCanister.resetActor();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <IcpContext.Provider
            value={{
                principal,
                isAuthenticated,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </IcpContext.Provider>
    );
}

export function useIcp() {
    const context = useContext(IcpContext);
    if (context === undefined) {
        throw new Error('useIcp must be used within an IcpProvider');
    }
    return context;
}
