import { Actor, HttpAgent } from '@dfinity/agent';

// This is a placeholder - in production, this would be generated from the Candid interface
export const idlFactory = ({ IDL }: any) => {
    return IDL.Service({
        'create_escrow': IDL.Func([IDL.Record({
            counterparty_id: IDL.Principal,
            amount_satoshis: IDL.Nat64,
            currency: IDL.Variant({ 'BTC': IDL.Null, 'ckBTC': IDL.Null }),
            time_lock_unix: IDL.Opt(IDL.Nat64),
        })], [IDL.Variant({
            'Ok': IDL.Record({
                escrow_id: IDL.Text,
                deposit_address: IDL.Text,
            }),
            'Err': IDL.Variant({
                'NotFound': IDL.Null,
                'Unauthorized': IDL.Null,
                'InvalidStatus': IDL.Null,
                'InsufficientFunds': IDL.Null,
                'TimeLockNotExpired': IDL.Null,
                'AlreadyConfirmed': IDL.Null,
                'InvalidAmount': IDL.Null,
                'InternalError': IDL.Text,
            }),
        })], []),
        'get_escrow': IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
            escrow_id: IDL.Text,
            creator_id: IDL.Principal,
            counterparty_id: IDL.Principal,
            amount_satoshis: IDL.Nat64,
            currency: IDL.Variant({ 'BTC': IDL.Null, 'ckBTC': IDL.Null }),
            deposit_address: IDL.Text,
            utxos: IDL.Vec(IDL.Record({
                txid: IDL.Text,
                vout: IDL.Nat32,
                amount_satoshis: IDL.Nat64,
                confirmations: IDL.Nat32,
            })),
            status: IDL.Variant({
                'Created': IDL.Null,
                'Funded': IDL.Null,
                'Delivered': IDL.Null,
                'Released': IDL.Null,
                'Refunded': IDL.Null,
                'Disputed': IDL.Null,
            }),
            time_lock_unix: IDL.Opt(IDL.Nat64),
            created_at: IDL.Nat64,
            updated_at: IDL.Nat64,
            ai_risk_score: IDL.Opt(IDL.Nat8),
            tags: IDL.Vec(IDL.Text),
            creator_confirmed_delivery: IDL.Bool,
            counterparty_confirmed_delivery: IDL.Bool,
        }))], ['query']),
    });
};

export const createActor = (canisterId: string, options: any) => {
    const agent = options.agent || new HttpAgent();
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
};
