'use client';

import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { walletCanister, WalletBalance, Transaction, TransferParams } from '../canisters/wallet';
import { useIcp } from '../context/IcpContext';

export function useWallet() {
    const { principal, isAuthenticated } = useIcp();
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !principal) {
            setBalance(null);
            setTransactions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [bal, txs] = await Promise.all([
                walletCanister.getMyBalance(),
                walletCanister.getMyTransactions()
            ]);
            setBalance(bal);
            setTransactions(txs);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch wallet data';
            setError(message);
            console.error('Error fetching wallet data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [principal, isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData, isAuthenticated]);

    const getDepositAddress = async (currency: string) => {
        try {
            return await walletCanister.getDepositAddress(currency);
        } catch (err) {
            throw err;
        }
    };

    const transfer = async (params: TransferParams) => {
        try {
            const newBalance = await walletCanister.transfer(params);
            setBalance(newBalance);
            await fetchData(); // Refresh transactions
            return newBalance;
        } catch (err) {
            throw err;
        }
    };

    // For demo: faucet function
    const faucet = async (amount: bigint, currency: string) => {
        if (!principal) return;
        try {
            const newBalance = await walletCanister.updateBalance(principal, amount, currency);
            setBalance(newBalance);
            await fetchData();
            return newBalance;
        } catch (err) {
            throw err;
        }
    };

    return {
        balance,
        transactions,
        isLoading,
        error,
        refresh: fetchData,
        getDepositAddress,
        transfer,
        faucet
    };
}
