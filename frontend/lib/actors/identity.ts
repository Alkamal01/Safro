import { Actor, HttpAgent } from '@dfinity/agent';

export const idlFactory = ({ IDL }: any) => {
    return IDL.Service({
        'get_my_profile': IDL.Func([], [IDL.Opt(IDL.Record({
            principal_id: IDL.Principal,
            username: IDL.Opt(IDL.Text),
            phone_number: IDL.Opt(IDL.Text),
            email: IDL.Opt(IDL.Text),
            avatar_url: IDL.Opt(IDL.Text),
            bio: IDL.Opt(IDL.Text),
            kyc_level: IDL.Nat8,
            is_agent: IDL.Bool,
            badges: IDL.Vec(IDL.Text),
            created_at: IDL.Nat64,
            updated_at: IDL.Nat64,
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
