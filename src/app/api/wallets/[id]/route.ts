import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTracker } from '@/lib/tracker'

// GET - Fetch single wallet by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = await prisma.webWallet.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: wallet,
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a wallet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = await prisma.webWallet.findUnique({
      where: { id: params.id },
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Remove from tracker
    const tracker = getTracker()
    await tracker.removeWallet(wallet.address)

    // Delete wallet (cascade will delete transactions)
    await prisma.webWallet.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    })
  } catch (error) {
    console.error('Error deleting wallet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete wallet' },
      { status: 500 }
    )
  }
}

// PUT - Update wallet (toggle active status or rename)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, isActive } = body

    const wallet = await prisma.webWallet.findUnique({
      where: { id: params.id },
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const updatedWallet = await prisma.webWallet.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    // Update tracker
    const tracker = getTracker()
    if (isActive !== undefined) {
      if (isActive) {
        await tracker.addWallet({
          id: updatedWallet.id,
          address: updatedWallet.address,
          name: updatedWallet.name,
          isActive: updatedWallet.isActive,
        })
      } else {
        await tracker.removeWallet(updatedWallet.address)
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedWallet,
    })
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update wallet' },
      { status: 500 }
    )
  }
}