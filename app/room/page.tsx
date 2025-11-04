'use client'

import { useState } from 'react'
import CreateRoom from '@/components/room/CreateRoom'
import JoinRoom from '@/components/room/JoinRoom'

export default function RoomPage() {
  const [activeTab, setActiveTab] = useState('create')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Live Spin Rooms</h1>
        <p className="text-xl text-gray-300">
          Create a room and invite friends to spin wheels together in real-time
        </p>
      </div>

      <div className="bg-slate-800/40 rounded-xl border border-slate-700">
        <div className="flex border-b border-slate-600">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-6 py-4 text-lg font-semibold transition-colors rounded-tl-xl ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 px-6 py-4 text-lg font-semibold transition-colors rounded-tr-xl ${
              activeTab === 'join'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Join Room
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'create' ? <CreateRoom /> : <JoinRoom />}
        </div>
      </div>
    </div>
  )
}
