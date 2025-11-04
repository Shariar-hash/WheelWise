'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinRoom: (roomCode: string, user: any) => void
  leaveRoom: (roomCode: string, userId: string) => void
  updateWheel: (roomCode: string, wheelState: any) => void
  startSpin: (roomCode: string, spinData: any) => void
  sendSpinResult: (roomCode: string, result: any) => void
  sendMessage: (roomCode: string, message: string, user: any) => void
  startTyping: (roomCode: string, user: any) => void
  stopTyping: (roomCode: string, user: any) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  updateWheel: () => {},
  startSpin: () => {},
  sendSpinResult: () => {},
  sendMessage: () => {},
  startTyping: () => {},
  stopTyping: () => {},
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Only run on client side
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || socketRef.current) return

    // Initialize socket connection only on client side after component mounts
    let timeoutId: NodeJS.Timeout

    const initSocket = () => {
      try {
        console.log('Initializing socket connection...')
        
        const newSocket = io({
          path: '/api/socketio',
          addTrailingSlash: false,
          transports: ['polling', 'websocket'],
          timeout: 20000,
        })

        socketRef.current = newSocket

        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id)
          setSocket(newSocket)
          setIsConnected(true)
        })

        newSocket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason)
          setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
          setIsConnected(false)
          
          // Retry connection after delay
          timeoutId = setTimeout(() => {
            if (!socketRef.current?.connected) {
              console.log('Retrying socket connection...')
              newSocket.connect()
            }
          }, 3000)
        })

      } catch (error) {
        console.error('Failed to initialize socket:', error)
      }
    }

    // Delay socket initialization to avoid hydration issues
    timeoutId = setTimeout(initSocket, 100)

    return () => {
      clearTimeout(timeoutId)
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isClient])

  const joinRoom = (roomCode: string, user: any) => {
    if (socket) {
      socket.emit('join-room', { roomCode, user })
    }
  }

  const leaveRoom = (roomCode: string, userId: string) => {
    if (socket) {
      socket.emit('leave-room', { roomCode, userId })
    }
  }

  const updateWheel = (roomCode: string, wheelState: any) => {
    if (socket) {
      socket.emit('wheel-update', { roomCode, wheelState })
    }
  }

  const startSpin = (roomCode: string, spinData: any) => {
    if (socket) {
      socket.emit('spin-start', { roomCode, spinData })
    }
  }

  const sendSpinResult = (roomCode: string, result: any) => {
    if (socket) {
      socket.emit('spin-result', { roomCode, result })
    }
  }

  const sendMessage = (roomCode: string, message: string, user: any) => {
    if (socket) {
      socket.emit('send-message', { roomCode, message, user })
    }
  }

  const startTyping = (roomCode: string, user: any) => {
    if (socket) {
      socket.emit('typing-start', { roomCode, user })
    }
  }

  const stopTyping = (roomCode: string, user: any) => {
    if (socket) {
      socket.emit('typing-stop', { roomCode, user })
    }
  }

  // Don't render until mounted on client to prevent hydration issues
  if (!isClient) {
    return (
      <SocketContext.Provider
        value={{
          socket: null,
          isConnected: false,
          joinRoom: () => {},
          leaveRoom: () => {},
          updateWheel: () => {},
          startSpin: () => {},
          sendSpinResult: () => {},
          sendMessage: () => {},
          startTyping: () => {},
          stopTyping: () => {},
        }}
      >
        {children}
      </SocketContext.Provider>
    )
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        updateWheel,
        startSpin,
        sendSpinResult,
        sendMessage,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}