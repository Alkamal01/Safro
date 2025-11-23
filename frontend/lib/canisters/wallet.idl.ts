// Candid IDL Factory for Wallet Canister

import { IDL } from '@dfinity/candid';

const WalletBalance = IDL.Record({
    user_id: IDL.Principal,
    btc_balance: IDL.Nat64,
    ckbtc_balance: IDL.Nat64,
    pending_deposits: IDL.Nat64,
    pending_withdrawals: IDL.Nat64,
    last_updated: IDL.Nat64,
});

const DepositAddress = IDL.Record({
    user_id: IDL.Principal,
    address: IDL.Text,
    currency: IDL.Text,
    created_at: IDL.Nat64,
});

const Transaction = IDL.Record({
    tx_id: IDL.Text,
    user_id: IDL.Principal,
    tx_type: IDL.Text,
    amount: IDL.Nat64,
    currency: IDL.Text,
    status: IDL.Text,
    created_at: IDL.Nat64,
    confirmed_at: IDL.Opt(IDL.Nat64),
});

const TransferParams = IDL.Record({
    to: IDL.Principal,
    amount: IDL.Nat64,
    currency: IDL.Text,
});

const WalletError = IDL.Variant({
    InsufficientBalance: IDL.Null,
    InvalidAddress: IDL.Null,
    InvalidAmount: IDL.Null,
    TransferFailed: IDL.Text,
    NotFound: IDL.Null,
    Unauthorized: IDL.Null,
});

const Result = (T: any) => IDL.Variant({
    Ok: T,
    Err: WalletError,
});

export const walletIdlFactory = ({ IDL }: { IDL: typeof import('@dfinity/candid').IDL }) => {
    return IDL.Service({
        get_my_balance: IDL.Func([], [IDL.Opt(WalletBalance)], ['query']),
        get_my_transactions: IDL.Func([], [IDL.Vec(Transaction)], ['query']),
        get_deposit_address: IDL.Func([IDL.Text], [Result(DepositAddress)], []),
        transfer: IDL.Func([TransferParams], [Result(WalletBalance)], []),
        update_balance: IDL.Func([IDL.Principal, IDL.Nat64, IDL.Text], [Result(WalletBalance)], []),
    });
};

export type WalletService = ReturnType<typeof walletIdlFactory>;
