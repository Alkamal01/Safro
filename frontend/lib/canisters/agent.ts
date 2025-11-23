// IC Agent setup and configuration

import { HttpAgent, Actor, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Canister IDs - Update these with your deployed canister IDs
export const CANISTER_IDS = {
    escrow: process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    wallet: process.env.NEXT_PUBLIC_WALLET_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    identity: process.env.NEXT_PUBLIC_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
};

// IC Network configuration
const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app';
const IS_LOCAL = process.env.NEXT_PUBLIC_IC_HOST?.includes('localhost');

// Identity Provider URL
const IDENTITY_PROVIDER = IS_LOCAL
    ? `http://localhost:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`
    : 'https://identity.ic0.app';

let agent: HttpAgent | null = null;
let authClient: AuthClient | null = null;

/**
 * Initialize the IC agent
 */
export async function initAgent(): Promise<HttpAgent> {
    if (agent) return agent;

    agent = new HttpAgent({
        host: IC_HOST,
    });

    // Fetch root key for local development
    if (IS_LOCAL) {
        await agent.fetchRootKey();
    }

    return agent;
}

/**
 * Get or create AuthClient for Internet Identity
 */
export async function getAuthClient(): Promise<AuthClient> {
    if (authClient) return authClient;

    authClient = await AuthClient.create();
    return authClient;
}

/**
 * Login with Internet Identity
 */
export async function loginWithII(): Promise<Principal | null> {
    const client = await getAuthClient();

    return new Promise((resolve) => {
        client.login({
            identityProvider: IDENTITY_PROVIDER,
            onSuccess: async () => {
                const identity = client.getIdentity();
                const principal = identity.getPrincipal();

                // Update agent with authenticated identity
                agent = new HttpAgent({
                    host: IC_HOST,
                    identity,
                });

                if (IS_LOCAL) {
                    await agent.fetchRootKey();
                }

                resolve(principal);
            },
            onError: (error) => {
                console.error('II login failed:', error);
                resolve(null);
            },
        });
    });
}

/**
 * Logout from Internet Identity
 */
export async function logoutII(): Promise<void> {
    const client = await getAuthClient();
    await client.logout();

    // Reset agent to anonymous
    agent = new HttpAgent({
        host: IC_HOST,
    });

    if (IS_LOCAL) {
        await agent.fetchRootKey();
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const client = await getAuthClient();
    return await client.isAuthenticated();
}

/**
 * Get current principal
 */
export async function getPrincipal(): Promise<Principal | null> {
    const client = await getAuthClient();
    if (!(await client.isAuthenticated())) {
        return null;
    }

    const identity = client.getIdentity();
    return identity.getPrincipal();
}

/**
 * Create an actor for a canister
 */
export async function createActor<T>(
    canisterId: string,
    idlFactory: any
): Promise<ActorSubclass<T>> {
    const currentAgent = await initAgent();

    return Actor.createActor<T>(idlFactory, {
        agent: currentAgent,
        canisterId,
    });
}

/**
 * Get authenticated agent
 */
export async function getAgent(): Promise<HttpAgent> {
    return await initAgent();
}
