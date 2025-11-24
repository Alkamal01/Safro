// TypeScript types matching Rust canister types

import { Principal } from '@dfinity/principal';

export interface UTXO {
    txid: string;
    vout: number;
    amount_satoshis: bigint;
    confirmations: number;
}

export enum EscrowStatus {
    Created = 'Created',
    Funded = 'Funded',
    Delivered = 'Delivered',
    Released = 'Released',
    Refunded = 'Refunded',
    Disputed = 'Disputed',
}

export enum Currency {
    BTC = 'BTC',
    CkBTC = 'CkBTC',
}

export interface EscrowRecord {
    escrow_id: string;
    creator_id: Principal;
    counterparty_id: Principal;
    amount_satoshis: bigint;
    currency: Currency;
    deposit_address: string;
    utxos: UTXO[];
    status: EscrowStatus;
    time_lock_unix: bigint | null;
    created_at: bigint;
    updated_at: bigint;
    ai_risk_score: number | null;
    tags: string[];
    creator_confirmed_delivery: boolean;
    counterparty_confirmed_delivery: boolean;
}

export interface CreateEscrowParams {
    counterparty_id: Principal;
    amount_satoshis: bigint;
    currency: Currency;
    time_lock_unix: bigint | null;
}

export interface CreateEscrowResult {
    escrow_id: string;
    deposit_address: string;
}

export type EscrowError =
    | { NotFound: null }
    | { Unauthorized: null }
    | { InvalidStatus: null }
    | { InsufficientFunds: null }
    | { TimeLockNotExpired: null }
    | { AlreadyConfirmed: null }
    | { InvalidAmount: null }
    | { InternalError: string };

export type Result<T> = { Ok: T } | { Err: EscrowError };
