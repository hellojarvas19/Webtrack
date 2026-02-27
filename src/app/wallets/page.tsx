'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Wallet } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { AddWalletModal } from '@/components/AddWalletModal'
import { NeonButton } from '@/components/ui/NeonButton'

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Fetch wallets
  const fetchWallets = useCallback(async () => {
    try {
      const response = await fetch('/api/wallets')
      const data = await response.json()
      
      if (data.success) {
        setWallets(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch wallets')
      }
    } catch (err) {
      setError('Failed to fetch wallets')
      console.error('Error fetching wallets:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  // Add wallet
  const handleAddWallet = async (address: string, name?: string) => {
    const response = await fetch('/api/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, name }),
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to add wallet')
    }
    
    setWallets(prev => [data.data, ...prev])
  }

  // Delete wallet
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet? All transaction history will be lost.')) {
      return
    }
    
    const response = await fetch(`/api/wallets/${id}`, {
      method: 'DELETE',
    })
    
    const data = await response.json()
    
    if (data.success) {
      setWallets(prev => prev.filter(w => w.id !== id))
    }
  }

  // Toggle active status
  const handleToggleActive = async (id: string, isActive: boolean) => {
    const response = await fetch(`/api/wallets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      setWallets(prev => 
        prev.map(w => w.id === id ? { ...w, isActive } : w)
      )
    }
  }

  // Update wallet name
  const handleUpdateName = async (id: string) => {
    const response = await fetch(`/api/wallets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName || null }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      setWallets(prev => 
        prev.map(w => w.id === id ? { ...w, name: editName || null } : w)
      )
      setEditingId(null)
      setEditName('')
    }
  }

  // Start editing
  const startEditing = (wallet: Wallet) => {
    setEditingId(wallet.id)
    setEditName(wallet.name || '')
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card m-4 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">◈</span>
          <h1 className="text-xl font-bold text-white glow-text">WebTrack</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-white/60 hover:text-white transition-colors"
          >
            Tracker
          </Link>
          <Link 
            href="/wallets" 
            className="text-white font-medium border-b-2 border-plasma-400 pb-1"
          >
            Wallets
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 pb-8">
        {/* Header */}
        <div className="glass-card p-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Wallet Management</h2>
            <p className="text-sm text-white/60 mt-1">
              {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} • {wallets.filter(w => w.isActive).length} active
            </p>
          </div>
          
          <NeonButton onClick={() => setIsModalOpen(true)}>
            + Add Wallet
          </NeonButton>
        </div>

        {/* Error State */}
        {error && (
          <div className="glass-card p-4 mb-4 text-center text-neon-red">
            {error}
            <button onClick={fetchWallets} className="ml-2 text-plasma-400 hover:text-plasma-300">
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-plasma-400 border-t-transparent rounded-full" />
          </div>
        ) : wallets.length === 0 ? (
          /* Empty State */
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">👛</div>
            <h2 className="text-xl font-medium text-white mb-2">No Wallets Yet</h2>
            <p className="text-white/60 mb-6">
              Add your first wallet to start tracking
            </p>
            <NeonButton onClick={() => setIsModalOpen(true)}>
              + Add Your First Wallet
            </NeonButton>
          </div>
        ) : (
          /* Wallet List */
          <GlassCard className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {wallets.map((wallet) => (
                <div 
                  key={wallet.id} 
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  {/* Wallet Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Status */}
                    <span className={`status-${wallet.isActive ? 'active' : 'paused'}`} />
                    
                    {/* Name & Address */}
                    <div className="flex-1">
                      {editingId === wallet.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Wallet name"
                            className="glass-input text-sm py-2"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateName(wallet.id)}
                            className="text-neon-green hover:text-neon-green/80"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-white/40 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {wallet.name || 'Unnamed Wallet'}
                            </span>
                            <button
                              onClick={() => startEditing(wallet)}
                              className="text-white/30 hover:text-white/60 text-sm"
                            >
                              ✎
                            </button>
                          </div>
                          <a
                            href={`https://solscan.io/account/${wallet.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-plasma-400 hover:text-plasma-300"
                          >
                            {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(wallet.id, !wallet.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        wallet.isActive
                          ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20'
                          : 'bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20'
                      }`}
                    >
                      {wallet.isActive ? '⏸ Pause' : '▶ Resume'}
                    </button>
                    <button
                      onClick={() => handleDelete(wallet.id)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-colors"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Info Card */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-plasma-400 font-medium mb-2">1. Add Wallets</div>
              <p className="text-white/60">
                Enter any Solana wallet address to start tracking its transactions in real-time.
              </p>
            </div>
            <div>
              <div className="text-plasma-400 font-medium mb-2">2. Monitor Activity</div>
              <p className="text-white/60">
                View buy/sell transactions, token metadata, market data, and security indicators.
              </p>
            </div>
            <div>
              <div className="text-plasma-400 font-medium mb-2">3. Stay Updated</div>
              <p className="text-white/60">
                Transactions appear instantly with detailed token analysis and risk assessment.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Wallet Modal */}
      <AddWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddWallet}
      />
    </div>
  )
}