'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { useIcp } from '@/lib/context/IcpContext';
import { useEscrows } from '@/lib/hooks/useEscrows';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Wallet as WalletIcon, TrendingUp, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Bitcoin, Sparkles } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { principal, isAuthenticated: isIcpAuth, login: icpLogin, isLoading: icpLoading } = useIcp();
    const { escrows, isLoading: escrowsLoading, stats } = useEscrows();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    // Calculate total assets in USD (mock conversion rate for now)
    const btcToUsd = 43000; // Mock BTC price
    const totalAssets = (stats.totalValue / 100000000) * btcToUsd;
    const totalDeposits = totalAssets * 1.2; // Mock calculation
    const apy = 8.6; // Mock APY

    // Handle ICP login
    const handleIcpLogin = async () => {
        await icpLogin();
    };

    // Handle create escrow
    const handleCreateEscrow = () => {
        router.push('/dashboard/escrow/create');
    };

    return (
        <DashboardLayout>
            {/* ICP Connection Banner (if not connected) */}
            {!isIcpAuth && (
                <div className={styles.promoBanner}>
                    <div className={styles.promoContent}>
                        <h3>Connect with <span style={{ color: '#fbbf24' }}>Internet Identity</span></h3>
                        <p>Connect your Internet Identity to create and manage escrows on the Internet Computer</p>
                        <button
                            className={styles.promoButton}
                            onClick={handleIcpLogin}
                            disabled={icpLoading}
                        >
                            {icpLoading ? 'Connecting...' : 'Connect Internet Identity'}
                        </button>
                    </div>
                    <div className={styles.promoIcons}>
                        <Bitcoin size={36} />
                        <Sparkles size={36} />
                    </div>
                </div>
            )}

            {/* Promotional Banner (if connected) */}
            {isIcpAuth && (
                <div className={styles.promoBanner}>
                    <div className={styles.promoContent}>
                        <h3>Secure Your Bitcoin Transactions with <span style={{ color: '#fbbf24' }}>Safro Escrow</span></h3>
                        <p>Get started with decentralized escrow powered by Internet Computer</p>
                        <button className={styles.promoButton} onClick={handleCreateEscrow}>
                            Create Escrow
                        </button>
                    </div>
                    <div className={styles.promoIcons}>
                        <Bitcoin size={36} />
                        <Sparkles size={36} />
                    </div>
                </div>
            )}

            {/* Top Stats Row */}
            <div className={styles.statsGrid}>
                {/* Total Assets - Gradient Card */}
                <div className={`${styles.statCard} ${styles.statCardGradient}`}>
                    <div className={styles.statCardDecoration}></div>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div className={styles.statHeader}>
                            <WalletIcon className={styles.statIcon} size={20} />
                            <span className={styles.statLabel}>Total Assets</span>
                        </div>
                        {escrowsLoading ? (
                            <div className={styles.statValue}><Loader size="small" /></div>
                        ) : (
                            <>
                                <div className={styles.statValue}>${totalAssets.toFixed(2)}</div>
                                <div className={styles.statSubtext}>{(stats.totalValue / 100000000).toFixed(8)} BTC</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Total Deposits */}
                <div className={`${styles.statCard} ${styles.statCardDark}`}>
                    <div className={styles.statHeader}>
                        <ArrowDownToLine className={styles.statIcon} size={20} />
                        <span className={styles.statLabel}>Active Escrows</span>
                    </div>
                    {escrowsLoading ? (
                        <div className={styles.statValue}><Loader size="small" /></div>
                    ) : (
                        <>
                            <div className={styles.statValue}>{stats.active}</div>
                            <div className={styles.statSubtext}>{stats.total} total</div>
                        </>
                    )}
                </div>

                {/* Completed */}
                <div className={`${styles.statCard} ${styles.statCardDark}`}>
                    <div className={styles.statHeader}>
                        <TrendingUp className={styles.statIcon} size={20} />
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                    {escrowsLoading ? (
                        <div className={styles.statValue}><Loader size="small" /></div>
                    ) : (
                        <>
                            <div className={styles.statValue}>{stats.completed}</div>
                            <div className={styles.statSubtext}>{stats.disputed} disputed</div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Left Column - Chart Area */}
                <div>
                    {/* Portfolio Performance */}
                    <div className={styles.chartSection}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Escrow Activity</h3>
                            <div className={styles.timeFilters}>
                                <button className={`${styles.timeButton} ${styles.active}`}>24H</button>
                                <button className={styles.timeButton}>1W</button>
                                <button className={styles.timeButton}>1M</button>
                                <button className={styles.timeButton}>1Y</button>
                                <button className={styles.timeButton}>ALL</button>
                            </div>
                        </div>

                        {/* Chart Tabs */}
                        <div className={styles.chartTabs}>
                            <button className={`${styles.chartTab} ${styles.active}`}>Overview</button>
                            <button className={styles.chartTab}>Transactions</button>
                        </div>

                        <div className={styles.chartPlaceholder}>
                            {escrowsLoading ? (
                                <div>
                                    <Loader size="medium" text="Loading escrow data..." />
                                </div>
                            ) : escrows.length === 0 ? (
                                <div>
                                    <div className={styles.chartPlaceholderIcon}>📈</div>
                                    <p className={styles.chartPlaceholderText}>No escrows yet</p>
                                    <p className={`${styles.chartPlaceholderText} ${styles.statSubtext}`}>
                                        Create your first escrow to get started
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className={styles.chartPlaceholderIcon}>📊</div>
                                    <p className={styles.chartPlaceholderText}>Escrow chart coming soon</p>
                                    <p className={`${styles.chartPlaceholderText} ${styles.statSubtext}`}>
                                        {escrows.length} escrows tracked
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <button
                            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                            onClick={() => router.push('/dashboard/wallet')}
                        >
                            <WalletIcon size={18} />
                            Wallet
                        </button>
                        <button
                            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                            onClick={() => router.push('/dashboard/escrow')}
                        >
                            <RefreshCw size={18} />
                            View Escrows
                        </button>
                    </div>
                </div>

                {/* Right Column - Principal & Actions */}
                <div>
                    {/* Principal Card */}
                    <div className={styles.balanceCard}>
                        <div className={styles.balanceAvatar}>
                            <WalletIcon size={32} />
                        </div>
                        <div className={styles.balanceLabel}>Your Principal</div>
                        {principal ? (
                            <>
                                <div className={styles.balanceAmount} style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
                                    {principal.toString().substring(0, 20)}...
                                </div>
                                <div className={styles.balanceChange}>
                                    <span className={styles.balanceBadge}>Connected</span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.balanceAmount} style={{ fontSize: '1rem' }}>
                                Not Connected
                            </div>
                        )}
                        <div className={styles.balanceActions}>
                            {isIcpAuth ? (
                                <button
                                    className={`${styles.balanceActionButton} ${styles.primary}`}
                                    onClick={handleCreateEscrow}
                                >
                                    Create Escrow
                                </button>
                            ) : (
                                <button
                                    className={`${styles.balanceActionButton} ${styles.primary}`}
                                    onClick={handleIcpLogin}
                                    disabled={icpLoading}
                                >
                                    {icpLoading ? 'Connecting...' : 'Connect II'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Recent Escrows */}
                    <div className={styles.tradingPanel}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'white' }}>
                            Recent Escrows
                        </h3>
                        {escrowsLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader size="small" />
                            </div>
                        ) : escrows.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#8b92a7', fontSize: '0.875rem' }}>
                                No escrows yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {escrows.slice(0, 3).map((escrow) => (
                                    <div
                                        key={escrow.escrow_id}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#0f1419',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => router.push(`/dashboard/escrow/${escrow.escrow_id}`)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#8b92a7' }}>{escrow.escrow_id}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{escrow.status}</span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
                                            {(Number(escrow.amount_satoshis) / 100000000).toFixed(8)} {escrow.currency}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
