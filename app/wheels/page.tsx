'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Users, Calendar } from 'lucide-react'

interface Wheel {
  id: string
  title: string
  description?: string
  totalSpins: number
  viewCount: number
  createdAt: string
  user: {
    name: string
    image?: string
  }
  options: Array<{
    id: string
    label: string
    color: string
  }>
}

export default function WheelsPage() {
  const [wheels, setWheels] = useState<Wheel[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'public' | 'my' | 'all'>('public')

  useEffect(() => {
    fetchWheels()
  }, [filter])

  const fetchWheels = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/wheels?filter=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setWheels(data)
      }
    } catch (error) {
      console.error('Failed to fetch wheels:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Explore Wheels</h1>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'public'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setFilter('my')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            My Wheels
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/40 rounded-xl p-6 border border-slate-700 animate-pulse"
            >
              <div className="h-6 bg-slate-700 rounded mb-4" />
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-6" />
              <div className="flex space-x-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="w-8 h-8 bg-slate-700 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : wheels.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-white mb-2">No wheels found</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'my'
              ? "You haven't created any wheels yet"
              : 'No public wheels available'}
          </p>
          <Link
            href="/wheel/create"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-xl transition"
          >
            Create Your First Wheel
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wheels.map((wheel) => (
            <Link
              key={wheel.id}
              href={`/wheel/${wheel.id}`}
              className="bg-slate-800/40 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-all hover:scale-105 group"
            >
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                {wheel.title}
              </h3>
              {wheel.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {wheel.description}
                </p>
              )}

              {/* Color Preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {wheel.options.slice(0, 8).map((option) => (
                  <div
                    key={option.id}
                    className="w-8 h-8 rounded-full border-2 border-slate-600"
                    style={{ backgroundColor: option.color }}
                    title={option.label}
                  />
                ))}
                {wheel.options.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-gray-400">
                    +{wheel.options.length - 8}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{wheel.totalSpins} spins</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{wheel.viewCount}</span>
                </div>
              </div>

              {/* Creator */}
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xs text-white">
                    {wheel.user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm text-gray-400">{wheel.user.name}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(wheel.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
