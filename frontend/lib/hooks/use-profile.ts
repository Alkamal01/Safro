'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIdentityActor } from '@/lib/ic-agent';
import { useAuth } from '@/lib/auth-provider';

export function useProfile(userId?: string) {
    const { isAuthenticated, principal } = useAuth();
    const targetId = userId || principal;

    return useQuery({
        queryKey: ['profile', targetId],
        queryFn: async () => {
            const actor = await getIdentityActor();
            if (userId) {
                const result = await actor.get_profile(userId);
                return (result as any)[0] || null;
            } else {
                const result = await actor.get_my_profile();
                return (result as any)[0] || null;
            }
        },
        enabled: isAuthenticated && !!targetId,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            username?: string;
            phone_number?: string;
            email?: string;
            avatar_url?: string;
            bio?: string;
        }) => {
            const actor = await getIdentityActor();
            const result = await actor.update_profile({
                username: params.username ? [params.username] : [],
                phone_number: params.phone_number ? [params.phone_number] : [],
                email: params.email ? [params.email] : [],
                avatar_url: params.avatar_url ? [params.avatar_url] : [],
                bio: params.bio ? [params.bio] : [],
            });

            if ('Err' in (result as any)) {
                throw new Error('Failed to update profile');
            }

            return (result as any).Ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

export function useCreateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const actor = await getIdentityActor();
            const result = await actor.create_profile();

            if ('Err' in (result as any)) {
                throw new Error('Profile already exists or creation failed');
            }

            return (result as any).Ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
