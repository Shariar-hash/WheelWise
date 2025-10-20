import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSeed, generateClientSeed } from '@/lib/provably-fair'

// Create a new wheel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // Allow anonymous wheel creation
    
    const body = await request.json()
    const { title, description, options, theme, roomId } = body

    // Validate input
    if (!options || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    // Create wheel with options
    const wheel = await prisma.wheel.create({
      data: {
        title: title || null,
        description: description || null,
        userId: session?.user ? (session.user as any).id : null,
        theme: theme || {},
        isPublic: false, // Always private by default
        roomId: roomId || null,
        options: {
          create: options.map((opt: any, index: number) => ({
            label: opt.label,
            color: opt.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            weight: opt.weight || 1,
            order: index,
          })),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(wheel, { status: 201 })
  } catch (error) {
    console.error('Error creating wheel:', error)
    return NextResponse.json(
      { error: 'Failed to create wheel' },
      { status: 500 }
    )
  }
}

// Get all public wheels or user's wheels
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') // 'public', 'my', 'all'

    let where: any = {}

    if (filter === 'my' && session?.user) {
      where.userId = (session.user as any).id
    } else if (filter !== 'all') {
      where.isPublic = true
    }

    const wheels = await prisma.wheel.findMany({
      where,
      include: {
        options: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            spins: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(wheels)
  } catch (error) {
    console.error('Error fetching wheels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wheels' },
      { status: 500 }
    )
  }
}
