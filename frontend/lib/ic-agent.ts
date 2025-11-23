import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { createActor as createEscrowActor } from './actors/escrow';
import { createActor as createWalletActor } from './actors/wallet';
import { createActor as createReputationActor } from './actors/reputation';
import { createActor as createIdentityActor } from './actors/identity';

const isDevelopment = process.env.NODE_ENV === 'development';
const host = isDevelopment ? 'http://localhost:4943' : 'https://icp-api.io';

export async function createAgent() {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    const agent = new HttpAgent({
        host,
        identity,
    });

    if (isDevelopment) {
        await agent.fetchRootKey();
    }

    return agent;
}

export async function getEscrowActor() {
    const agent = await createAgent();
    const canisterId = process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID || '';
    return createEscrowActor(canisterId, { agent });
}

export async function getWalletActor() {
    const agent = await createAgent();
    const canisterId = process.env.NEXT_PUBLIC_WALLET_CANISTER_ID || '';
    return createWalletActor(canisterId, { agent });
}

export async function getReputationActor() {
    const agent = await createAgent();
    const canisterId = process.env.NEXT_PUBLIC_REPUTATION_CANISTER_ID || '';
    return createReputationActor(canisterId, { agent });
}

export async function getIdentityActor() {
    const agent = await createAgent();
    const canisterId = process.env.NEXT_PUBLIC_IDENTITY_CANISTER_ID || '';
    return createIdentityActor(canisterId, { agent });
}

export async function login() {
    const authClient = await AuthClient.create();

    // Use production Internet Identity for easier development
    // Local II requires additional setup
    const identityProvider = 'https://identity.ic0.app';

    console.log('Logging in with II provider:', identityProvider);

    return new Promise<boolean>((resolve) => {
        authClient.login({
            identityProvider,
            onSuccess: () => resolve(true),
            onError: (err) => {
                console.error('Login error:', err);
                resolve(false);
            },
        });
    });
}

export async function logout() {
    const authClient = await AuthClient.create();
    await authClient.logout();
}

export async function isAuthenticated() {
    const authClient = await AuthClient.create();
    return await authClient.isAuthenticated();
}

export async function getPrincipal() {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    return identity.getPrincipal();
}
