'use client'

import { Transaction } from '@/types'

interface TransactionRowProps {
  transaction: Transaction
  showWallet?: boolean
}

export function TransactionRow({ transaction, showWallet = false }: TransactionRowProps) {
  const timeAgo = getTimeAgo(transaction.timestamp)
  
  const formatAmount = (amount: string | undefined) => {
    if (!amount) return '?'
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(num < 1 ? 4 : 2)
  }

  const formatMarketCap = (mc: number | undefined) => {
    if (!mc) return null
    if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`
    if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`
    if (mc >= 1e3) return `$${(mc / 1e3).toFixed(2)}K`
    return `$${mc.toFixed(0)}`
  }

  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between">
        {/* Type and Platform */}
        <div className="flex items-center gap-2">
          <span className={transaction.type === 'buy' ? 'badge-buy' : 'badge-sell'}>
            {transaction.type.toUpperCase()}
          </span>
          {transaction.platform && (
            <span className="platform-badge">
              {transaction.platform.toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Time */}
        <span className="text-xs text-white/40">{timeAgo}</span>
      </div>
      
      {/* Swap Details */}
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-white/80">{formatAmount(transaction.amountOut)}</span>
        <span className="text-white/40">{transaction.tokenOut || '?'}</span>
        <span className="text-white/30">→</span>
        <span className="text-white/80">{formatAmount(transaction.amountIn)}</span>
        <span className="text-white/40">{transaction.tokenIn || '?'}</span>
      </div>
      
      {/* Token Info */}
      {transaction.tokenSymbol && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {transaction.tokenImage && (
              <img 
                src={transaction.tokenImage} 
                alt={transaction.tokenSymbol}
                className="w-4 h-4 rounded-full"
              />
            )}
            <a 
              href={`https://solscan.io/token/${transaction.tokenMint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-plasma-400 hover:text-plasma-300"
            >
              ${transaction.tokenSymbol}
            </a>
          </div>
          
          {/* Market Data */}
          <div className="flex items-center gap-3 text-white/40">
            {formatMarketCap(transaction.marketCap) && (
              <span>MC: {formatMarketCap(transaction.marketCap)}</span>
            )}
            {transaction.liquidity && transaction.liquidity > 0 && (
              <span>Liq: {formatMarketCap(transaction.liquidity)}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Signature Link */}
      <div className="mt-2">
        <a
          href={`https://solscan.io/tx/${transaction.signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 hover:text-plasma-400 transition-colors"
        >
          View tx ↗
        </a>
      </div>
    </div>
  )
}

// Helper function for time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}