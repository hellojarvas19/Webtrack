import { Connection, PublicKey } from '@solana/web3.js'
import { prisma } from './db'

// Types
interface TrackedWallet {
  id: string
  address: string
  name: string | null
  isActive: boolean
}

interface TransactionCallback {
  (tx: any): void
}

// RPC Connection Manager
class ConnectionManager {
  private connections: Connection[] = []
  private currentIndex = 0

  constructor(rpcUrls: string[]) {
    this.connections = rpcUrls.map(url => new Connection(url, 'confirmed'))
  }

  getRandomConnection(): Connection {
    if (this.connections.length === 0) {
      throw new Error('No RPC connections available')
    }
    const conn = this.connections[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.connections.length
    return conn
  }

  get primaryConnection(): Connection {
    return this.connections[0] || this.getRandomConnection()
  }
}

// Wallet Tracker Class
export class WalletTracker {
  private connectionManager: ConnectionManager
  private subscriptions: Map<string, number> = new Map()
  private trackedWallets: Map<string, TrackedWallet> = new Map()
  private onTransaction: TransactionCallback | null = null
  private isRunning = false

  constructor(rpcUrls: string[]) {
    this.connectionManager = new ConnectionManager(rpcUrls)
  }

  // Set transaction callback
  setTransactionCallback(callback: TransactionCallback) {
    this.onTransaction = callback
  }

  // Load active wallets from database
  async loadWallets(): Promise<void> {
    try {
      const wallets = await prisma.webWallet.findMany({
        where: { isActive: true },
        select: { id: true, address: true, name: true, isActive: true },
      })

      for (const wallet of wallets) {
        this.trackedWallets.set(wallet.address, wallet)
      }

      console.log(`Loaded ${wallets.length} wallets to track`)
    } catch (error) {
      console.error('Error loading wallets:', error)
    }
  }

  // Start tracking a specific wallet
  async startTracking(wallet: TrackedWallet): Promise<void> {
    if (this.subscriptions.has(wallet.address)) {
      console.log(`Already tracking ${wallet.address}`)
      return
    }

    try {
      const publicKey = new PublicKey(wallet.address)
      const connection = this.connectionManager.getRandomConnection()

      const subscriptionId = connection.onLogs(
        publicKey,
        async (logs, ctx) => {
          await this.handleLogs(wallet, logs, ctx)
        },
        'processed'
      )

      this.subscriptions.set(wallet.address, subscriptionId)
      this.trackedWallets.set(wallet.address, wallet)
      
      console.log(`Started tracking ${wallet.address}`)
    } catch (error) {
      console.error(`Error starting to track ${wallet.address}:`, error)
    }
  }

  // Stop tracking a specific wallet
  async stopTracking(address: string): Promise<void> {
    const subscriptionId = this.subscriptions.get(address)
    
    if (subscriptionId !== undefined) {
      try {
        const connection = this.connectionManager.primaryConnection
        await connection.removeOnLogsListener(subscriptionId)
        this.subscriptions.delete(address)
        this.trackedWallets.delete(address)
        console.log(`Stopped tracking ${address}`)
      } catch (error) {
        console.error(`Error stopping tracking ${address}:`, error)
      }
    }
  }

  // Handle incoming logs
  private async handleLogs(wallet: TrackedWallet, logs: any, ctx: any): Promise<void> {
    const signature = logs.signature
    
    // Check if this is a relevant transaction (swap/transfer)
    const isRelevant = this.isRelevantTransaction(logs)
    
    if (!isRelevant) {
      return
    }

    try {
      // Fetch transaction details
      const txDetails = await this.fetchTransactionDetails(signature)
      
      if (!txDetails) {
        return
      }

      // Parse the transaction
      const parsed = await this.parseTransaction(signature, txDetails, wallet.address)
      
      if (!parsed) {
        return
      }

      // Save to database
      await this.saveTransaction(wallet.id, parsed)
      
      // Notify callback
      if (this.onTransaction) {
        this.onTransaction(parsed)
      }
      
      console.log(`[${parsed.type.toUpperCase()}] ${wallet.name || wallet.address.slice(0, 8)}: ${parsed.description}`)
    } catch (error) {
      console.error('Error handling transaction:', error)
    }
  }

  // Check if transaction is relevant
  private isRelevantTransaction(logs: any): boolean {
    const logMessages = logs.logs || []
    const logString = logMessages.join(' ').toLowerCase()
    
    // Check for swap indicators
    const swapKeywords = [
      'raydium',
      'jupiter',
      'pumpfun',
      'pump.fun',
      'swap',
      'transfer',
      'meteora',
      'orca',
    ]
    
    // Check for errors
    if (logString.includes('failed') || logString.includes('error')) {
      return false
    }
    
    return swapKeywords.some(keyword => logString.includes(keyword))
  }

