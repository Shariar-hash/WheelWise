import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for now (this will be replaced with database later)
const rooms = new Map<string, {
  code: string
  hostName: string
  participants: string[]
  createdAt: Date
}>()

export async function POST(request: NextRequest) {
  try {
    const { roomCode, name } = await request.json()

    if (!roomCode || !name) {
      return NextResponse.json(
        { error: 'Room code and name are required' },
        { status: 400 }
      )
    }

    // Check if room exists (for now, just check if it's a valid format)
    if (roomCode.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    // For now, we'll assume the room exists if the code format is correct
    // Later this will check against the database
    
    return NextResponse.json({
      success: true,
      roomCode: roomCode,
      name: name,
      message: 'Successfully joined room'
    })

  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}