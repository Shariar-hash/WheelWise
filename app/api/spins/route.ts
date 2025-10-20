import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateSeed,
  generateClientSeed,
  generateSpinResult,
  selectOptionByWeight,
} from '@/lib/provably-fair'

// Create a new spin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const { wheelId, clientSeed: userClientSeed, betAmount, roomId } = body

    // Get wheel with options
    const wheel = await prisma.wheel.findUnique({
      where: { id: wheelId },
      include: { options: { where: { isActive: true } } },
    })

    if (!wheel) {
      return NextResponse.json({ error: 'Wheel not found' }, { status: 404 })
    }

    if (wheel.options.length === 0) {
      return NextResponse.json(
        { error: 'No active options available' },
        { status: 400 }
      )
    }

    // Generate seeds
    const serverSeed = generateSeed()
    const clientSeed = userClientSeed || generateClientSeed()

    // Get last spin nonce for this user/wheel
    const lastSpin = session?.user
      ? await prisma.spin.findFirst({
          where: {
            wheelId,
            userId: (session.user as any).id,
          },
          orderBy: { nonce: 'desc' },
        })
      : null

    const nonce = (lastSpin?.nonce || 0) + 1

    // Generate provably fair result
    const spinResult = generateSpinResult(serverSeed, clientSeed, nonce)

    // Select winning option based on weights
    const winningOptionId = selectOptionByWeight(
      spinResult.resultValue,
      wheel.options.map((opt) => ({ id: opt.id, weight: opt.weight }))
    )

    // Handle tokens if user is authenticated and betting
    let winAmount = null
    let isWinner = false

    if (session?.user && betAmount && betAmount > 0) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
      })

      if (!user || user.tokens < betAmount) {
        return NextResponse.json(
          { error: 'Insufficient tokens' },
          { status: 400 }
        )
      }

      // For demo: 50% chance to win 2x bet
      isWinner = Math.random() > 0.5
      winAmount = isWinner ? betAmount * 2 : 0

      // Update user tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tokens: user.tokens - betAmount + winAmount,
          totalSpins: { increment: 1 },
          totalWins: isWinner ? { increment: 1 } : undefined,
        },
      })

      // Record token transaction
      await prisma.tokenTransaction.create({
        data: {
          userId: user.id,
          amount: -betAmount,
          type: 'SPIN_LOSS',
          reason: `Bet on wheel: ${wheel.title}`,
        },
      })

      if (isWinner) {
        await prisma.tokenTransaction.create({
          data: {
            userId: user.id,
            amount: winAmount,
            type: 'SPIN_WIN',
            reason: `Won on wheel: ${wheel.title}`,
          },
        })
      }
    }

    // Create spin record
    const spin = await prisma.spin.create({
      data: {
        wheelId,
        userId: session?.user ? (session.user as any).id : null,
        roomId: roomId || null,
        optionId: winningOptionId,
        serverSeed,
        clientSeed,
        nonce,
        combinedHash: spinResult.combinedHash,
        resultValue: spinResult.resultValue,
        betAmount,
        winAmount,
        isWinner,
        shareUrl: `${process.env.NEXTAUTH_URL}/spin/${spinResult.combinedHash}`,
      },
      include: {
        option: true,
        wheel: {
          include: {
            options: true,
          },
        },
      },
    })

    // Update wheel stats
    await prisma.wheel.update({
      where: { id: wheelId },
      data: { totalSpins: { increment: 1 } },
    })

    return NextResponse.json(spin, { status: 201 })
  } catch (error) {
    console.error('Error creating spin:', error)
    return NextResponse.json(
      { error: 'Failed to create spin' },
      { status: 500 }
    )
  }
}

// Get spin history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const wheelId = searchParams.get('wheelId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = wheelId ? { wheelId } : {}

    const spins = await prisma.spin.findMany({
      where,
      include: {
        option: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        wheel: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json(spins)
  } catch (error) {
    console.error('Error fetching spins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spins' },
      { status: 500 }
    )
  }
}
