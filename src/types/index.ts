// Wallet Types
export interface Wallet {
  id: string
  address: string
  name: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  transactions?: Transaction[]
}

export interface WalletWithStats extends Wallet {
  transactionCount: number
  lastTransaction?: Transaction
  solBalance?: number
}

// Transaction Types
export interface Transaction {
  id: string
  signature: string
  walletId: string
  type: 'buy' | 'sell' | 'transfer'
  platform?: string
  tokenIn?: string
  tokenOut?: string
  tokenInMint?: string
  tokenOutMint?: string
  amountIn?: string
  amountOut?: string
  tokenMint?: string
  tokenSymbol?: string
  tokenName?: string
  tokenImage?: string
  marketCap?: number
  liquidity?: number
  priceUsd?: number
  solPrice?: number
  holdingBalance?: string
  holdingPercent?: string
  metadata?: TokenMetadata
  blockTime?: Date
  timestamp: Date
}

// Token Metadata Types
export interface TokenMetadata {
  mint: string
  name: string
  symbol: string
  decimals: number
  description?: string
  image?: string
  priceUsd?: number
  priceSol?: number
  marketCap?: number
  liquidity?: number
  volume24h?: number
  priceChange24h?: number
  totalHolders?: number
  top10HoldersPercentage?: number
  mintAuthority?: string | null
  mintAuthorityRevoked?: boolean
  freezeAuthority?: string | null
  freezeAuthorityRevoked?: boolean
  lpBurned?: boolean
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  riskScore?: number
  riskFactors?: string[]
  devWallet?: string
  devHoldingPercentage?: number
  website?: string
  twitter?: string
  telegram?: string
  pumpfunComplete?: boolean
  pumpfunProgress?: number
  ageInHours?: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// WebSocket Event Types
export interface WSEvents {
  transaction: (tx: Transaction) => void
  walletAdded: (wallet: Wallet) => void
  walletRemoved: (walletId: string) => void
  walletUpdated: (wallet: Wallet) => void
}

// Form Types
export interface AddWalletForm {
  address: string
  name?: string
}

// Tracker State
export interface TrackerState {
  wallets: Wallet[]
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}