// Candid IDL Factory for Escrow Canister
// This defines the interface for the escrow canister

import { IDL } from '@dfinity/candid';

const UTXO = IDL.Record({
    txid: IDL.Text,
    vout: IDL.Nat32,
    amount_satoshis: IDL.Nat64,
    confirmations: IDL.Nat32,
});

const EscrowStatus = IDL.Variant({
    Created: IDL.Null,
    Funded: IDL.Null,
    Delivered: IDL.Null,
    Released: IDL.Null,
    Refunded: IDL.Null,
    Disputed: IDL.Null,
});

const Currency = IDL.Variant({
    BTC: IDL.Null,
    CkBTC: IDL.Null,
});

const EscrowRecord = IDL.Record({
    escrow_id: IDL.Text,
    creator_id: IDL.Principal,
    counterparty_id: IDL.Principal,
    amount_satoshis: IDL.Nat64,
    currency: Currency,
    deposit_address: IDL.Text,
    utxos: IDL.Vec(UTXO),
    status: EscrowStatus,
    time_lock_unix: IDL.Opt(IDL.Nat64),
    created_at: IDL.Nat64,
    updated_at: IDL.Nat64,
    ai_risk_score: IDL.Opt(IDL.Nat8),
    tags: IDL.Vec(IDL.Text),
    creator_confirmed_delivery: IDL.Bool,
    counterparty_confirmed_delivery: IDL.Bool,
});

const CreateEscrowParams = IDL.Record({
    counterparty_id: IDL.Principal,
    amount_satoshis: IDL.Nat64,
    currency: Currency,
    time_lock_unix: IDL.Opt(IDL.Nat64),
});

const CreateEscrowResult = IDL.Record({
    escrow_id: IDL.Text,
    deposit_address: IDL.Text,
});

const EscrowError = IDL.Variant({
    NotFound: IDL.Null,
    Unauthorized: IDL.Null,
    InvalidStatus: IDL.Null,
    InsufficientFunds: IDL.Null,
    TimeLockNotExpired: IDL.Null,
    AlreadyConfirmed: IDL.Null,
    InvalidAmount: IDL.Null,
    InternalError: IDL.Text,
});

const Result = (T: any) => IDL.Variant({
    Ok: T,
    Err: EscrowError,
});

export const escrowIdlFactory = ({ IDL }: { IDL: typeof import('@dfinity/candid').IDL }) => {
    return IDL.Service({
        // Create escrow
        create_escrow: IDL.Func([CreateEscrowParams], [Result(CreateEscrowResult)], []),

        // Query escrows
        get_escrow: IDL.Func([IDL.Text], [IDL.Opt(EscrowRecord)], ['query']),
        get_user_escrows: IDL.Func([IDL.Principal], [IDL.Vec(EscrowRecord)], ['query']),
        get_total_escrows: IDL.Func([], [IDL.Nat64], ['query']),
        get_escrows_by_status: IDL.Func([EscrowStatus], [IDL.Vec(EscrowRecord)], ['query']),

        // Update escrow
        notify_deposit: IDL.Func([IDL.Text, UTXO], [Result(EscrowRecord)], []),
        confirm_delivery: IDL.Func([IDL.Text], [Result(EscrowRecord)], []),
        request_release: IDL.Func([IDL.Text], [Result(EscrowRecord)], []),
        force_refund: IDL.Func([IDL.Text, IDL.Text], [Result(EscrowRecord)], []),
        mark_disputed: IDL.Func([IDL.Text, IDL.Text], [Result(EscrowRecord)], []),
        resolve_dispute: IDL.Func([IDL.Text, IDL.Text], [Result(EscrowRecord)], []),
        attach_ai_result: IDL.Func([IDL.Text, IDL.Nat8, IDL.Vec(IDL.Text)], [Result(EscrowRecord)], []),
    });
};

export type EscrowService = ReturnType<typeof escrowIdlFactory>;
