'use client'

import { Transaction, TokenMetadata as TokenMetadataType } from '@/types'

interface TokenMetadataProps {
  transaction: Transaction
}

export function TokenMetadata({ transaction }: TokenMetadataProps) {
  const metadata = transaction.metadata as TokenMetadataType | undefined
  
  const formatNumber = (num: number | undefined): string => {
    if (!num) return 'N/A'
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const getRiskColor = (level: string | undefined) => {
    switch (level) {
      case 'low': return 'text-neon-green'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-orange-500'
      case 'critical': return 'text-neon-red'
      default: return 'text-white/60'
    }
  }

  if (!transaction.tokenMint) return null

  return (
    <div className="glass-card p-4">
      {/* Token Header */}
      <div className="flex items-center gap-3">
        {metadata?.image && (
          <img 
            src={metadata.image} 
            alt={metadata.name || 'Token'}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="font-medium text-white">
            {metadata?.name || transaction.tokenName || 'Unknown'}
          </div>
          <div className="text-sm text-plasma-400">
            ${metadata?.symbol || transaction.tokenSymbol || '?'}
          </div>
        </div>
      </div>
      
      {/* Market Data Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-white/40">Market Cap</div>
          <div className="text-white">{formatNumber(metadata?.marketCap || transaction.marketCap)}</div>
        </div>
        <div>
          <div className="text-white/40">Liquidity</div>
          <div className="text-white">{formatNumber(metadata?.liquidity || transaction.liquidity)}</div>
        </div>
        <div>
          <div className="text-white/40">Holders</div>
          <div className="text-white">{metadata?.totalHolders?.toLocaleString() || 'N/A'}</div>
        </div>
        <div>
          <div className="text-white/40">Top 10%</div>
          <div className="text-white">
            {metadata?.top10HoldersPercentage 
              ? `${metadata.top10HoldersPercentage.toFixed(1)}%` 
              : 'N/A'}
          </div>
        </div>
      </div>
      
      {/* Security Indicators */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Mint Authority */}
        <div className={`text-xs px-2 py-1 rounded-lg ${
          metadata?.mintAuthorityRevoked 
            ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' 
            : 'bg-neon-red/10 text-neon-red border border-neon-red/20'
        }`}>
          {metadata?.mintAuthorityRevoked ? '✅' : '❌'} Mint Revoked
        </div>
        
        {/* Freeze Authority */}
        <div className={`text-xs px-2 py-1 rounded-lg ${
          metadata?.freezeAuthorityRevoked 
            ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' 
            : 'bg-neon-red/10 text-neon-red border border-neon-red/20'
        }`}>
          {metadata?.freezeAuthorityRevoked ? '✅' : '❌'} Freeze Revoked
        </div>
        
        {/* LP Burned */}
        {metadata?.lpBurned && (
          <div className="text-xs px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20">
            🔥 LP Burned
          </div>
        )}
      </div>
      
      {/* Risk Level */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-white/40">Risk Level</span>
        <span className={`text-sm font-medium ${getRiskColor(metadata?.riskLevel)}`}>
          {(metadata?.riskLevel || 'UNKNOWN').toUpperCase()}
        </span>
      </div>
      
      {/* Chart Links */}
      <div className="mt-4 flex gap-2">
        <a
          href={`https://gmgn.ai/sol/token/${transaction.tokenMint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="platform-badge hover:bg-white/10 transition-colors"
        >
          GMGN
        </a>
        <a
          href={`https://birdeye.so/token/${transaction.tokenMint}?chain=solana`}
          target="_blank"
          rel="noopener noreferrer"
          className="platform-badge hover:bg-white/10 transition-colors"
        >
          Birdeye
        </a>
        <a
          href={`https://dexscreener.com/solana/${transaction.tokenMint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="platform-badge hover:bg-white/10 transition-colors"
        >
          DexScreener
        </a>
      </div>
    </div>
  )
}