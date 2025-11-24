'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { useIcp } from '@/lib/context/IcpContext';
import { useEscrows } from '@/lib/hooks/useEscrows';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { EscrowRecord, EscrowStatus } from '@/lib/types/canister';
import { QRCodeSVG } from 'qrcode.react';
import {
    ArrowLeft,
    Copy,
    CheckCircle,
    Clock,
    AlertCircle,
    AlertTriangle,
    ShieldCheck,
    RefreshCw,
    Loader2,
    ExternalLink,
    Lock,
} from 'lucide-react';
import { formatBTC, formatSatoshis, bigIntToNumber } from '@/lib/utils/bigint';
import { statusToString, currencyToString } from '@/lib/utils/candid';
import styles from '../../dashboard.module.css';

export default function EscrowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isAuthenticated: isIcpAuth, principal } = useIcp();
    const { getEscrow, confirmDelivery, requestRelease, markDisputed, forceRefund } = useEscrows();

    const [escrow, setEscrow] = useState<EscrowRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [showDisputeInput, setShowDisputeInput] = useState(false);

    const escrowId = params?.id as string;

    const fetchEscrowDetails = useCallback(async () => {
        if (!escrowId || !isIcpAuth) return;

        setIsLoading(true);
        try {
            const data = await getEscrow(escrowId);
            setEscrow(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch escrow details');
        } finally {
            setIsLoading(false);
        }
    }, [escrowId, isIcpAuth]); // Removed getEscrow from dependencies

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isIcpAuth && escrowId) {
            fetchEscrowDetails();
        }
    }, [isAuthenticated, isIcpAuth, escrowId, router, fetchEscrowDetails]);

    const handleCopyAddress = () => {
        if (escrow?.deposit_address) {
            navigator.clipboard.writeText(escrow.deposit_address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAction = async (action: () => Promise<void>) => {
        setIsActionLoading(true);
        try {
            await action();
            await fetchEscrowDetails();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    if (!isIcpAuth) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6', margin: '0 auto' }} />
                    <p style={{ color: '#8b92a7', marginTop: '1rem' }}>Connecting to Internet Computer...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6', margin: '0 auto' }} />
                    <p style={{ color: '#8b92a7', marginTop: '1rem' }}>Loading escrow details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !escrow) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto' }} />
                    <h2 style={{ color: 'white', marginTop: '1rem' }}>Error Loading Escrow</h2>
                    <p style={{ color: '#8b92a7', marginTop: '0.5rem' }}>{error || 'Escrow not found'}</p>
                    <button
                        onClick={() => router.back()}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            backgroundColor: '#1a1f26',
                            border: '1px solid #2d3748',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const isCreator = principal?.toString() === escrow.creator_id.toString();
    const isCounterparty = principal?.toString() === escrow.counterparty_id.toString();

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

    const statusSteps = ['Created', 'Funded', 'Delivered', 'Released'];
    const currentStepIndex = statusSteps.indexOf(escrow.status in EscrowStatus ? escrow.status : 'Created'); // Simplified logic

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#8b92a7',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        Back to Escrows
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                    Escrow #{escrow.escrow_id.substring(0, 8)}...
                                </h1>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    backgroundColor: getStatusColor(escrow.status) + '20',
                                    color: getStatusColor(escrow.status),
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    border: `1px solid ${getStatusColor(escrow.status)}40`
                                }}>
                                    {statusToString(escrow.status)}
                                </span>
                            </div>
                            <p style={{ color: '#8b92a7', fontSize: '0.875rem' }}>
                                Created on {new Date(bigIntToNumber(escrow.created_at) / 1000000).toLocaleString()}
                            </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                                {formatBTC(escrow.amount_satoshis)} {currencyToString(escrow.currency)}
                            </div>
                            <div style={{ color: '#8b92a7', fontSize: '0.875rem' }}>
                                ≈ {formatSatoshis(escrow.amount_satoshis)} satoshis
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    {/* Left Column - Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Status Timeline */}
                        <div style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1.5rem' }}>Progress</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                {/* Progress Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '0',
                                    right: '0',
                                    height: '2px',
                                    backgroundColor: '#2d3748',
                                    zIndex: 0
                                }} />

                                {statusSteps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex || escrow.status === 'Released';
                                    const isActive = escrow.status === step;

                                    return (
                                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                            <div style={{
                                                width: '26px',
                                                height: '26px',
                                                borderRadius: '50%',
                                                backgroundColor: isCompleted ? '#3b82f6' : '#1a1f26',
                                                border: `2px solid ${isCompleted ? '#3b82f6' : '#2d3748'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '0.5rem',
                                                color: 'white'
                                            }}>
                                                {isCompleted && <CheckCircle size={14} />}
                                            </div>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: isActive ? 'white' : '#8b92a7',
                                                fontWeight: isActive ? 600 : 400
                                            }}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Deposit Address */}
                        {escrow.status === 'Created' && (
                            <div style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.5rem' }}>
                                <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1rem' }}>Deposit Funds</h3>
                                <p style={{ color: '#8b92a7', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                    Send exactly <strong>{formatBTC(escrow.amount_satoshis)} {currencyToString(escrow.currency)}</strong> to the address below to fund this escrow.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                                        <QRCodeSVG value={escrow.deposit_address} size={160} />
                                    </div>

                                    <div style={{ width: '100%' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#0f1419',
                                            border: '1px solid #2d3748',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem'
                                        }}>
                                            <code style={{ color: '#3b82f6', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                                                {escrow.deposit_address}
                                            </code>
                                            <button
                                                onClick={handleCopyAddress}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: copied ? '#10b981' : '#8b92a7',
                                                    cursor: 'pointer',
                                                    marginLeft: '0.5rem'
                                                }}
                                            >
                                                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>
                                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#8b92a7', marginTop: '0.75rem' }}>
                                            Only send {currencyToString(escrow.currency)} to this address.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        <div style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1rem' }}>Participants</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', backgroundColor: '#0f1419', borderRadius: '8px', border: isCreator ? '1px solid #3b82f6' : '1px solid #2d3748' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginBottom: '0.25rem' }}>
                                        Creator {isCreator && '(You)'}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'white', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                        {escrow.creator_id.toString()}
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: '#0f1419', borderRadius: '8px', border: isCounterparty ? '1px solid #3b82f6' : '1px solid #2d3748' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginBottom: '0.25rem' }}>
                                        Counterparty {isCounterparty && '(You)'}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'white', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                        {escrow.counterparty_id.toString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Actions Card */}
                        <div style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1rem' }}>Actions</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {escrow.status === 'Created' && (
                                    <div style={{ padding: '1rem', backgroundColor: '#f59e0b20', borderRadius: '8px', border: '1px solid #f59e0b40' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <Clock size={20} style={{ color: '#f59e0b' }} />
                                            <div>
                                                <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.875rem' }}>Awaiting Deposit</div>
                                                <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                    Waiting for funds to be deposited to the escrow address.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={fetchEscrowDetails}
                                            disabled={isActionLoading}
                                            style={{
                                                width: '100%',
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                backgroundColor: '#1a1f26',
                                                border: '1px solid #2d3748',
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <RefreshCw size={16} className={isActionLoading ? 'animate-spin' : ''} />
                                            Check Status
                                        </button>
                                    </div>
                                )}

                                {escrow.status === 'Funded' && (
                                    <>
                                        <div style={{ padding: '1rem', backgroundColor: '#3b82f620', borderRadius: '8px', border: '1px solid #3b82f640' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <ShieldCheck size={20} style={{ color: '#3b82f6' }} />
                                                <div>
                                                    <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem' }}>Escrow Funded</div>
                                                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                        Funds are secure. Please confirm delivery once the service/product is received.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAction(() => confirmDelivery(escrowId))}
                                            disabled={isActionLoading}
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                border: 'none',
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                                opacity: isActionLoading ? 0.7 : 1
                                            }}
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Delivery'}
                                        </button>
                                    </>
                                )}

                                {escrow.status === 'Delivered' && (
                                    <>
                                        <div style={{ padding: '1rem', backgroundColor: '#8b5cf620', borderRadius: '8px', border: '1px solid #8b5cf640' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <CheckCircle size={20} style={{ color: '#8b5cf6' }} />
                                                <div>
                                                    <div style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.875rem' }}>Delivery Confirmed</div>
                                                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                        Both parties have confirmed delivery. Funds can now be released.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAction(() => requestRelease(escrowId))}
                                            disabled={isActionLoading}
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                border: 'none',
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                                opacity: isActionLoading ? 0.7 : 1
                                            }}
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Release Funds'}
                                        </button>
                                    </>
                                )}

                                {escrow.status === 'Released' && (
                                    <div style={{ padding: '1rem', backgroundColor: '#10b98120', borderRadius: '8px', border: '1px solid #10b98140' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <CheckCircle size={20} style={{ color: '#10b981' }} />
                                            <div>
                                                <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>Completed</div>
                                                <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                    Funds have been released to the counterparty. This transaction is complete.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {escrow.status !== 'Released' && escrow.status !== 'Refunded' && (
                                    <div style={{ marginTop: '1rem', borderTop: '1px solid #2d3748', paddingTop: '1rem' }}>
                                        {!showDisputeInput ? (
                                            <button
                                                onClick={() => setShowDisputeInput(true)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Report a Problem
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <textarea
                                                    value={disputeReason}
                                                    onChange={(e) => setDisputeReason(e.target.value)}
                                                    placeholder="Describe the issue..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#0f1419',
                                                        border: '1px solid #2d3748',
                                                        color: 'white',
                                                        fontSize: '0.875rem',
                                                        minHeight: '80px',
                                                        outline: 'none'
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => setShowDisputeInput(false)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            backgroundColor: '#1a1f26',
                                                            border: '1px solid #2d3748',
                                                            color: '#8b92a7',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(() => markDisputed(escrowId, disputeReason))}
                                                        disabled={!disputeReason || isActionLoading}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            backgroundColor: '#ef4444',
                                                            border: 'none',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: !disputeReason || isActionLoading ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        {isActionLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Submit Dispute'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div style={{ backgroundColor: '#1a1f26', border: '1px solid #2d3748', borderRadius: '12px', padding: '1.5rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>Details</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#8b92a7' }}>Escrow ID</span>
                                    <span style={{ color: 'white' }}>{escrow.escrow_id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#8b92a7' }}>Time Lock</span>
                                    <span style={{ color: 'white' }}>
                                        {escrow.time_lock_unix
                                            ? new Date(bigIntToNumber(escrow.time_lock_unix) / 1000000).toLocaleDateString()
                                            : 'None'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#8b92a7' }}>AI Risk Score</span>
                                    <span style={{ color: 'white' }}>
                                        {escrow.ai_risk_score ? `${escrow.ai_risk_score}/100` : 'Pending Analysis'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
