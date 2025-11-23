# Safro Canister IDs (Local Deployment)

Deployed on: 2025-11-20

## Canister IDs

- **Escrow**: `u6s2n-gx777-77774-qaaba-cai`
- **Wallet**: `ulvla-h7777-77774-qaacq-cai`
- **Reputation**: `umunu-kh777-77774-qaaca-cai`
- **AI Orchestration**: `uxrrr-q7777-77774-qaaaq-cai`
- **Identity**: `uzt4z-lp777-77774-qaabq-cai`

## Candid UI Links

- [Escrow Canister](http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai&id=u6s2n-gx777-77774-qaaba-cai)
- [Wallet Canister](http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai&id=ulvla-h7777-77774-qaacq-cai)
- [Reputation Canister](http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai&id=umunu-kh777-77774-qaaca-cai)
- [AI Orchestration Canister](http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai&id=uxrrr-q7777-77774-qaaaq-cai)
- [Identity Canister](http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai&id=uzt4z-lp777-77774-qaabq-cai)

## Frontend Environment

Copy these to `frontend/.env.local`:

```bash
NEXT_PUBLIC_DFX_NETWORK=local
NEXT_PUBLIC_IC_HOST=http://localhost:4943

NEXT_PUBLIC_ESCROW_CANISTER_ID=u6s2n-gx777-77774-qaaba-cai
NEXT_PUBLIC_WALLET_CANISTER_ID=ulvla-h7777-77774-qaacq-cai
NEXT_PUBLIC_REPUTATION_CANISTER_ID=umunu-kh777-77774-qaaca-cai
NEXT_PUBLIC_AI_ORCHESTRATION_CANISTER_ID=uxrrr-q7777-77774-qaaaq-cai
NEXT_PUBLIC_IDENTITY_CANISTER_ID=uzt4z-lp777-77774-qaabq-cai
NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID=ucwa4-rx777-77774-qaada-cai
```
