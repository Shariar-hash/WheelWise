'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Users, Plus, LogIn, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoomPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast.error('Please sign in to create a room')
      router.push('/auth/signin')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to create room')

      const room = await res.json()
      toast.success('Room created successfully!')
      router.push(`/room/${room.code}`)
    } catch (error) {
      toast.error('Failed to create room')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = joinCode.trim().toUpperCase()
    
    if (!code) {
      toast.error('Please enter a room code')
      return
    }

    if (code.length !== 6) {
      toast.error('Room code must be 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/rooms?code=${code}`)

      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Room not found')
        } else if (res.status === 410) {
          toast.error('Room is closed')
        } else {
          toast.error('Failed to join room')
        }
        setLoading(false)
        return
      }

      const room = await res.json()
      toast.success('Joining room...')
      router.push(`/room/${room.code}`)
    } catch (error) {
      toast.error('Failed to join room')
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Users className="w-16 h-16 text-neon-blue" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Live Spin Rooms</h1>
        <p className="text-xl text-gray-300">
          Create a room and invite friends to spin wheels together in real-time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Room Card */}
        <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
            <Plus className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Room</h2>
          <p className="text-gray-400 mb-6">
            Start a new room and get a code to share with friends
          </p>

          {!showCreateForm ? (
            <button
              onClick={() => {
                setShowCreateForm(true)
                setShowJoinForm(false)
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-semibold transition"
            >
              Create New Room
            </button>
          ) : (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name (Optional)
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Game Night, Party Wheel..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Join Room Card */}
        <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700 hover:border-green-500 transition-all">
          <div className="flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Room</h2>
          <p className="text-gray-400 mb-6">
            Enter a room code to join your friends
          </p>

          {!showJoinForm ? (
            <button
              onClick={() => {
                setShowJoinForm(true)
                setShowCreateForm(false)
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg text-white font-semibold transition"
            >
              Join Existing Room
            </button>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-green-500 uppercase"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || joinCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12 bg-slate-800/40 rounded-xl p-8 border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold text-white mb-2">Create or Join</h4>
            <p className="text-gray-400 text-sm">
              Start a new room or join with a code
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold text-white mb-2">Share the Link</h4>
            <p className="text-gray-400 text-sm">
              Get a code or link to share with friends
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold text-white mb-2">Spin Together</h4>
            <p className="text-gray-400 text-sm">
              Create wheels and spin them live with everyone
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
