'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SettingsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="p-8 rounded-2xl" style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748' }}>
                <h2 className="text-2xl font-semibold text-white mb-6">Settings</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-3">Preferences</h3>
                        <p className="text-sm" style={{ color: '#8b92a7' }}>Settings options will be available here</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white mb-3">Security</h3>
                        <p className="text-sm" style={{ color: '#8b92a7' }}>Security settings will be available here</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
