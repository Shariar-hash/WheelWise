import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

export type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export default function SocketHandler(req: NextApiRequest, res: any) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = new ServerIO(res.socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    transports: ['websocket', 'polling'], // Try websocket first
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL || false 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    allowEIO3: true,
    pingTimeout: 120000, // 2 minutes
    pingInterval: 25000,
    connectTimeout: 45000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e8
  })
  
  res.socket.server.io = io

  const activeRooms = new Map()
  const socketRooms = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join_room', ({ roomCode, name, isOwner = false }) => {
      try {
        console.log(`${name} joining room: ${roomCode}${isOwner ? ' (as owner)' : ''}`)
        
        if (!activeRooms.has(roomCode)) {
          activeRooms.set(roomCode, {
            owner: isOwner ? name : null,
            participants: new Set(),
            ownerSocketId: isOwner ? socket.id : null
          })
        }

        const room = activeRooms.get(roomCode)
        
        if (!room.owner && isOwner) {
          room.owner = name
          room.ownerSocketId = socket.id
        }
        
        room.participants.add(name)
        socketRooms.set(socket.id, { 
          username: name, 
          roomCode, 
          isOwner: name === room.owner 
        })

        socket.join(roomCode)

        socket.emit('room_joined', { 
          name,
          roomCode, 
          isOwner: name === room.owner,
          owner: room.owner,
          participants: Array.from(room.participants)
        })
        
        socket.to(roomCode).emit('user_joined', { 
          name,
          participants: Array.from(room.participants),
          message: `${name} has joined the room`
        })
        
        console.log(`${name} joined room: ${roomCode}. Total participants: ${room.participants.size}`)
      } catch (error) {
        console.error('Error joining room:', error)
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    socket.on('chat_message', ({ roomCode, name, message }) => {
      try {
        const userData = socketRooms.get(socket.id)
        const room = activeRooms.get(roomCode)
        
        // Verify user is in the room
        if (!userData || !room || userData.roomCode !== roomCode) {
          socket.emit('error', { message: 'You are not in this room' })
          return
        }
        
        const messageData = {
          name,
          message,
          timestamp: new Date()
        }
        
        // Broadcast to ALL users in the room (including sender)
        io.to(roomCode).emit('receive_message', messageData)
        console.log(`Message in ${roomCode} from ${name}: ${message}`)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('update_wheel_options', ({ roomCode, options, updatedBy }) => {
      try {
        const userData = socketRooms.get(socket.id)
        const room = activeRooms.get(roomCode)
        
        // Only room owner can update wheel options
        if (!userData || !room || room.ownerSocketId !== socket.id) {
          socket.emit('error', { message: 'Only the room owner can update wheel options' })
          return
        }

        // Broadcast options update to ALL users in the room
        io.to(roomCode).emit('wheel_options_updated', { options, updatedBy })
        console.log(`Wheel options updated in ${roomCode} by ${updatedBy}`)
      } catch (error) {
        console.error('Error updating wheel options:', error)
      }
    })

    socket.on('spin_start', ({ roomCode, result, rotation, duration }) => {
      try {
        const userData = socketRooms.get(socket.id)
        const room = activeRooms.get(roomCode)
        
        if (!userData || !room || room.ownerSocketId !== socket.id) {
          socket.emit('error', { message: 'Only the room owner can spin the wheel' })
          return
        }

        const spinStartData = {
          result,
          rotation,
          duration,
          timestamp: new Date(),
          spinnerId: userData.username
        }
        
        // Broadcast spin start to ALL users in the room (including owner)
        io.to(roomCode).emit('spin_start', spinStartData)
        console.log(`Spin started in ${roomCode} by owner ${userData.username} - broadcasting to ${room.participants.size} users`)
      } catch (error) {
        console.error('Error starting spin:', error)
      }
    })

    socket.on('spin_wheel', ({ roomCode, result, rotation }) => {
      try {
        const userData = socketRooms.get(socket.id)
        const room = activeRooms.get(roomCode)
        
        if (!userData || !room || room.ownerSocketId !== socket.id) {
          socket.emit('error', { message: 'Only the room owner can spin the wheel' })
          return
        }

        const spinData = {
          result,
          rotation,
          timestamp: new Date(),
          spinnerId: userData.username
        }
        
        // Broadcast result to ALL users in the room (including owner)
        io.to(roomCode).emit('spin_result', spinData)
        console.log(`Spin result in ${roomCode} by owner ${userData.username}: ${result} - broadcasting to ${room.participants.size} users`)
      } catch (error) {
        console.error('Error spinning wheel:', error)
      }
    })

    socket.on('disconnect', (reason) => {
      const userData = socketRooms.get(socket.id)
      if (userData) {
        const { username, roomCode } = userData
        const room = activeRooms.get(roomCode)
        
        if (room) {
          room.participants.delete(username)
          
          socket.to(roomCode).emit('user_left', { 
            name: username,
            participants: Array.from(room.participants),
            message: `${username} has left the room`
          })
          
          if (room.ownerSocketId === socket.id) {
            console.log(`Room owner ${username} left. Closing room: ${roomCode}`)
            io.to(roomCode).emit('room_closed', { 
              message: 'The room owner has left. The room is now closed.' 
            })
            activeRooms.delete(roomCode)
          } else if (room.participants.size === 0) {
            activeRooms.delete(roomCode)
          }
        }
        
        socketRooms.delete(socket.id)
        console.log(`${username} left room: ${roomCode}`)
      }
      
      console.log('Client disconnected:', socket.id, 'Reason:', reason)
    })

    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  res.end()
}
