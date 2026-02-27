# WebTrack - Solana Wallet Tracker

A web-based Solana wallet tracker with real-time transaction monitoring and advanced token analysis. Built with Next.js 14, featuring a stunning 3D Glassmorphism UI design.

![WebTrack](https://img.shields.io/badge/Solana-WebTrack-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

## ✨ Features

- **Real-time Tracking**: Monitor Solana wallet transactions in real-time
- **Multi-Platform Support**: Tracks transactions on PumpFun, Raydium, Jupiter, Orca, and more
- **Token Analysis**: View market cap, liquidity, holders, and security indicators
- **Risk Assessment**: Automatic risk level calculation for tokens
- **3D Glassmorphism UI**: Beautiful dark theme with neon glow effects
- **No Login Required**: Open access for all users
- **Separate Database**: Independent from the Telegram bot

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Solana RPC endpoint (optional: Helius for better performance)

### Installation

1. **Clone and install dependencies:**
```bash
cd webtrack
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL_WEBTRACK="postgresql://user:password@localhost:5432/webtrack"
SOLANA_RPC_URLS="https://api.mainnet-beta.solana.com"
```

3. **Initialize the database:**
```bash
npm run db:push
```

4. **Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
webtrack/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── wallets/       # Wallet CRUD
│   │   │   └── transactions/  # Transaction queries
│   │   ├── wallets/           # Wallet Management page
│   │   ├── page.tsx           # Tracker (home) page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   │   ├── GlassCard.tsx
│   │   │   └── NeonButton.tsx
│   │   ├── WalletCard.tsx     # Wallet display card
│   │   ├── TransactionRow.tsx # Transaction display
│   │   ├── TokenMetadata.tsx  # Token info display
│   │   └── AddWalletModal.tsx # Add wallet modal
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   └── tracker.ts         # Solana tracking logic
│   └── types/
│       └── index.ts           # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

## 🎨 Design System

### Colors

| Name | Value | Usage |
|------|-------|-------|
| Void | `#000000` | Background |
| Glass Medium | `rgba(20,20,25,0.6)` | Card backgrounds |
| Plasma Gray | `#9CA3AF` | Neon glows, accents |
| Neon Green | `#22C55E` | BUY indicators |
| Neon Red | `#EF4444` | SELL indicators |

### Glassmorphism Effects

```css
.glass-card {
  background: rgba(20, 20, 25, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

## 📊 API Endpoints

### Wallets

- `GET /api/wallets` - Get all wallets with recent transactions
- `POST /api/wallets` - Add a new wallet
- `GET /api/wallets/[id]` - Get wallet by ID
- `PUT /api/wallets/[id]` - Update wallet (name, isActive)
- `DELETE /api/wallets/[id]` - Delete wallet

### Transactions

- `GET /api/transactions` - Get transactions (with filters)
  - Query params: `walletId`, `type`, `page`, `limit`
- `POST /api/transactions` - Create transaction (internal)

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL_WEBTRACK` | Yes | PostgreSQL connection string |
| `SOLANA_RPC_URLS` | No | Comma-separated RPC URLs |
| `HELIUS_API_KEY` | No | For enhanced RPC performance |
| `BIRDEYE_API_KEY` | No | For token metadata |
| `MORALIS_API_KEY` | No | For token metadata |

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **Mint Authority Check**: Shows if mint authority is revoked
- **Freeze Authority Check**: Shows if freeze authority is revoked
- **LP Burn Status**: Indicates if liquidity is burned
- **Risk Level**: Auto-calculated risk assessment (low/medium/high/critical)

## 📈 Supported Platforms

- **PumpFun** - Bonding curve tokens
- **PumpSwap** - PumpFun AMM
- **Raydium** - DEX swaps
- **Jupiter** - Aggregator swaps
- **Orca** - DEX swaps
- **Meteora** - DEX swaps

## 🤝 Integration with TrackMe

WebTrack is designed to run independently from the TrackMe Telegram bot:

- Separate database tables (`WebWallet`, `WebTransaction`)
- No shared state with the bot
- Can use the same RPC endpoints
- Can be deployed on a different server

## 📝 License

MIT License - See LICENSE file for details.

## 🙏 Credits

- Built on [TrackMe](../) Solana tracking logic
- UI inspired by modern DeFi dashboards
- Powered by Solana Web3.js