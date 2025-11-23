'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import styles from '../auth.module.css';

export default function LoginPage() {
    const { login, loginWithEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleInternetIdentityLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            await login();
        } catch (error) {
            console.error('Login failed:', error);
            setError('Internet Identity login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await loginWithEmail(email, password);
        } catch (error: any) {
            console.error('Email login failed:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="contact-form-section" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
            <div className="container">
                <div className="heading wow animate__animated custom-fadeInUp" style={{ marginBottom: '2rem' }}>
                    <h6 className="sub-heading">Welcome Back</h6>
                    <h2 className="primary-heading">
                        Log in to Safro<br />
                        <span className="underline"></span>
                    </h2>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="contact-form wow animate__animated custom-fadeInUp" data-wow-delay="0.2s">
                            <div className={styles.container}>
                                {/* Internet Identity Button */}
                                <button
                                    onClick={handleInternetIdentityLogin}
                                    disabled={isLoading}
                                    className="btn primary w-100 mb-4"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                >
                                    {isLoading ? 'Connecting...' : 'Login with Internet Identity'}
                                    {!isLoading && (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" />
                                            <path d="M12 6C10.34 6 9 7.34 9 9C9 10.66 10.34 12 12 12C13.66 12 15 10.66 15 9C15 7.34 13.66 6 12 6ZM12 10C11.45 10 11 9.55 11 9C11 8.45 11.45 8 12 8C12.55 8 13 8.45 13 9C13 9.55 12.55 10 12 10Z" fill="currentColor" />
                                            <path d="M12 13C9.33 13 4 14.34 4 17V19H20V17C20 14.34 14.67 13 12 13ZM5.93 17C6.91 16.28 9.65 15 12 15C14.35 15 17.09 16.28 18.07 17H5.93Z" fill="currentColor" />
                                        </svg>
                                    )}
                                </button>

                                <div className="text-center mb-4" style={{ textAlign: 'center', width: '100%', margin: '1rem 0' }}>
                                    <span style={{ background: 'var(--primary-gray)', padding: '0 10px', color: 'var(--primary-paragraph)' }}>OR</span>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div style={{
                                        padding: '1rem',
                                        marginBottom: '1rem',
                                        backgroundColor: '#fee',
                                        color: '#c33',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                {/* Email Login Form */}
                                <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
                                    <div className={styles.inputGroup}>
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.footer}>
                                        <label className={styles.checkboxLabel}>
                                            <input type="checkbox" className={styles.checkbox} />
                                            <span style={{ fontSize: '14px', color: 'var(--primary-paragraph)' }}>Remember me</span>
                                        </label>
                                        <Link href="/forgot-password" style={{ fontSize: '14px', color: 'var(--primary-color)' }}>
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    <button type="submit" className="btn primary w-100" disabled={isLoading}>
                                        {isLoading ? 'Logging in...' : 'Log In'}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p style={{ color: 'var(--primary-paragraph)' }}>
                                        Don't have an account?{' '}
                                        <Link href="/signup" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                                            Sign Up
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
