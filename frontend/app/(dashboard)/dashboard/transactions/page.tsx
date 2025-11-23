'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function TransactionsPage() {
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
                <h2 className="text-2xl font-semibold text-white mb-6">Transaction History</h2>
                <div className="text-center py-12" style={{ color: '#8b92a7' }}>
                    <p className="text-lg mb-2">No transactions yet</p>
                    <p className="text-sm">Your transaction history will appear here</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
