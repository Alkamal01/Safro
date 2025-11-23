'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, Copy, QrCode, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function WalletPage() {
    const router = useRouter();
    const [showBTCQR, setShowBTCQR] = useState(false);
    const [showCkBTCQR, setShowCkBTCQR] = useState(false);

    // Mock data
    const wallet = {
        btc_balance: 0.15234567,
        ckbtc_balance: 0.08123456,
        pending_deposits: 0.01,
        btc_address: 'tb1q' + Math.random().toString(36).substr(2, 30),
        ckbtc_address: 'ckbtc-' + Math.random().toString(36).substr(2, 30),
    };

    const transactions = [
        { id: '1', type: 'deposit', amount: 0.05, currency: 'BTC', time: '2 hours ago', status: 'confirmed' },
        { id: '2', type: 'transfer_out', amount: 0.02, currency: 'ckBTC', time: '1 day ago', status: 'confirmed' },
        { id: '3', type: 'deposit', amount: 0.1, currency: 'ckBTC', time: '3 days ago', status: 'confirmed' },
        { id: '4', type: 'escrow', amount: 0.03, currency: 'BTC', time: '1 week ago', status: 'confirmed' },
    ];

    const totalUSD = ((wallet.btc_balance + wallet.ckbtc_balance) * 45000).toFixed(2);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Wallet</h1>
                <p className="text-muted-foreground">Manage your Bitcoin and ckBTC balances</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WalletIcon className="w-6 h-6 text-primary" />
                            Total Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                                <p className="text-4xl font-bold gradient-text">${totalUSD}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/30 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground mb-1">BTC Balance</p>
                                    <p className="text-xl font-bold">{wallet.btc_balance.toFixed(8)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ≈ ${(wallet.btc_balance * 45000).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-secondary/30 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground mb-1">ckBTC Balance</p>
                                    <p className="text-xl font-bold">{wallet.ckbtc_balance.toFixed(8)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ≈ ${(wallet.ckbtc_balance * 45000).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Deposits</p>
                                <p className="text-2xl font-bold">{wallet.pending_deposits.toFixed(8)} BTC</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Waiting for confirmations
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Deposit Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>BTC Deposit Address</CardTitle>
                            <button
                                onClick={() => setShowBTCQR(!showBTCQR)}
                                className="text-primary hover:text-accent transition-colors"
                            >
                                <QrCode className="w-5 h-5" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showBTCQR ? (
                            <div className="text-center space-y-4">
                                <div className="inline-block p-4 bg-white rounded-lg">
                                    <QRCodeSVG value={wallet.btc_address} size={160} level="H" />
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowBTCQR(false)}
                                >
                                    Hide QR Code
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <code className="flex-1 px-3 py-2 bg-secondary rounded-lg font-mono text-sm overflow-x-auto">
                                    {wallet.btc_address}
                                </code>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(wallet.btc_address)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>ckBTC Deposit Address</CardTitle>
                            <button
                                onClick={() => setShowCkBTCQR(!showCkBTCQR)}
                                className="text-primary hover:text-accent transition-colors"
                            >
                                <QrCode className="w-5 h-5" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showCkBTCQR ? (
                            <div className="text-center space-y-4">
                                <div className="inline-block p-4 bg-white rounded-lg">
                                    <QRCodeSVG value={wallet.ckbtc_address} size={160} level="H" />
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowCkBTCQR(false)}
                                >
                                    Hide QR Code
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <code className="flex-1 px-3 py-2 bg-secondary rounded-lg font-mono text-sm overflow-x-auto">
                                    {wallet.ckbtc_address}
                                </code>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(wallet.ckbtc_address)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type.includes('deposit') || tx.type.includes('transfer_in')
                                            ? 'bg-accent/20'
                                            : 'bg-primary/20'
                                        }`}>
                                        {tx.type.includes('deposit') || tx.type.includes('transfer_in') ? (
                                            <ArrowDownRight className="w-5 h-5 text-accent" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                                        <p className="text-sm text-muted-foreground">{tx.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.type.includes('deposit') || tx.type.includes('transfer_in')
                                            ? 'text-accent'
                                            : 'text-foreground'
                                        }`}>
                                        {tx.type.includes('deposit') || tx.type.includes('transfer_in') ? '+' : '-'}
                                        {tx.amount.toFixed(8)} {tx.currency}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
