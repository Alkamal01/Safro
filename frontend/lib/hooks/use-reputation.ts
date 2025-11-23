'use client';

import { useQuery } from '@tanstack/react-query';
import { getReputationActor } from '@/lib/ic-agent';
import { useAuth } from '@/lib/auth-provider';

export function useReputation(userId?: string) {
    const { isAuthenticated, principal } = useAuth();
    const targetId = userId || principal;

    return useQuery({
        queryKey: ['reputation', targetId],
        queryFn: async () => {
            const actor = await getReputationActor();
            if (userId) {
                const result = await actor.get_reputation(userId);
                return (result as any)[0] || null;
            } else {
                const result = await actor.get_my_reputation();
                return (result as any)[0] || null;
            }
        },
        enabled: isAuthenticated && !!targetId,
    });
}

export function useDisputeHistory(userId?: string) {
    const { isAuthenticated, principal } = useAuth();
    const targetId = userId || principal;

    return useQuery({
        queryKey: ['disputes', targetId],
        queryFn: async () => {
            const actor = await getReputationActor();
            return await actor.get_dispute_history(targetId!);
        },
        enabled: isAuthenticated && !!targetId,
    });
}
