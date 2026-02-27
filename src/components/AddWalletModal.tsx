'use client'

import { useState } from 'react'
import { NeonButton } from './ui/NeonButton'

interface AddWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (address: string, name?: string) => Promise<void>
}

export function AddWalletModal({ isOpen, onClose, onSubmit }: AddWalletModalProps) {
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!address.trim()) {
      setError('Wallet address is required')
      return
    }
    
    // Basic validation
    const trimmedAddress = address.trim()
    if (trimmedAddress.length < 32 || trimmedAddress.length > 44) {
      setError('Invalid Solana wallet address (32-44 characters)')
      return
    }
    
    setIsLoading(true)
    try {
      await onSubmit(trimmedAddress, name.trim() || undefined)
      setAddress('')
      setName('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add wallet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card p-6 w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white glow-text">Add Wallet</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Input */}
          <div>
            <label className="block text-sm text-plasma-400 mb-2">
              Wallet Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="glass-input"
              disabled={isLoading}
            />
          </div>
          
          {/* Name Input */}
          <div>
            <label className="block text-sm text-plasma-400 mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Wallet, Dev Tracker"
              className="glass-input"
              disabled={isLoading}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="text-sm text-neon-red bg-neon-red/10 border border-neon-red/20 rounded-lg p-3">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <NeonButton
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </NeonButton>
            <NeonButton
              type="submit"
              variant="green"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Adding...' : 'Add Wallet'}
            </NeonButton>
          </div>
        </form>
      </div>
    </div>
  )
}