import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Fetch transactions with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletId = searchParams.get('walletId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: any = {}
    if (walletId) where.walletId = walletId
    if (type && ['buy', 'sell', 'transfer'].includes(type)) {
      where.type = type
    }

    const [transactions, total] = await Promise.all([
      prisma.webTransaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          wallet: {
            select: {
              id: true,
              address: true,
              name: true,
            },
          },
        },
      }),
      prisma.webTransaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + transactions.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST - Create a new transaction (called by tracker)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      signature,
      walletId,
      type,
      platform,
      tokenIn,
      tokenOut,
      tokenInMint,
      tokenOutMint,
      amountIn,
      amountOut,
      tokenMint,
      tokenSymbol,
      tokenName,
      tokenImage,
      marketCap,
      liquidity,
      priceUsd,
      solPrice,
      holdingBalance,
      holdingPercent,
      metadata,
      blockTime,
    } = body

    if (!signature || !walletId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if transaction already exists
    const existing = await prisma.webTransaction.findUnique({
      where: { signature },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Transaction already exists',
      })
    }

    const transaction = await prisma.webTransaction.create({
      data: {
        signature,
        walletId,
        type,
        platform,
        tokenIn,
        tokenOut,
        tokenInMint,
        tokenOutMint,
        amountIn,
        amountOut,
        tokenMint,
        tokenSymbol,
        tokenName,
        tokenImage,
        marketCap,
        liquidity,
        priceUsd,
        solPrice,
        holdingBalance,
        holdingPercent,
        metadata,
        blockTime: blockTime ? new Date(blockTime * 1000) : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}