'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { useIcp } from '@/lib/context/IcpContext';
import { useEscrows } from '@/lib/hooks/useEscrows';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Loader2, Plus, ArrowRight } from 'lucide-react';
import styles from '../dashboard.module.css';
import { formatBTC, bigIntToNumber } from '@/lib/utils/bigint';
import { statusToString } from '@/lib/utils/candid';

export default function EscrowPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isAuthenticated: isIcpAuth, login: icpLogin } = useIcp();
    const { escrows, isLoading, stats } = useEscrows();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Created': return '#f59e0b';
            case 'Funded': return '#3b82f6';
            case 'Delivered': return '#8b5cf6';
            case 'Released': return '#10b981';
            case 'Refunded': return '#6b7280';
            case 'Disputed': return '#ef4444';
            default: return '#8b92a7';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                            Escrows
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#8b92a7', marginTop: '0.25rem' }}>
                            Manage your escrow transactions
                        </p>
                    </div>
                    {isIcpAuth && (
                        <button
                            onClick={() => router.push('/dashboard/escrow/create')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={20} />
                            Create Escrow
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.statCardDark}`}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Active Escrows</span>
                        </div>
                        <div className={styles.statValue} style={{ color: '#3b82f6' }}>{stats.active}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardDark}`}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Pending</span>
                        </div>
                        <div className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.total - stats.active - stats.completed}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardDark}`}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Completed</span>
                        </div>
                        <div className={styles.statValue} style={{ color: '#10b981' }}>{stats.completed}</div>
                    </div>
                </div>

                {/* Escrow List */}
                <div style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.5rem' }}>
                    {!isIcpAuth ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#8b92a7', marginBottom: '1rem' }}>
                                Connect your Internet Identity to view escrows
                            </p>
                            <button
                                onClick={icpLogin}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Connect Internet Identity
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6', margin: '0 auto' }} />
                            <p style={{ color: '#8b92a7', marginTop: '1rem' }}>Loading escrows...</p>
                        </div>
                    ) : escrows.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                            <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                No escrows yet
                            </p>
                            <p style={{ color: '#8b92a7', marginBottom: '1.5rem' }}>
                                Create your first escrow to get started
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/escrow/create')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Create Escrow
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {escrows.map((escrow) => (
                                <div
                                    key={escrow.escrow_id}
                                    onClick={() => router.push(`/dashboard/escrow/${escrow.escrow_id}`)}
                                    style={{
                                        padding: '1.25rem',
                                        backgroundColor: '#0f1419',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: '1px solid #2d3748',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.backgroundColor = '#1a1f26';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#2d3748';
                                        e.currentTarget.style.backgroundColor = '#0f1419';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                                                {escrow.escrow_id}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#8b92a7' }}>
                                                {new Date(bigIntToNumber(escrow.created_at) / 1000000).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '6px',
                                            backgroundColor: getStatusColor(escrow.status) + '20',
                                            color: getStatusColor(escrow.status),
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}>
                                            {statusToString(escrow.status)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>
                                                {formatBTC(escrow.amount_satoshis)} {escrow.currency}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginTop: '0.25rem' }}>
                                                Counterparty: {escrow.counterparty_id.toString().substring(0, 10)}...
                                            </div>
                                        </div>
                                        <ArrowRight size={20} style={{ color: '#8b92a7' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
