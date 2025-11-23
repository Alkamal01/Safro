// API Client for authentication endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        auth_method: string;
        email_verified: boolean;
        created_at: string;
    };
}

export interface UserResponse {
    id: string;
    email: string;
    auth_method: string;
    email_verified: boolean;
    created_at: string;
}

class AuthApiClient {
    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async register(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data: AuthResponse = await response.json();
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        return data;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data: AuthResponse = await response.json();
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        return data;
    }

    async logout(): Promise<void> {
        // Check if we have a token before trying to logout
        const token = this.getToken();
        if (!token) {
            // No token, just clear localStorage
            localStorage.removeItem('auth_token');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                },
            });

            if (!response.ok) {
                // If unauthorized, token is already invalid, just clear it
                if (response.status === 401) {
                    localStorage.removeItem('auth_token');
                    return;
                }

                const error = await response.json();
                throw new Error(error.error || 'Logout failed');
            }

            // Remove token from localStorage
            localStorage.removeItem('auth_token');
        } catch (error) {
            // On any error, still clear the token locally
            localStorage.removeItem('auth_token');
            // Only re-throw if it's not a network error
            if (error instanceof Error && !error.message.includes('Failed to fetch')) {
                throw error;
            }
        }
    }

    async getMe(): Promise<UserResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get user info');
        }

        return await response.json();
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const authApi = new AuthApiClient();
