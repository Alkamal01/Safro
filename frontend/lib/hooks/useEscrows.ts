'use client';

import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { escrowCanister } from '../canisters/escrow';
import {
    EscrowRecord,
    CreateEscrowParams,
    CreateEscrowResult,
    EscrowStatus,
} from '../types/canister';
import { useIcp } from '../context/IcpContext';

export function useEscrows() {
    const { principal, isAuthenticated } = useIcp();
    const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's escrows
    const fetchEscrows = useCallback(async () => {
        if (!isAuthenticated || !principal) {
            setEscrows([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const userEscrows = await escrowCanister.getUserEscrows(principal);
            setEscrows(userEscrows);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch escrows';
            setError(message);
            console.error('Error fetching escrows:', err);
        } finally {
            setIsLoading(false);
        }
    }, [principal, isAuthenticated]);

    // Auto-fetch on mount and when principal changes
    useEffect(() => {
        fetchEscrows();
    }, [fetchEscrows]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(fetchEscrows, 30000);
        return () => clearInterval(interval);
    }, [fetchEscrows, isAuthenticated]);

    // Create new escrow
    const createEscrow = async (params: CreateEscrowParams): Promise<CreateEscrowResult> => {
        setError(null);
        try {
            console.log('useEscrows: Creating escrow with params:', params);

            // Convert to Candid format - explicitly map fields to preserve BigInt
            const candidParams = {
                counterparty_id: params.counterparty_id,
                amount_satoshis: params.amount_satoshis,
                currency: params.currency === 'BTC' ? { BTC: null } : { CkBTC: null },
                time_lock_unix: params.time_lock_unix ? [params.time_lock_unix] : [],
            };

            console.log('useEscrows: Candid params:', {
                ...candidParams,
                amount_satoshis: candidParams.amount_satoshis.toString(),
                time_lock_unix: candidParams.time_lock_unix.map(t => t.toString())
            });

            const result = await escrowCanister.createEscrow(candidParams as any);

            console.log('useEscrows: Escrow created, result:', result);

            // Optimistically add to list (will be refreshed)
            await fetchEscrows();

            // TODO: In production, trigger AI gateway to analyze escrow
            // For demo: Generate mock AI risk score (remove this in production)
            if (result.escrow_id) {
                // Mock AI analysis based on amount (for demo only)
                const mockRiskScore = Math.min(95, Math.max(15, 50 + Math.floor(Math.random() * 30)));
                console.log(`Mock AI Risk Score for ${result.escrow_id}: ${mockRiskScore}/100`);
            }

            return result;
        } catch (err) {
            console.error('useEscrows: Error creating escrow:', err);
            const message = err instanceof Error ? err.message : 'Failed to create escrow';
            setError(message);
            throw err;
        }
    };

    // Get single escrow
    const getEscrow = async (escrowId: string): Promise<EscrowRecord | null> => {
        setError(null);
        try {
            return await escrowCanister.getEscrow(escrowId);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to get escrow';
            setError(message);
            throw err;
        }
    };

    // Confirm delivery
    const confirmDelivery = async (escrowId: string): Promise<void> => {
        setError(null);
        try {
            await escrowCanister.confirmDelivery(escrowId);
            await fetchEscrows();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to confirm delivery';
            setError(message);
            throw err;
        }
    };

    // Request release
    const requestRelease = async (escrowId: string): Promise<void> => {
        setError(null);
        try {
            await escrowCanister.requestRelease(escrowId);
            await fetchEscrows();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to request release';
            setError(message);
            throw err;
        }
    };

    // Mark disputed
    const markDisputed = async (escrowId: string, reason: string): Promise<void> => {
        setError(null);
        try {
            await escrowCanister.markDisputed(escrowId, reason);
            await fetchEscrows();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to mark as disputed';
            setError(message);
            throw err;
        }
    };

    // Force refund
    const forceRefund = async (escrowId: string, reason: string): Promise<void> => {
        setError(null);
        try {
            await escrowCanister.forceRefund(escrowId, reason);
            await fetchEscrows();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to refund';
            setError(message);
            throw err;
        }
    };

    // Calculate stats
    const getStatusString = (status: any): string => {
        if (typeof status === 'string') return status;
        if (typeof status === 'object' && status !== null) {
            const keys = Object.keys(status);
            if (keys.length > 0) return keys[0];
        }
        return 'Unknown';
    };

    const stats = {
        total: escrows.length,
        active: escrows.filter(e => {
            const status = getStatusString(e.status);
            return status === 'Funded' || status === 'Created';
        }).length,
        completed: escrows.filter(e => getStatusString(e.status) === 'Released').length,
        disputed: escrows.filter(e => getStatusString(e.status) === 'Disputed').length,
        totalValue: escrows.reduce((sum, e) => sum + Number(e.amount_satoshis.toString()), 0),
    };

    return {
        escrows,
        isLoading,
        error,
        stats,
        fetchEscrows,
        createEscrow,
        getEscrow,
        confirmDelivery,
        requestRelease,
        markDisputed,
        forceRefund,
    };
}
