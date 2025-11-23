'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, principal } = useAuth();

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
                <h2 className="text-2xl font-semibold text-white mb-6">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm mb-2 block" style={{ color: '#8b92a7' }}>Principal ID</label>
                        <p className="text-white font-mono text-sm p-3 rounded-lg break-all" style={{ backgroundColor: '#0f1419' }}>
                            {principal || 'Not available'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm mb-2 block" style={{ color: '#8b92a7' }}>Account Type</label>
                        <p className="text-white">Standard User</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
