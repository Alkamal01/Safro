'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEscrowActor } from '@/lib/ic-agent';
import { useAuth } from '@/lib/auth-provider';

export function useEscrows() {
    const { principal, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['escrows', principal],
        queryFn: async () => {
            if (!isAuthenticated) return [];
            const actor = await getEscrowActor();
            // Call get_user_escrows from canister
            // const escrows = await actor.get_user_escrows(principal);
            // For now, return mock data until we connect
            return [];
        },
        enabled: isAuthenticated,
    });
}

export function useEscrow(escrowId: string) {
    return useQuery({
        queryKey: ['escrow', escrowId],
        queryFn: async () => {
            const actor = await getEscrowActor();
            const result = await actor.get_escrow(escrowId);
            return (result as any)[0] || null; // Candid returns Option as array
        },
        enabled: !!escrowId,
    });
}

export function useCreateEscrow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            counterparty_id: string;
            amount_satoshis: number;
            currency: 'BTC' | 'ckBTC';
            time_lock_unix?: number;
        }) => {
            const actor = await getEscrowActor();
            const result = await actor.create_escrow({
                counterparty_id: params.counterparty_id,
                amount_satoshis: BigInt(params.amount_satoshis),
                currency: params.currency === 'BTC' ? { BTC: null } : { ckBTC: null },
                time_lock_unix: params.time_lock_unix ? [BigInt(params.time_lock_unix)] : [],
            });

            if ('Err' in (result as any)) {
                throw new Error('Failed to create escrow');
            }

            return (result as any).Ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escrows'] });
        },
    });
}

export function useConfirmDelivery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (escrowId: string) => {
            const actor = await getEscrowActor();
            const result = await actor.confirm_delivery(escrowId);

            if ('Err' in (result as any)) {
                throw new Error('Failed to confirm delivery');
            }

            return (result as any).Ok;
        },
        onSuccess: (_, escrowId) => {
            queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
            queryClient.invalidateQueries({ queryKey: ['escrows'] });
        },
    });
}

export function useReleaseEscrow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (escrowId: string) => {
            const actor = await getEscrowActor();
            const result = await actor.request_release(escrowId);

            if ('Err' in (result as any)) {
                throw new Error('Failed to release escrow');
            }

            return (result as any).Ok;
        },
        onSuccess: (_, escrowId) => {
            queryClient.invalidateQueries({ queryKey: ['escrow', escrowId] });
            queryClient.invalidateQueries({ queryKey: ['escrows'] });
        },
    });
}
