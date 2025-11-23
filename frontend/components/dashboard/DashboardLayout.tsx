'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    TrendingUp,
    User,
    Settings,
    LogOut,
    Sun,
    Moon,
    Bell,
    Menu,
    X
} from 'lucide-react';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { logout, principal } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Trade', path: '/dashboard/escrow', icon: ArrowLeftRight },
        { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
        { name: 'Analytics', path: '/dashboard/transactions', icon: TrendingUp },
        { name: 'Profile', path: '/dashboard/profile', icon: User },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await logout();
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={`${styles.dashboardContainer} ${!isDarkMode ? styles.light : ''}`}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${!isDarkMode ? styles.light : ''} ${isMobileMenuOpen ? styles.open : ''}`}>
                {/* Mobile Close Button */}
                <button className={styles.mobileCloseButton} onClick={toggleMobileMenu}>
                    <X size={24} />
                </button>

                {/* Logo */}
                <div className={styles.logo}>
                    <div className={styles.logoContent}>
                        <div className={styles.logoIcon}>S</div>
                        <span className={styles.logoText}>Safro</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path + '/'));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                            >
                                <Icon className={styles.navIcon} size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className={styles.logoutSection}>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <div className={styles.topBarContent}>
                        <div className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
                            <Menu size={24} />
                        </div>
                        <div className={styles.welcomeSection}>
                            <h1>Welcome Back!</h1>
                            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className={styles.topBarActions}>
                            <button onClick={toggleTheme} className={styles.iconButton} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className={styles.iconButton}>
                                <Bell size={20} />
                            </button>
                            <div className={styles.userAvatar}>
                                {principal?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.overlay} onClick={toggleMobileMenu} />
            )}
        </div>
    );
}
