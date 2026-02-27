'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Wallet } from '@/types'
import { WalletCard } from '@/components/WalletCard'
import { AddWalletModal } from '@/components/AddWalletModal'
import { NeonButton } from '@/components/ui/NeonButton'

export default function TrackerPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    // Refresh wallets every 30 seconds
    const interval = setInterval(fetchWallets, 30000)
    return () => clearInterval(interval)
  }, [fetchWallets])

  // Add wallet handler
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
    
    // Add to local state
    setWallets(prev => [data.data, ...prev])
  }

  // Toggle wallet active status
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

  // Delete wallet
  const handleDeleteWallet = async (id: string) => {
    const response = await fetch(`/api/wallets/${id}`, {
      method: 'DELETE',
    })
    
    const data = await response.json()
    
    if (data.success) {
      setWallets(prev => prev.filter(w => w.id !== id))
    }
  }

  // Stats
  const activeWallets = wallets.filter(w => w.isActive).length
  const totalTransactions = wallets.reduce((sum, w) => sum + (w.transactions?.length || 0), 0)

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
            className="text-white font-medium border-b-2 border-plasma-400 pb-1"
          >
            Tracker
          </Link>
          <Link 
            href="/wallets" 
            className="text-white/60 hover:text-white transition-colors"
          >
            Wallets
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 pb-8">
        {/* Stats Bar */}
        <div className="glass-card p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-white/40 text-sm">Total Wallets</span>
              <div className="text-2xl font-bold text-white">{wallets.length}</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="text-white/40 text-sm">Active</span>
              <div className="text-2xl font-bold text-neon-green">{activeWallets}</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="text-white/40 text-sm">Transactions</span>
              <div className="text-2xl font-bold text-plasma-400">{totalTransactions}</div>
            </div>
          </div>
          
          <NeonButton onClick={() => setIsModalOpen(true)}>
            + Add Wallet
          </NeonButton>
        </div>

        {/* Error State */}
        {error && (
          <div className="glass-card p-4 mb-4 text-center text-neon-red">
            {error}
            <button 
              onClick={fetchWallets}
              className="ml-2 text-plasma-400 hover:text-plasma-300"
            >
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
              Add your first wallet to start tracking transactions
            </p>
            <NeonButton onClick={() => setIsModalOpen(true)}>
              + Add Your First Wallet
            </NeonButton>
          </div>
        ) : (
          /* Wallet Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map(wallet => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteWallet}
              />
            ))}
          </div>
        )}
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