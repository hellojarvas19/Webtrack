import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Fetch all unique tokens sorted by latest buy
export async function GET() {
  try {
    // Get unique tokens with their latest transaction info
    const tokens = await prisma.webTransaction.groupBy({
      by: ['tokenMint', 'tokenSymbol', 'tokenName', 'tokenImage'],
      where: {
        tokenMint: { not: null },
        type: 'buy',
      },
      _max: {
        timestamp: true,
        marketCap: true,
        liquidity: true,
        priceUsd: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _max: {
          timestamp: 'desc',
        },
      },
    })

    // Get additional details for each token's latest transaction
    const tokensWithDetails = await Promise.all(
      tokens
        .filter(t => t.tokenMint)
        .map(async (token) => {
          const latestTx = await prisma.webTransaction.findFirst({
            where: {
              tokenMint: token.tokenMint,
              type: 'buy',
            },
            orderBy: { timestamp: 'desc' },
            include: {
              wallet: {
                select: {
                  address: true,
                  name: true,
                },
              },
            },
          })

          return {
            tokenMint: token.tokenMint,
            tokenSymbol: token.tokenSymbol || 'Unknown',
            tokenName: token.tokenName || 'Unknown Token',
            tokenImage: token.tokenImage,
            lastBuyTime: token._max.timestamp,
            marketCap: token._max.marketCap,
            liquidity: token._max.liquidity,
            priceUsd: token._max.priceUsd,
            buyCount: token._count.id,
            lastBuyWallet: latestTx?.wallet,
            lastBuyAmount: latestTx?.amountIn,
            platform: latestTx?.platform,
            metadata: latestTx?.metadata,
          }
        })
    )

    // Sort by latest buy time
    const sortedTokens = tokensWithDetails.sort((a, b) => {
      if (!a.lastBuyTime || !b.lastBuyTime) return 0
      return new Date(b.lastBuyTime).getTime() - new Date(a.lastBuyTime).getTime()
    })

    return NextResponse.json({
      success: true,
      data: sortedTokens,
    })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}