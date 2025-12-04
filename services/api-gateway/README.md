# Safro API Gateway

Backend API for Safro blockchain escrow platform with USSD support via Africa's Talking.

## Architecture

The backend follows a feature-based structure:

```
src/
├── features/
│   ├── auth/          # Authentication & user management
│   ├── kyc/            # KYC verification
│   ├── escrow/         # Escrow transactions & deal codes
│   ├── ussd/           # USSD menu handling
│   ├── notification/   # SMS/WhatsApp notifications
│   ├── reputation/     # Trust scores & badges
│   └── wallet/         # Wallet balance management
├── shared/             # Shared utilities
│   ├── config.rs       # Configuration
│   ├── errors.rs       # Error handling
│   ├── middleware.rs   # Auth middleware
│   └── utils.rs        # Helper functions
└── main.rs             # Application entry point
```

Each feature follows the pattern:
- `controller.rs` - HTTP handlers
- `service.rs` - Business logic
- `dto.rs` - Data transfer objects
- `model.rs` - Database models
- `repository.rs` - Database access

## Setup

### 1. Environment Variables

Create a `.env` file with the following:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/safro

# Redis (for USSD sessions)
REDIS_URL=redis://localhost:6379

# Internet Computer
IC_HOST=http://localhost:4943

# Server
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
TOKEN_EXPIRY_HOURS=24

# Africa's Talking (USSD & SMS)
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username_here
AFRICASTALKING_SMS_SENDER_ID=SAFRO
AFRICASTALKING_USSD_SHORT_CODE=*XYZ#

# USSD Configuration
USSD_SESSION_TTL=300
DEAL_CODE_EXPIRY_HOURS=24
```

### 2. Africa's Talking Setup

1. **Create Account**: Go to https://africastalking.com and create an account
2. **Get API Credentials**:
   - Navigate to Dashboard → API → API Key
   - Copy your `API Key` and `Username`
3. **Configure USSD**:
   - Go to USSD → Create USSD Service
   - Set callback URL: `https://your-domain.com/api/ussd/webhook`
   - Set short code (e.g., `*XYZ#`)
4. **Configure SMS**:
   - Go to SMS → Settings
   - Set sender ID (e.g., `SAFRO`)

### 3. Database Migrations

Run the migrations:

```bash
# Make sure you have the database created
psql -U postgres -c "CREATE DATABASE safro;"

# Run migrations
psql -U postgres -d safro -f database/migrations/001_initial_schema.sql
psql -U postgres -d safro -f database/migrations/002_users_auth.sql
psql -U postgres -d safro -f database/migrations/003_ussd_escrow_features.sql
```

### 4. Redis Setup

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 5. Run the Server

```bash
cd services/api-gateway
cargo run
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### KYC
- `POST /api/kyc/initiate` - Start KYC process (protected)
- `GET /api/kyc/status` - Get KYC status (protected)

### Escrow
- `POST /api/escrow` - Create escrow payment (protected)
- `POST /api/escrow/fund` - Fund escrow (protected)
- `POST /api/escrow/release` - Release payment (protected)
- `GET /api/escrow/status/:deal_code` - Check deal status (public)

### USSD
- `POST /api/ussd/webhook` - Africa's Talking USSD webhook (public)

### Notifications
- `POST /api/notification/sms` - Send SMS (protected)

### Reputation
- `GET /api/reputation/:user_id` - Get user reputation (public)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance (protected)

## USSD Flow

1. User dials `*XYZ#`
2. Africa's Talking sends request to `/api/ussd/webhook`
3. System processes menu selection
4. Returns formatted USSD response

### Menu Structure
```
Main Menu
├── 1. Create Payment Request
│   ├── Enter amount
│   ├── Enter buyer phone
│   └── Select currency
├── 2. Release Payment
│   ├── Enter Deal Code
│   └── Enter Approval PIN
├── 3. Check Deal Status
│   └── Enter Deal Code
├── 4. My Trust Score
└── 5. Help
```

## Escrow Flow

1. **Seller creates escrow**:
   - Via USSD or API
   - System generates 6-digit Deal Code
   - SMS sent to buyer

2. **Buyer funds escrow**:
   - Via SMS reply: `FUND 107492`
   - Or via USSD menu
   - Funds locked in escrow

3. **Delivery happens**:
   - Normal business process
   - Dispute available if needed

4. **Buyer releases payment**:
   - Via USSD: Enter Deal Code + PIN
   - Payment released instantly
   - Trust scores updated

5. **Seller receives payment**:
   - Payout to mobile money/bank/crypto
   - SMS confirmation sent

## Trust Score Calculation

- Base score: 50
- Completed deals: +5 points each (max 40)
- Disputes: -10 points each (max -30)
- Final score: 0-100

### Badges
- 90-100: "Trusted Seller"
- 80-89: "Reliable Trader"
- 70-79: "Good Standing"
- 60-69: "New User"
- 0-59: "Building Reputation"

## Testing

### Test USSD Webhook

```bash
curl -X POST http://localhost:3001/api/ussd/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test123",
    "phone_number": "+2348012345678",
    "service_code": "*XYZ#",
    "text": ""
  }'
```

### Test Create Escrow

```bash
curl -X POST http://localhost:3001/api/escrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 4500000,
    "currency": "NGN",
    "buyer_phone": "+2348012345678"
  }'
```

## Deployment

See `DEPLOYMENT.md` in the root directory for deployment instructions.

## Notes

- USSD sessions are stored in Redis with 5-minute TTL
- Deal codes expire after 24 hours (configurable)
- SMS notifications are sent asynchronously
- Trust scores are recalculated after each deal completion

