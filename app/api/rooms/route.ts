import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRoomCode } from '@/lib/utils'

// Create a new room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    // Generate unique room code
    let code = generateRoomCode()
    let exists = await prisma.room.findUnique({ where: { code } })
    
    // Regenerate if code already exists
    while (exists) {
      code = generateRoomCode()
      exists = await prisma.room.findUnique({ where: { code } })
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        code,
        name: name || `${session.user.name}'s Room`,
        hostId: (session.user as any).id,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// Get room by code
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 })
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        wheels: {
          include: {
            options: true,
          },
        },
        _count: {
          select: {
            spins: true,
            messages: true,
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (!room.isActive) {
      return NextResponse.json({ error: 'Room is closed' }, { status: 410 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}
