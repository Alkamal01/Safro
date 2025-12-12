# Safro - AI-Powered Native Bitcoin Escrow

**Safro** is a decentralized escrow platform built on the Internet Computer (ICP) that solves the $2.3B P2P crypto scam problem. By combining **Native Bitcoin** integration, **AI Risk Assessment**, and **USSD** accessibility, Safro brings secure, trustless transactions to the next billion users.

🚀 **Live Demo:** [https://safroo.vercel.app](https://safroo.vercel.app)  
📺 **Demo Video:** [Watch on YouTube](https://youtu.be/example) (Replace with actual link)

## 🌟 Key Features

### 1. Native Bitcoin Escrow (No Bridges)
- **Direct Integration:** Uses ICP's threshold signatures (Chain Fusion) to hold and release real BTC directly on the Bitcoin network.
- **Trustless:** No bridges, no wrapped tokens, no centralized custodians.
- **Low Fees:** Transactions cost pennies compared to traditional escrow services ($500+).

### 2. AI-Powered Risk Assessment
- **Real-Time Analysis:** Every escrow is analyzed by our AI engine for fraud patterns.
- **Risk Scoring:** Users see a clear 0-100 risk score before funding.
- **Smart Alerts:** AI flags suspicious amounts, new accounts, or unusual patterns.

### 3. Universal Access (USSD)
- **Feature Phone Support:** Works on any mobile phone via USSD (`*123#`).
- **No Internet Needed:** Users in emerging markets can create and manage escrows via SMS/USSD.
- **Inclusive:** Bringing DeFi security to the 2.5 billion people without smartphones.

### 4. On-Chain Reputation
- **Credit Scores:** Successful transactions build an immutable on-chain credit history.
- **Trust Identity:** Users can prove their reliability across platforms.

## 🏗 Architecture

Safro leverages the full power of the Internet Computer:

- **Frontend:** Next.js 14 (Hosted on Vercel/ICP)
- **Canisters (Smart Contracts):**
  - `escrow`: Core logic, holding BTC, state management
  - `ai_orchestration`: Stores AI analysis results
  - `wallet`: Manages user balances and transactions
- **Integrations:**
  - **Bitcoin Network:** Native integration via `bitcoin_testnet` / `bitcoin_mainnet`
  - **Internet Identity:** Secure, privacy-preserving authentication
  - **OpenAI/Groq:** Off-chain AI analysis via Gateway

## 🚀 Live Deployment (Mainnet)

| Service | Canister ID / URL |
|---------|-------------------|
| **Frontend** | [safroo.vercel.app](https://safroo.vercel.app) |
| **Escrow Canister** | `3jv2i-tyaaa-aaaae-acxnq-cai` |
| **AI Orchestration** | `3awru-fqaaa-aaaae-acxma-cai` |
| **Wallet Canister** | `3g7ni-qiaaa-aaaae-acxna-cai` |

## 🛠 Local Development

### Prerequisites
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- Node.js v18+
- Rust (wasm32 target)

### Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/Alkamal01/Safro.git
   cd Safro
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Start local replica**
   ```bash
   dfx start --background --clean
   ```

4. **Deploy canisters**
   ```bash
   # Deploys all canisters and generates declarations
   dfx deploy
   ```

5. **Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
