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
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

// Glass Panel with enhanced glow effect
interface GlassPanelProps {
  children: ReactNode
  className?: string
  glow?: 'gray' | 'green' | 'red'
}

export function GlassPanel({ children, className = '', glow = 'gray' }: GlassPanelProps) {
  const glowStyles = {
    gray: { boxShadow: '0 0 40px rgba(156, 163, 175, 0.2), 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(156, 163, 175, 0.15)' },
    green: { boxShadow: '0 0 40px rgba(34, 197, 94, 0.25), 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(34, 197, 94, 0.2)' },
    red: { boxShadow: '0 0 40px rgba(239, 68, 68, 0.25), 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(239, 68, 68, 0.2)' },
  }
  
  return (
    <div 
      className={`glass-card ${className}`}
      style={{ ...glowStyles[glow], transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}