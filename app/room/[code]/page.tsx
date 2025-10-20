'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Copy, Check, Users, Plus, ExternalLink, X } from 'lucide-react'
import toast from 'react-hot-toast'
import SpinWheel from '@/components/wheel/spin-wheel'

interface Room {
  id: string
  code: string
  name: string
  host: {
    id: string
    name: string
    image?: string
  }
  wheels: Array<{
    id: string
    title?: string
    options: Array<{
      id: string
      label: string
      color: string
      weight: number
    }>
  }>
  isActive: boolean
}

export default function RoomViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showCreateWheel, setShowCreateWheel] = useState(false)
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null)

  const code = params.code as string

  useEffect(() => {
    if (code) {
      fetchRoom()
    }
  }, [code])

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms?code=${code}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Room not found')
          router.push('/room')
        } else if (res.status === 410) {
          toast.error('This room has been closed')
          router.push('/room')
        }
        return
      }

      const data = await res.json()
      setRoom(data)
    } catch (error) {
      console.error('Failed to fetch room:', error)
      toast.error('Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading room...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Room not found</h2>
        <button
          onClick={() => router.push('/room')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Go to Rooms
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Room Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {room.name || `Room ${room.code}`}
            </h1>
            <p className="text-gray-300">
              Hosted by <span className="font-semibold">{room.host.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Room Code */}
            <div className="bg-slate-800/60 px-6 py-3 rounded-lg border border-slate-600">
              <div className="text-xs text-gray-400 mb-1">Room Code</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-bold text-white tracking-wider">
                  {room.code}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="p-2 hover:bg-slate-700 rounded transition"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Share Link Button */}
            <button
              onClick={copyRoomLink}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold flex items-center gap-2 transition"
            >
              <ExternalLink className="w-5 h-5" />
              Share Link
            </button>
          </div>
        </div>
      </div>

      {/* Create Wheel Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Wheels in This Room</h2>
        <button
          onClick={() => router.push(`/room/${code}/create`)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg text-white font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Create Wheel
        </button>
      </div>

      {/* Wheels Grid */}
      {room.wheels.length === 0 ? (
        <div className="bg-slate-800/40 rounded-xl p-12 border border-slate-700 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-white mb-2">No wheels yet</h3>
          <p className="text-gray-400 mb-6">
            Be the first to create a wheel in this room!
          </p>
          <button
            onClick={() => router.push(`/room/${code}/create`)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-xl transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Wheel
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {room.wheels.map((wheel) => (
            <div
              key={wheel.id}
              className="bg-slate-800/40 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-all group cursor-pointer"
              onClick={() => setSelectedWheel(wheel.id)}
            >
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition">
                {wheel.title || 'Untitled Wheel'}
              </h3>

              {/* Color Preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {wheel.options.slice(0, 6).map((option) => (
                  <div
                    key={option.id}
                    className="w-10 h-10 rounded-full border-2 border-slate-600"
                    style={{ backgroundColor: option.color }}
                    title={option.label}
                  />
                ))}
                {wheel.options.length > 6 && (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm text-gray-400 border-2 border-slate-600">
                    +{wheel.options.length - 6}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-400">
                {wheel.options.length} options
              </div>

              <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition">
                Spin This Wheel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Wheel Spin Modal */}
      {selectedWheel && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-4xl w-full border border-slate-700 relative">
            <button
              onClick={() => setSelectedWheel(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            {(() => {
              const wheel = room.wheels.find((w) => w.id === selectedWheel)
              if (!wheel) return null

              return (
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {wheel.title || 'Spin the Wheel'}
                  </h2>
                  <SpinWheel
                    options={wheel.options.map((opt) => ({
                      id: opt.id,
                      label: opt.label,
                      color: opt.color,
                      weight: opt.weight,
                    }))}
                  />
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Users className="w-5 h-5 text-blue-400 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-white mb-1">Live Room Active</p>
          <p>
            Everyone in this room can see and spin all wheels. Share the room code or link with
            friends to invite them!
          </p>
        </div>
      </div>
    </div>
  )
}
