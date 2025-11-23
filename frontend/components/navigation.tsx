'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Wallet, User, TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-provider';

export function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, login, logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
        { name: 'Escrows', href: '/escrow', icon: Shield },
        { name: 'Wallet', href: '/wallet', icon: Wallet },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <nav className="glass-card border-b sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Shield className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold gradient-text">Safro</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated && navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Button */}
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <button onClick={logout} className="btn-secondary">
                                Disconnect
                            </button>
                        ) : (
                            <button onClick={login} className="btn-primary">
                                Connect Wallet
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pb-4 animate-fade-in">
                        <div className="flex flex-col space-y-2">
                            {isAuthenticated && navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                            <div className="pt-2">
                                {isAuthenticated ? (
                                    <button onClick={logout} className="btn-secondary w-full">
                                        Disconnect
                                    </button>
                                ) : (
                                    <button onClick={login} className="btn-primary w-full">
                                        Connect Wallet
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
