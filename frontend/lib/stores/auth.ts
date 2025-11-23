import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    principal: string | null;
    setAuthenticated: (isAuth: boolean, principal?: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            principal: null,
            setAuthenticated: (isAuth, principal) =>
                set({ isAuthenticated: isAuth, principal: principal || null }),
            logout: () => set({ isAuthenticated: false, principal: null }),
        }),
        {
            name: 'safro-auth',
        }
    )
);
