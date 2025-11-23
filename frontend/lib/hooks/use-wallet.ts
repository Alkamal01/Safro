'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWalletActor } from '@/lib/ic-agent';
import { useAuth } from '@/lib/auth-provider';

export function useWalletBalance() {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['wallet', 'balance'],
        queryFn: async () => {
            const actor = await getWalletActor();
            const result = await actor.get_my_balance();
            return (result as any)[0] || null;
        },
        enabled: isAuthenticated,
        refetchInterval: 30000, // Refetch every 30s
    });
}

export function useWalletTransactions() {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['wallet', 'transactions'],
        queryFn: async () => {
            const actor = await getWalletActor();
            return await actor.get_my_transactions();
        },
        enabled: isAuthenticated,
    });
}

export function useDepositAddress() {
    return useMutation({
        mutationFn: async (currency: 'BTC' | 'ckBTC') => {
            const actor = await getWalletActor();
            const result = await actor.get_deposit_address(currency);

            if ('Err' in (result as any)) {
                throw new Error('Failed to get deposit address');
            }

            return (result as any).Ok;
        },
    });
}

export function useTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            to: string;
            amount: number;
            currency: 'BTC' | 'ckBTC';
        }) => {
            const actor = await getWalletActor();
            const result = await actor.transfer({
                to: params.to,
                amount: BigInt(params.amount),
                currency: params.currency,
            });

            if ('Err' in (result as any)) {
                throw new Error('Transfer failed');
            }

            return (result as any).Ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
}
