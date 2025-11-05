import { NextRequest, NextResponse } from 'next/server'

// Room creation API - no database dependency for now
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { hostName } = await request.json()

    if (!hostName || hostName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Host name is required' },
        { status: 400 }
      )
    }

    // Generate room code (for now without database uniqueness check)
    const roomCode = generateRoomCode()
    
    console.log(`Room created: ${roomCode} by ${hostName}`)
    
    return NextResponse.json({
      success: true,
      roomCode: roomCode,
      hostName: hostName,
      message: 'Room created successfully'
    })

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}