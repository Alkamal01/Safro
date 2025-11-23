# Safro - Decentralized Escrow Platform

Safro is a Bitcoin escrow platform built on the Internet Computer Protocol (ICP) with AI-powered risk assessment, multi-channel access (web, mobile PWA, USSD), and agent network integration.

## Architecture

- **On-chain (ICP Canisters)**: Escrow logic, wallet coordination, reputation, AI orchestration, identity
- **Off-chain Services**: AI gateway, API gateway, USSD/VAS, notifications, agent management, reconciliation
- **Client Layer**: Next.js web app + PWA, USSD interface

## Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install) (DFINITY SDK)
- [Rust](https://rustup.rs/) (with wasm32-unknown-unknown target)
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) and Docker Compose

## Quick Start

### 1. Install dependencies

```bash
# Install Rust wasm target
rustup target add wasm32-unknown-unknown

# Install Node dependencies
npm install
cd frontend && npm install && cd ..
```

### 2. Start local services

```bash
# Start PostgreSQL, Redis, NATS, Prometheus, Grafana
npm run dev:services
```

### 3. Deploy canisters locally

```bash
# Start local ICP replica and deploy canisters
npm run canister:local
```

### 4. Start frontend

```bash
npm run dev:frontend
```

The frontend will be available at http://localhost:3000

## Project Structure

```
Safro/
├── canisters/          # ICP Rust canisters
├── services/           # Off-chain Rust services
├── frontend/           # Next.js application
├── shared/             # Shared types
├── database/           # SQL migrations
├── config/             # Configuration files
├── scripts/            # Utility scripts
└── docs/              # Documentation
```

## Development

### Running Tests

```bash
# Rust tests
cargo test

# Frontend tests
npm run test:frontend
```

### Building for Production

```bash
# Build canisters
cargo build --release --target wasm32-unknown-unknown

# Build frontend
npm run build:frontend
```

## Services

- **Frontend**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **NATS**: localhost:4222

## Documentation

See the `/docs` directory for detailed documentation on:
- Architecture overview
- API documentation
- Deployment guide
- Development workflows

## License

MIT
