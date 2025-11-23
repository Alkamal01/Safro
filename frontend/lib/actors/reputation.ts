import { Actor, HttpAgent } from '@dfinity/agent';

export const idlFactory = ({ IDL }: any) => {
    return IDL.Service({
        'get_my_reputation': IDL.Func([], [IDL.Opt(IDL.Record({
            user_id: IDL.Principal,
            completed_deals: IDL.Nat64,
            dispute_count: IDL.Nat64,
            avg_response_time_seconds: IDL.Nat64,
            trust_score: IDL.Nat8,
            badges: IDL.Vec(IDL.Text),
            last_update: IDL.Nat64,
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
