import { Actor, HttpAgent } from '@dfinity/agent';

export const idlFactory = ({ IDL }: any) => {
    return IDL.Service({
        'get_my_balance': IDL.Func([], [IDL.Opt(IDL.Record({
            user_id: IDL.Principal,
            btc_balance: IDL.Nat64,
            ckbtc_balance: IDL.Nat64,
            pending_deposits: IDL.Nat64,
            pending_withdrawals: IDL.Nat64,
            last_updated: IDL.Nat64,
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