  // Fetch transaction details
  private async fetchTransactionDetails(signature: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const connection = this.connectionManager.getRandomConnection()
        const tx = await connection.getParsedTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        })
        return tx
      } catch (error) {
        console.error(`Attempt ${i + 1} failed for ${signature}`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    return null
  }

  // Parse transaction (simplified version)
  private async parseTransaction(signature: string, tx: any, walletAddress: string): Promise<any> {
    if (!tx?.meta || !tx?.transaction) {
      return null
    }

    const accountKeys = tx.transaction.message.accountKeys
    const preBalances = tx.meta.preBalances
    const postBalances = tx.meta.postBalances
    
    // Find signer
    const signerIndex = accountKeys.findIndex((acc: any) => acc.signer === true)
    const signer = signerIndex >= 0 ? accountKeys[signerIndex]?.pubkey?.toBase58() : walletAddress
    
    // Calculate SOL balance change
    let solChange = 0
    if (preBalances && postBalances && signerIndex >= 0) {
      solChange = (postBalances[signerIndex] - preBalances[signerIndex]) / 1e9
    }
    
    // Determine transaction type
    const type = solChange < 0 ? 'buy' : solChange > 0 ? 'sell' : 'transfer'
    
    // Extract transfers from inner instructions
    const transfers: any[] = []
    const innerInstructions = tx.meta.innerInstructions || []
    
    for (const inner of innerInstructions) {
      for (const inst of inner.instructions) {
        if (inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked') {
          transfers.push({
            type: inst.parsed.type,
            info: inst.parsed.info,
          })
        }
      }
    }

    // Platform detection
    const logMessages = tx.meta.logMessages || []
    const logs = logMessages.join(' ').toLowerCase()
    
    let platform = 'unknown'
    if (logs.includes('pumpfun') || logs.includes('pump.fun')) {
      platform = logs.includes('pumpswap') ? 'pumpfun_amm' : 'pumpfun'
    } else if (logs.includes('raydium')) {
      platform = 'raydium'
    } else if (logs.includes('jupiter')) {
      platform = 'jupiter'
    } else if (logs.includes('orca')) {
      platform = 'orca'
    } else if (logs.includes('meteora')) {
      platform = 'meteora'
    }

    // Extract token info from transfers
    let tokenIn = 'SOL'
    let tokenOut = 'SOL'
    let amountIn = Math.abs(solChange).toString()
    let amountOut = '0'
    let tokenMint: string | undefined
    
    if (transfers.length > 0) {
      const lastTransfer = transfers[transfers.length - 1]
      if (lastTransfer?.info) {
        amountOut = lastTransfer.info.tokenAmount?.amount || lastTransfer.info.amount || '0'
        if (lastTransfer.info.mint) {
          tokenMint = lastTransfer.info.mint
          tokenOut = lastTransfer.info.mint.slice(0, 4) + '...'
        }
      }
    }

    return {
      signature,
      type,
      platform,
      walletAddress: signer,
      tokenIn,
      tokenOut,
      tokenMint,
      amountIn,
      amountOut,
      solPrice: await this.getSolPrice(),
      description: `${type.toUpperCase()} ${amountOut} ${tokenOut} for ${amountIn} ${tokenIn}`,
      timestamp: tx.blockTime ? new Date(tx.blockTime * 1000) : new Date(),
    }
  }

  // Get SOL price (cached)
  private solPriceCache: { price: number; timestamp: number } | null = null
  
  private async getSolPrice(): Promise<number> {
    // Use cache if less than 5 minutes old
    if (this.solPriceCache && Date.now() - this.solPriceCache.timestamp < 300000) {
      return this.solPriceCache.price
    }
    
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      const data = await response.json()
      const price = data?.solana?.usd || 0
      
      this.solPriceCache = { price, timestamp: Date.now() }
      return price
    } catch {
      return this.solPriceCache?.price || 0
    }
  }

  // Save transaction to database
  private async saveTransaction(walletId: string, parsed: any): Promise<void> {
    try {
      await prisma.webTransaction.create({
        data: {
          signature: parsed.signature,
          walletId,
          type: parsed.type,
          platform: parsed.platform,
          tokenIn: parsed.tokenIn,
          tokenOut: parsed.tokenOut,
          tokenMint: parsed.tokenMint,
          amountIn: parsed.amountIn,
          amountOut: parsed.amountOut,
          solPrice: parsed.solPrice,
          blockTime: parsed.timestamp,
        },
      })
    } catch (error: any) {
      // Ignore duplicate signature errors
      if (!error.message?.includes('Unique constraint')) {
        console.error('Error saving transaction:', error)
      }
    }
  }

  // Start all tracking
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Tracker already running')
      return
    }

    await this.loadWallets()
    
    for (const wallet of this.trackedWallets.values()) {
      await this.startTracking(wallet)
    }
    
    this.isRunning = true
    console.log(`Wallet tracker started with ${this.trackedWallets.size} wallets`)
  }

  // Stop all tracking
  async stop(): Promise<void> {
    for (const address of this.subscriptions.keys()) {
      await this.stopTracking(address)
    }
    this.isRunning = false
    console.log('Wallet tracker stopped')
  }

  // Add a new wallet to track
  async addWallet(wallet: TrackedWallet): Promise<void> {
    if (wallet.isActive) {
      await this.startTracking(wallet)
    }
    this.trackedWallets.set(wallet.address, wallet)
  }

  // Remove a wallet from tracking
  async removeWallet(address: string): Promise<void> {
    await this.stopTracking(address)
  }

  // Get current status
  getStatus(): { isRunning: boolean; walletCount: number; subscriptions: number } {
    return {
      isRunning: this.isRunning,
      walletCount: this.trackedWallets.size,
      subscriptions: this.subscriptions.size,
    }
  }
}

// Create singleton instance
let trackerInstance: WalletTracker | null = null

export function getTracker(): WalletTracker {
  if (!trackerInstance) {
    const rpcUrls = process.env.SOLANA_RPC_URLS?.split(',') || [
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    ]
    trackerInstance = new WalletTracker(rpcUrls)
  }
  return trackerInstance
}