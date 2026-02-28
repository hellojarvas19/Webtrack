'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TokenCard from '@/components/TokenCard'

interface Token {
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

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/tokens')
      const data = await res.json()
      if (data.success) {
        setTokens(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch tokens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTokens, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WebTrack</h1>
              <p className="text-xs text-gray-400">Solana Token Tracker</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/wallets"
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Wallets
            </Link>
            <Link
              href="/tracker"
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Live Tracker
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Tokens by Latest Buy
          </h2>
          <p className="text-gray-400">
            All tokens sorted by most recent purchases from tracked wallets
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
            <span className="text-gray-500 text-sm">Total Tokens</span>
            <p className="text-2xl font-bold text-white">{tokens.length}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
            <span className="text-gray-500 text-sm">Total Buys</span>
            <p className="text-2xl font-bold text-green-400">
              {tokens.reduce((acc, t) => acc + t.buyCount, 0)}
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
            <span className="text-gray-500 text-sm">Last Hour</span>
            <p className="text-2xl font-bold text-purple-400">
              {tokens.filter(t => {
                if (!t.lastBuyTime) return false
                const hourAgo = new Date(Date.now() - 3600000)
                return new Date(t.lastBuyTime) > hourAgo
              }).length}
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
            <span className="text-gray-500 text-sm">Last 24h</span>
            <p className="text-2xl font-bold text-blue-400">
              {tokens.filter(t => {
                if (!t.lastBuyTime) return false
                const dayAgo = new Date(Date.now() - 86400000)
                return new Date(t.lastBuyTime) > dayAgo
              }).length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchTokens}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tokens.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No tokens yet</h3>
            <p className="text-gray-400 mb-4">
              Add wallets to start tracking their token purchases
            </p>
            <Link
              href="/wallets"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Wallets
            </Link>
          </div>
        )}

        {/* Tokens Grid */}
        {!loading && !error && tokens.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tokens.map((token) => (
              <TokenCard key={token.tokenMint} token={token} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>WebTrack - Real-time Solana wallet tracking</p>
        </div>
      </footer>
    </main>
  )
}