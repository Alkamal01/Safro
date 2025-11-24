'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { useIcp } from '@/lib/context/IcpContext';
import { useWallet } from '@/lib/hooks/useWallet';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Principal } from '@dfinity/principal';
import { QRCodeSVG } from 'qrcode.react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Loader2,
    Copy,
    CheckCircle,
    RefreshCw,
    Coins
} from 'lucide-react';
import styles from '../dashboard.module.css';
import { bigIntToNumber, formatBTC } from '@/lib/utils/bigint';

export default function WalletPage() {
    const { isAuthenticated } = useAuth();
    const { isAuthenticated: isIcpAuth } = useIcp();
    const { balance, transactions, isLoading, refresh, getDepositAddress, transfer, faucet } = useWallet();

    const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');
    const [showSend, setShowSend] = useState(false);
    const [showReceive, setShowReceive] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('ckBTC');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [depositAddress, setDepositAddress] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSend = async () => {
        if (!recipient || !amount) return;
        setIsSubmitting(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const amountSatoshis = BigInt(Math.floor(parseFloat(amount) * 100000000));
            await transfer({
                to: Principal.fromText(recipient),
                amount: amountSatoshis,
                currency
            });
            setSuccessMsg('Transfer successful!');
            setRecipient('');
            setAmount('');
            setShowSend(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transfer failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReceive = async () => {
        setShowReceive(true);
        if (!depositAddress) {
            try {
                const addr = await getDepositAddress(currency);
                setDepositAddress(addr.address);
            } catch (err) {
                console.error('Failed to get address:', err);
            }
        }
    };

    const handleCopy = () => {
        if (depositAddress) {
            navigator.clipboard.writeText(depositAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleFaucet = async () => {
        setIsSubmitting(true);
        try {
            await faucet(BigInt(100000000), 'ckBTC'); // 1 ckBTC
            setSuccessMsg('Received 1 ckBTC from faucet!');
        } catch (err) {
            setError('Faucet failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) return null;

    if (!isIcpAuth) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Wallet size={48} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
                    <h2 style={{ color: 'white', marginBottom: '1rem' }}>Wallet Access</h2>
                    <p style={{ color: '#8b92a7' }}>Please connect your Internet Identity to access your wallet.</p>
                </div>
            </DashboardLayout>
        );
    }

    const btcBalance = balance ? bigIntToNumber(balance.btc_balance) / 100000000 : 0;
    const ckbtcBalance = balance ? bigIntToNumber(balance.ckbtc_balance) / 100000000 : 0;
    const totalBalance = btcBalance + ckbtcBalance;

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Wallet</h1>
                    <button
                        onClick={refresh}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8b92a7',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Balance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '1px solid #334155'
                }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Balance</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '2rem' }}>
                        {totalBalance.toFixed(8)} BTC
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => { setShowSend(true); setShowReceive(false); }}
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                borderRadius: '8px',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ArrowUpRight size={20} />
                            Send
                        </button>
                        <button
                            onClick={handleReceive}
                            style={{
                                flex: 1,
                                padding: '0.875rem',
                                borderRadius: '8px',
                                backgroundColor: '#334155',
                                border: 'none',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ArrowDownLeft size={20} />
                            Receive
                        </button>
                        <button
                            onClick={handleFaucet}
                            disabled={isSubmitting}
                            style={{
                                padding: '0.875rem',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                border: '1px solid #334155',
                                color: '#94a3b8',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Coins size={20} />
                            Faucet
                        </button>
                    </div>
                </div>

                {/* Send Modal/Form */}
                {showSend && (
                    <div style={{
                        backgroundColor: '#1a1f26',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: '1px solid #2d3748'
                    }}>
                        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Send Crypto</h3>
                        {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
                        {successMsg && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{successMsg}</div>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#8b92a7', marginBottom: '0.5rem' }}>Recipient Principal</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="aaaaa-aa..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#0f1419',
                                        border: '1px solid #2d3748',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#8b92a7', marginBottom: '0.5rem' }}>Amount</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            backgroundColor: '#0f1419',
                                            border: '1px solid #2d3748',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    />
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            backgroundColor: '#0f1419',
                                            border: '1px solid #2d3748',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="ckBTC">ckBTC</option>
                                        <option value="BTC">BTC</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowSend(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #2d3748',
                                        color: '#8b92a7',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={isSubmitting}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#3b82f6',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Receive Modal/Form */}
                {showReceive && (
                    <div style={{
                        backgroundColor: '#1a1f26',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: '1px solid #2d3748',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Receive {currency}</h3>

                        {depositAddress ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                                    <QRCodeSVG value={depositAddress} size={160} />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: '#0f1419',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #2d3748',
                                    maxWidth: '100%'
                                }}>
                                    <code style={{ color: '#3b82f6', wordBreak: 'break-all' }}>{depositAddress}</code>
                                    <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#8b92a7', cursor: 'pointer' }}>
                                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowReceive(false)}
                                    style={{ color: '#8b92a7', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <Loader2 className="animate-spin mx-auto" style={{ color: '#3b82f6' }} />
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid #2d3748', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <button
                            onClick={() => setActiveTab('assets')}
                            style={{
                                padding: '1rem 0',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'assets' ? '2px solid #3b82f6' : '2px solid transparent',
                                color: activeTab === 'assets' ? 'white' : '#8b92a7',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Assets
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            style={{
                                padding: '1rem 0',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'transactions' ? '2px solid #3b82f6' : '2px solid transparent',
                                color: activeTab === 'transactions' ? 'white' : '#8b92a7',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Transactions
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'assets' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { symbol: 'ckBTC', name: 'Chain Key Bitcoin', balance: ckbtcBalance, icon: '₿' },
                            { symbol: 'BTC', name: 'Bitcoin', balance: btcBalance, icon: '₿' }
                        ].map((asset) => (
                            <div key={asset.symbol} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                backgroundColor: '#1a1f26',
                                borderRadius: '12px',
                                border: '1px solid #2d3748'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f59e0b',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {asset.icon}
                                    </div>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 600 }}>{asset.name}</div>
                                        <div style={{ color: '#8b92a7', fontSize: '0.875rem' }}>{asset.symbol}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'white', fontWeight: 600 }}>{asset.balance.toFixed(8)}</div>
                                    <div style={{ color: '#8b92a7', fontSize: '0.875rem' }}>
                                        ≈ ${(asset.balance * 43000).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#8b92a7' }}>
                                No transactions found
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.tx_id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    backgroundColor: '#1a1f26',
                                    borderRadius: '12px',
                                    border: '1px solid #2d3748'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: tx.tx_type === 'deposit' || tx.tx_type === 'transfer_in' ? '#10b98120' : '#ef444420',
                                            color: tx.tx_type === 'deposit' || tx.tx_type === 'transfer_in' ? '#10b981' : '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {tx.tx_type === 'deposit' || tx.tx_type === 'transfer_in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 600 }}>
                                                {tx.tx_type === 'deposit' ? 'Deposit' : tx.tx_type === 'transfer_in' ? 'Received' : 'Sent'}
                                            </div>
                                            <div style={{ color: '#8b92a7', fontSize: '0.875rem' }}>
                                                {new Date(bigIntToNumber(tx.created_at) / 1000000).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            color: tx.tx_type === 'deposit' || tx.tx_type === 'transfer_in' ? '#10b981' : 'white',
                                            fontWeight: 600
                                        }}>
                                            {tx.tx_type === 'deposit' || tx.tx_type === 'transfer_in' ? '+' : '-'}{formatBTC(tx.amount)} {tx.currency}
                                        </div>
                                        <div style={{ color: '#8b92a7', fontSize: '0.875rem' }}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
