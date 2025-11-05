import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'], // Try websocket first
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: false, // Manual connection control
    })
  }
  return socket
}

// For compatibility with the provided code
export { getSocket as socket }