import type { Metadata } from 'next'
import './globals.css'
import { TrackerInitializer } from '@/components/TrackerInitializer'

export const metadata: Metadata = {
  title: 'WebTrack - Solana Wallet Tracker',
  description: 'Real-time Solana wallet tracking with advanced token analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-void min-h-screen antialiased">
        <TrackerInitializer />
        <div className="relative min-h-screen">
          {/* Background gradient effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-plasma-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-plasma-600/5 rounded-full blur-3xl" />
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}