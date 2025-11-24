'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { useIcp } from '@/lib/context/IcpContext';
import { useEscrows } from '@/lib/hooks/useEscrows';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Principal } from '@dfinity/principal';
import { Currency } from '@/lib/types/canister';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import styles from '../dashboard.module.css';

type Step = 'details' | 'amount' | 'review';

export default function CreateEscrowPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isAuthenticated: isIcpAuth, principal } = useIcp();
    const { createEscrow } = useEscrows();

    const [currentStep, setCurrentStep] = useState<Step>('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [createdEscrowId, setCreatedEscrowId] = useState<string | null>(null);

    // Form data
    const [counterpartyPrincipal, setCounterpartyPrincipal] = useState('');
    const [currency, setCurrency] = useState<Currency>(Currency.CkBTC);
    const [amountBtc, setAmountBtc] = useState('');
    const [timeLockDays, setTimeLockDays] = useState('');
    const [useTimeLock, setUseTimeLock] = useState(false);

    // Validation
    const [principalError, setPrincipalError] = useState('');
    const [amountError, setAmountError] = useState('');

    const validatePrincipal = (value: string): boolean => {
        try {
            Principal.fromText(value);
            setPrincipalError('');
            return true;
        } catch {
            setPrincipalError('Invalid principal format');
            return false;
        }
    };

    const validateAmount = (value: string): boolean => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            setAmountError('Amount must be greater than 0');
            return false;
        }
        setAmountError('');
        return true;
    };

    const handleNext = () => {
        if (currentStep === 'details') {
            if (!validatePrincipal(counterpartyPrincipal)) return;
            setCurrentStep('amount');
        } else if (currentStep === 'amount') {
            if (!validateAmount(amountBtc)) return;
            setCurrentStep('review');
        }
    };

    const handleBack = () => {
        if (currentStep === 'amount') setCurrentStep('details');
        else if (currentStep === 'review') setCurrentStep('amount');
    };

    const handleSubmit = async () => {
        if (!principal) {
            setError('Please connect your Internet Identity first');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const amountSatoshis = BigInt(Math.floor(parseFloat(amountBtc) * 100000000));
            const timeLockUnix = useTimeLock && timeLockDays
                ? BigInt(Date.now() * 1000000 + parseInt(timeLockDays) * 24 * 60 * 60 * 1000000000)
                : null;

            console.log('Creating escrow with params:', {
                counterparty: counterpartyPrincipal,
                amount: amountSatoshis.toString(),
                currency,
                timeLock: timeLockUnix?.toString()
            });

            const result = await createEscrow({
                counterparty_id: Principal.fromText(counterpartyPrincipal),
                amount_satoshis: amountSatoshis,
                currency,
                time_lock_unix: timeLockUnix,
            });

            console.log('Escrow created successfully:', result);

            if (result && result.escrow_id) {
                setCreatedEscrowId(result.escrow_id);
                setSuccess(true);
            } else {
                throw new Error('Invalid response from canister - missing escrow_id');
            }
        } catch (err) {
            console.error('Escrow creation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create escrow';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`); // Show alert for mobile debugging
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (!isIcpAuth) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h2 style={{ color: 'white', marginBottom: '1rem' }}>Internet Identity Required</h2>
                    <p style={{ color: '#8b92a7', marginBottom: '2rem' }}>
                        Please connect your Internet Identity to create escrows
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
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
                        Go to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    if (success && createdEscrowId) {
        return (
            <DashboardLayout>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                    <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 2rem' }} />
                    <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>
                        Escrow Created Successfully!
                    </h2>
                    <p style={{ color: '#8b92a7', marginBottom: '0.5rem' }}>
                        Your escrow has been created on the Internet Computer
                    </p>
                    <div style={{
                        backgroundColor: '#1a1f26',
                        padding: '1rem',
                        borderRadius: '8px',
                        margin: '2rem 0',
                        border: '1px solid #2d3748',
                    }}>
                        <div style={{ fontSize: '0.875rem', color: '#8b92a7', marginBottom: '0.5rem' }}>
                            Escrow ID
                        </div>
                        <div style={{ fontSize: '1.125rem', color: 'white', fontWeight: 600, wordBreak: 'break-all' }}>
                            {createdEscrowId}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => router.push(`/dashboard/escrow/${createdEscrowId}`)}
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
                            View Escrow
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/escrow')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                backgroundColor: '#1a1f26',
                                border: '1px solid #2d3748',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            View All Escrows
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                            marginBottom: '1rem',
                        }}
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        Create New Escrow
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#8b92a7', marginTop: '0.5rem' }}>
                        Secure your Bitcoin transaction with decentralized escrow
                    </p>
                </div>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                    {[
                        { id: 'details', label: 'Details' },
                        { id: 'amount', label: 'Amount' },
                        { id: 'review', label: 'Review' },
                    ].map((step, index) => (
                        <div key={step.id} style={{ flex: 1 }}>
                            <div style={{
                                height: '4px',
                                backgroundColor: currentStep === step.id || (index === 0 && currentStep !== 'details') || (index === 1 && currentStep === 'review') ? '#3b82f6' : '#2d3748',
                                borderRadius: '2px',
                                marginBottom: '0.5rem',
                            }} />
                            <div style={{
                                fontSize: '0.875rem',
                                color: currentStep === step.id ? 'white' : '#8b92a7',
                                fontWeight: currentStep === step.id ? 600 : 400,
                            }}>
                                {step.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div style={{
                    backgroundColor: '#1a1f26',
                    border: '1px solid #2d3748',
                    borderRadius: '16px',
                    padding: '2rem',
                }}>
                    {error && (
                        <div style={{
                            backgroundColor: '#ef444420',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '2rem',
                            color: '#ef4444',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Details */}
                    {currentStep === 'details' && (
                        <div>
                            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                Escrow Details
                            </h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b92a7', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Counterparty Principal *
                                </label>
                                <input
                                    type="text"
                                    value={counterpartyPrincipal}
                                    onChange={(e) => {
                                        setCounterpartyPrincipal(e.target.value);
                                        setPrincipalError('');
                                    }}
                                    onBlur={() => counterpartyPrincipal && validatePrincipal(counterpartyPrincipal)}
                                    placeholder="Enter principal ID"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#0f1419',
                                        border: `1px solid ${principalError ? '#ef4444' : '#2d3748'}`,
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                    }}
                                />
                                {principalError && (
                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem' }}>
                                        {principalError}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginTop: '0.5rem' }}>
                                    The principal ID of the person you're transacting with
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b92a7', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Currency *
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    {[Currency.CkBTC, Currency.BTC].map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setCurrency(curr)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                backgroundColor: currency === curr ? '#3b82f620' : '#0f1419',
                                                border: `1px solid ${currency === curr ? '#3b82f6' : '#2d3748'}`,
                                                color: currency === curr ? '#3b82f6' : 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Amount */}
                    {currentStep === 'amount' && (
                        <div>
                            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                Escrow Amount
                            </h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b92a7', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Amount ({currency}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={amountBtc}
                                    onChange={(e) => {
                                        setAmountBtc(e.target.value);
                                        setAmountError('');
                                    }}
                                    onBlur={() => amountBtc && validateAmount(amountBtc)}
                                    placeholder="0.00000000"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#0f1419',
                                        border: `1px solid ${amountError ? '#ef4444' : '#2d3748'}`,
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                    }}
                                />
                                {amountError && (
                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem' }}>
                                        {amountError}
                                    </div>
                                )}
                                {amountBtc && !amountError && (
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginTop: '0.5rem' }}>
                                        ≈ {(parseFloat(amountBtc) * 100000000).toFixed(0)} satoshis
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={useTimeLock}
                                        onChange={(e) => setUseTimeLock(e.target.checked)}
                                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                    />
                                    <label style={{ fontSize: '0.875rem', color: 'white', fontWeight: 500 }}>
                                        Add Time Lock (Optional)
                                    </label>
                                </div>
                                {useTimeLock && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b92a7', marginBottom: '0.5rem', fontWeight: 500 }}>
                                            Lock Duration (Days)
                                        </label>
                                        <input
                                            type="number"
                                            value={timeLockDays}
                                            onChange={(e) => setTimeLockDays(e.target.value)}
                                            placeholder="7"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                borderRadius: '8px',
                                                backgroundColor: '#0f1419',
                                                border: '1px solid #2d3748',
                                                color: 'white',
                                                fontSize: '1rem',
                                                outline: 'none',
                                            }}
                                        />
                                        <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginTop: '0.5rem' }}>
                                            Funds will be locked for this duration before they can be released
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 'review' && (
                        <div>
                            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                Review & Confirm
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', backgroundColor: '#0f1419', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginBottom: '0.25rem' }}>
                                        Counterparty
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'white', wordBreak: 'break-all' }}>
                                        {counterpartyPrincipal}
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: '#0f1419', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginBottom: '0.25rem' }}>
                                        Amount
                                    </div>
                                    <div style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700 }}>
                                        {amountBtc} {currency}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginTop: '0.25rem' }}>
                                        {(parseFloat(amountBtc) * 100000000).toFixed(0)} satoshis
                                    </div>
                                </div>

                                {useTimeLock && timeLockDays && (
                                    <div style={{ padding: '1rem', backgroundColor: '#0f1419', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginBottom: '0.25rem' }}>
                                            Time Lock
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'white' }}>
                                            {timeLockDays} days
                                        </div>
                                    </div>
                                )}

                                <div style={{ padding: '1rem', backgroundColor: '#0f1419', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8b92a7', marginBottom: '0.25rem' }}>
                                        Your Principal
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'white', wordBreak: 'break-all' }}>
                                        {principal?.toString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        {currentStep !== 'details' && (
                            <button
                                onClick={handleBack}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#1a1f26',
                                    border: '1px solid #2d3748',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <ArrowLeft size={20} />
                                Back
                            </button>
                        )}

                        {currentStep !== 'review' ? (
                            <button
                                onClick={handleNext}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                Next
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: isSubmitting ? '#2d3748' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Creating Escrow...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        Create Escrow
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
