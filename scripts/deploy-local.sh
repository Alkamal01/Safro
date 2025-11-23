#!/bin/bash

# Safro Deployment Script for Local Development

echo "🚀 Starting Safro Local Deployment..."

# Check if DFX is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX is not installed. Please install: https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Start local replica in background
echo "📡 Starting local ICP replica..."
dfx start --clean --background

# Wait for replica to be ready
sleep 5

# Deploy all canisters
echo "📦 Deploying canisters..."
dfx deploy

# Get canister IDs
echo "📝 Getting canister IDs..."
ESCROW_ID=$(dfx canister id escrow)
WALLET_ID=$(dfx canister id wallet)
REPUTATION_ID=$(dfx canister id reputation)
AI_ID=$(dfx canister id ai_orchestration)
IDENTITY_ID=$(dfx canister id identity)

echo "✅ Canister deployment complete!"
echo ""
echo "Canister IDs:"
echo "  Escrow: $ESCROW_ID"
echo "  Wallet: $WALLET_ID"
echo "  Reputation: $REPUTATION_ID"
echo "  AI Orchestration: $AI_ID"
echo "  Identity: $IDENTITY_ID"
echo ""

# Create .env.local for frontend
echo "📄 Creating frontend .env.local..."
cat > frontend/.env.local << EOF
NEXT_PUBLIC_DFX_NETWORK=local
NEXT_PUBLIC_IC_HOST=http://localhost:4943

NEXT_PUBLIC_ESCROW_CANISTER_ID=$ESCROW_ID
NEXT_PUBLIC_WALLET_CANISTER_ID=$WALLET_ID
NEXT_PUBLIC_REPUTATION_CANISTER_ID=$REPUTATION_ID
NEXT_PUBLIC_AI_ORCHESTRATION_CANISTER_ID=$AI_ID
NEXT_PUBLIC_IDENTITY_CANISTER_ID=$IDENTITY_ID
EOF

echo "✅ Frontend environment configured!"
echo ""
echo "Next steps:"
echo "  1. Start local services: docker-compose up -d"
echo "  2. Install frontend dependencies: cd frontend && npm install"
echo "  3. Start frontend: npm run dev"
echo ""
echo "🎉 Deployment complete!"
