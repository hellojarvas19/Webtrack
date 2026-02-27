'use client'

import { ReactNode } from 'react'

interface NeonButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'green' | 'red'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function NeonButton({ 
  children, 
  onClick, 
  variant = 'default',
  className = '',
  disabled = false,
  type = 'button'
}: NeonButtonProps) {
  const variantClasses = {
    default: 'neon-button',
    green: 'neon-button-green',
    red: 'neon-button-red',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

// Icon Button
interface IconButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  title?: string
}

export function IconButton({ children, onClick, className = '', title }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-xl transition-all duration-300 
        bg-white/5 hover:bg-white/10 
        border border-white/10 hover:border-white/20
        ${className}`}
    >
      {children}
    </button>
  )
}