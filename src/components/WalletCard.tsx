'use client'

import { useState } from 'react'
import { Wallet, Transaction } from '@/types'
import { GlassCard } from './ui/GlassCard'
import { TransactionRow } from './TransactionRow'
import { TokenMetadata } from './TokenMetadata'

interface WalletCardProps {
  wallet: Wallet & { transactionCount?: number }
  onToggleActive?: (id: string, isActive: boolean) => void
  onDelete?: (id: string) => void
}

export function WalletCard({ wallet, onToggleActive, onDelete }: WalletCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Truncate address for display
  const truncatedAddress = `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
  const displayName = wallet.name || truncatedAddress
  
  // Get last transaction
  const lastTransaction = wallet.transactions?.[0]
  
  // Format SOL balance (placeholder - would need RPC call)
  const solBalance = '0.00'

  return (
    <GlassCard className="overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Expand Arrow */}
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
            <svg 
              className="w-5 h-5 text-plasma-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          {/* Wallet Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{displayName}</span>
              <a 
                href={`https://solscan.io/account/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-plasma-400 hover:text-plasma-300 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                ↗
              </a>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`status-${wallet.isActive ? 'active' : 'paused'}`} />
              <span className="text-sm text-white/60">
                {wallet.isActive ? 'Active' : 'Paused'}
              </span>
              <span className="text-sm text-white/40">|</span>
              <span className="text-sm text-white/60">{solBalance} SOL</span>
            </div>
          </div>
        </div>
        
        {/* Right side - Last transaction */}
        <div className="text-right">
          {lastTransaction ? (
            <div>
              <span className={lastTransaction.type === 'buy' ? 'badge-buy' : 'badge-sell'}>
                {lastTransaction.type.toUpperCase()}
              </span>
              <div className="text-sm text-white/60 mt-1">
                {lastTransaction.tokenSymbol || lastTransaction.tokenIn || '?'}
              </div>
            </div>
          ) : (
            <span className="text-sm text-white/40">No transactions</span>
          )}
        </div>
      </div>
      
      {/* Expanded Details */}
      <div className={`wallet-expand ${isExpanded ? 'expanded' : ''}`}>
        <div className="px-4 pb-4 border-t border-white/5">
          {/* Transaction History */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-plasma-400 mb-2">Recent Transactions</h4>
            {wallet.transactions && wallet.transactions.length > 0 ? (
              <div className="space-y-2">
                {wallet.transactions.slice(0, 5).map((tx: Transaction) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/40 py-4 text-center">
                No transactions yet
              </div>
            )}
          </div>
          
          {/* Token Metadata (if last transaction has token info) */}
          {lastTransaction?.tokenMint && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-plasma-400 mb-2">Latest Token</h4>
              <TokenMetadata transaction={lastTransaction} />
            </div>
          )}
          
          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleActive?.(wallet.id, !wallet.isActive)
              }}
              className="neon-button text-sm"
            >
              {wallet.isActive ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to delete this wallet?')) {
                  onDelete?.(wallet.id)
                }
              }}
              className="neon-button-red text-sm"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}