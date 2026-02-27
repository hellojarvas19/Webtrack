'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  const baseClasses = hover ? 'glass-card-hover cursor-pointer' : 'glass-card'
  
  return (
    <div 
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Glass Panel with glow effect
interface GlassPanelProps {
  children: ReactNode
  className?: string
  glow?: 'gray' | 'green' | 'red'
}

export function GlassPanel({ children, className = '', glow = 'gray' }: GlassPanelProps) {
  const glowClasses = {
    gray: 'shadow-neon-gray',
    green: 'shadow-neon-green',
    red: 'shadow-neon-red',
  }
  
  return (
    <div className={`glass-card ${glowClasses[glow]} ${className}`}>
      {children}
    </div>
  )
}