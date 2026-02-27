import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core colors
        void: '#000000',
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(20, 20, 25, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        plasma: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        neon: {
          green: '#22C55E',
          red: '#EF4444',
          blue: '#3B82F6',
          purple: '#A855F7',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)',
        'neon-gray': '0 0 20px rgba(156, 163, 175, 0.15), 0 0 40px rgba(156, 163, 175, 0.1)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(156, 163, 175, 0.1)' },
          '100%': { boxShadow: '0 0 30px rgba(156, 163, 175, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
export default config