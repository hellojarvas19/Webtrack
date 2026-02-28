import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTracker } from '@/lib/tracker'

// GET - Fetch all wallets
export async function GET() {
  try {
    const wallets = await prisma.webWallet.findMany({
      include: {
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get transaction counts for each wallet
    const walletsWithStats = await Promise.all(
      wallets.map(async (wallet) => {
        const transactionCount = await prisma.webTransaction.count({
          where: { walletId: wallet.id },
        })

        return {
          ...wallet,
          transactionCount,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: walletsWithStats,
    })
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

// POST - Add a new wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, name } = body

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate address format (basic Solana address check)
    if (address.length < 32 || address.length > 44) {
      return NextResponse.json(
        { success: false, error: 'Invalid Solana wallet address' },
        { status: 400 }
      )
    }

    // Check if wallet already exists
    const existing = await prisma.webWallet.findUnique({
      where: { address },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Wallet already exists' },
        { status: 400 }
      )
    }

    // Create new wallet
    const wallet = await prisma.webWallet.create({
      data: {
        address,
        name: name || null,
        isActive: true,
      },
    })

    // Add to tracker
    const tracker = getTracker()
    await tracker.addWallet({
      id: wallet.id,
      address: wallet.address,
      name: wallet.name,
      isActive: wallet.isActive,
    })

    return NextResponse.json({
      success: true,
      data: wallet,
    })
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}