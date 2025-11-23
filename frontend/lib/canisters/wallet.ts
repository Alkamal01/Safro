// Wallet Canister Client

import { ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { createActor, CANISTER_IDS } from './agent';
import { walletIdlFactory } from './wallet.idl';

export interface WalletBalance {
    user_id: Principal;
    btc_balance: bigint;
    ckbtc_balance: bigint;
    pending_deposits: bigint;
    pending_withdrawals: bigint;
    last_updated: bigint;
}

export interface DepositAddress {
    user_id: Principal;
    address: string;
    currency: string;
    created_at: bigint;
}

export interface Transaction {
    tx_id: string;
    user_id: Principal;
    tx_type: string;
    amount: bigint;
    currency: string;
    status: string;
    created_at: bigint;
    confirmed_at: bigint | null;
}

export interface TransferParams {
    to: Principal;
    amount: bigint;
    currency: string;
}

export type WalletError =
    | { InsufficientBalance: null }
    | { InvalidAddress: null }
    | { InvalidAmount: null }
    | { TransferFailed: string }
    | { NotFound: null }
    | { Unauthorized: null };

export type Result<T> = { Ok: T } | { Err: WalletError };

export interface WalletActor {
    get_my_balance: () => Promise<[WalletBalance] | []>;
    get_my_transactions: () => Promise<Transaction[]>;
    get_deposit_address: (currency: string) => Promise<Result<DepositAddress>>;
    transfer: (params: TransferParams) => Promise<Result<WalletBalance>>;
    update_balance: (userId: Principal, amount: bigint, currency: string) => Promise<Result<WalletBalance>>;
}

class WalletCanisterClient {
    private actor: ActorSubclass<WalletActor> | null = null;

    private async getActor(): Promise<ActorSubclass<WalletActor>> {
        if (!this.actor) {
            this.actor = await createActor<WalletActor>(
                CANISTER_IDS.wallet,
                walletIdlFactory
            );
        }
        return this.actor;
    }

    async getMyBalance(): Promise<WalletBalance | null> {
        const actor = await this.getActor();
        const result = await actor.get_my_balance();
        return result[0] ?? null;
    }

    async getMyTransactions(): Promise<Transaction[]> {
        const actor = await this.getActor();
        return await actor.get_my_transactions();
    }

    async getDepositAddress(currency: string): Promise<DepositAddress> {
        const actor = await this.getActor();
        const result = await actor.get_deposit_address(currency);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    async transfer(params: TransferParams): Promise<WalletBalance> {
        const actor = await this.getActor();
        const result = await actor.transfer(params);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    // For testing/demo purposes only - in production this would be restricted
    async updateBalance(userId: Principal, amount: bigint, currency: string): Promise<WalletBalance> {
        const actor = await this.getActor();
        const result = await actor.update_balance(userId, amount, currency);

        if ('Ok' in result) {
            return result.Ok;
        } else {
            throw new Error(this.formatError(result.Err));
        }
    }

    private formatError(error: any): string {
        if ('InsufficientBalance' in error) return 'Insufficient balance';
        if ('InvalidAddress' in error) return 'Invalid address';
        if ('InvalidAmount' in error) return 'Invalid amount';
        if ('TransferFailed' in error) return `Transfer failed: ${error.TransferFailed}`;
        if ('NotFound' in error) return 'Not found';
        if ('Unauthorized' in error) return 'Unauthorized';
        return 'Unknown error';
    }

    resetActor(): void {
        this.actor = null;
    }
}

export const walletCanister = new WalletCanisterClient();
