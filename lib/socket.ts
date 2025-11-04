import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'], // Use polling first for Vercel
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: false, // Manual connection control
      upgrade: true,
      rememberUpgrade: true,
    })
  }
  return socket
}

// For compatibility with the provided code
export { getSocket as socket }