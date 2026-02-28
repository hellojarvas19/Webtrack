'use client'

import { useState } from 'react'
import Image from 'next/image'

interface TokenCardProps {
  token: {
    tokenMint: string
    tokenSymbol: string
    tokenName: string
    tokenImage?: string | null
    lastBuyTime?: Date | string | null
    marketCap?: number | null
    liquidity?: number | null
    priceUsd?: number | null
    buyCount: number
    lastBuyWallet?: {
      address: string
      name?: string | null
    } | null
    lastBuyAmount?: number | null
    platform?: string | null
  }
}

export default function TokenCard({ token }: TokenCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatTimeAgo = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A'
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return 'N/A'
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A'
    if (price < 0.00001) return price.toExponential(2)
    if (price < 1) return `$${price.toFixed(8)}`
    return `$${price.toFixed(4)}`
  }

  return (
    <div className="group relative bg-gradient-to-br from-gray-900/80 to-black/90 border border-gray-800/50 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      {/* Token Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
          {token.tokenImage && !imageError ? (
            <Image
              src={token.tokenImage}
              alt={token.tokenSymbol}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-purple-400">
              {token.tokenSymbol?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{token.tokenSymbol}</h3>
          <p className="text-xs text-gray-400 truncate">{token.tokenName}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">{formatTimeAgo(token.lastBuyTime)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-black/40 rounded-lg p-2">
          <span className="text-gray-500 text-xs block">Market Cap</span>
          <span className="text-white font-medium">{formatNumber(token.marketCap)}</span>
        </div>
        <div className="bg-black/40 rounded-lg p-2">
          <span className="text-gray-500 text-xs block">Liquidity</span>
          <span className="text-white font-medium">{formatNumber(token.liquidity)}</span>
        </div>
        <div className="bg-black/40 rounded-lg p-2">
          <span className="text-gray-500 text-xs block">Price</span>
          <span className="text-white font-medium">{formatPrice(token.priceUsd)}</span>
        </div>
        <div className="bg-black/40 rounded-lg p-2">
          <span className="text-gray-500 text-xs block">Buys</span>
          <span className="text-green-400 font-medium">{token.buyCount}</span>
        </div>
      </div>

      {/* Last Buy Info */}
      {token.lastBuyWallet && (
        <div className="mt-3 pt-3 border-t border-gray-800/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Last buy by</span>
            <span className="text-purple-400 truncate max-w-[150px]">
              {token.lastBuyWallet.name || `${token.lastBuyWallet.address.slice(0, 6)}...`}
            </span>
          </div>
        </div>
      )}

      {/* Platform Badge */}
      {token.platform && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
            {token.platform}
          </span>
        </div>
      )}

      {/* Hover Link */}
      <a
        href={`https://solscan.io/token/${token.tokenMint}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="sr-only">View on Solscan</span>
      </a>
    </div>
  )
}