import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { roomCode, guestName } = body

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 })
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { code: roomCode.toUpperCase() },
      include: {
        _count: {
          select: {
            // participants: true // Will enable after migration
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (!room.isActive) {
      return NextResponse.json({ error: 'This room is no longer active' }, { status: 410 })
    }

    // Check if room is full (after we add participants)
    // if (room._count.participants >= room.maxMembers) {
    //   return NextResponse.json({ error: 'Room is full' }, { status: 403 })
    // }

    // Simplified room joining (basic version)
    // For now, allow all users to join until enhanced features are enabled
    
    // Update room's last activity (basic field that exists)
    await prisma.room.update({
      where: { id: room.id },
      data: { 
        // Basic fields only
      }
    })

    const roomWithDetails = await prisma.room.findUnique({
      where: { id: room.id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        wheels: {
          include: {
            options: true
          }
        }
      }
    })

    return NextResponse.json({
      room: roomWithDetails,
      // participant,
      joinedAt: new Date()
    })

  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 })
  }
}