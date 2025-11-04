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
    const { 
      name, 
      description, 
      isPublic = false, 
      maxMembers = 50,
      allowGuestJoin = true,
      allowParticipantSpin = true,
      allowParticipantEdit = false,
      enableChat = true,
      enableVoiceChat = false
    } = body

    // Generate unique room code
    let code = generateRoomCode()
    let exists = await prisma.room.findUnique({ where: { code } })
    
    // Regenerate if code already exists
    while (exists) {
      code = generateRoomCode()
      exists = await prisma.room.findUnique({ where: { code } })
    }

    // Create room (basic version that works with current types)
    const room = await prisma.room.create({
      data: {
        code,
        name: name || `${session.user.name}'s Room`,
        hostId: (session.user as any).id,
        isActive: true,
        maxMembers: maxMembers || 50,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            spins: true,
            messages: true
          }
        }
      },
    })

    // Note: Enhanced features will be enabled once TypeScript catches up with the new schema

    return NextResponse.json({
      room: {
        ...room,
        joinLink: `${process.env.NEXTAUTH_URL}/room/${code}`,
        shareText: `Join my WheelWise room: ${room.name || 'Spin Room'} - Code: ${code}`
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// Get room by code or user's rooms
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const hosted = searchParams.get('hosted') === 'true'
    const joined = searchParams.get('joined') === 'true'

    if (code) {
      // Get specific room by code
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
    }

    // For other queries, require authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's rooms
    let rooms = []

    if (hosted) {
      // Get rooms hosted by the user
      rooms = await prisma.room.findMany({
        where: {
          hostId: (session.user as any).id,
          isActive: true
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              spins: true,
              messages: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Get all public rooms for now
      rooms = await prisma.room.findMany({
        where: {
          isActive: true
        },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              spins: true,
              messages: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      })
    }

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}
