'use client'

import { useState } from 'react'

interface WheelOption {
  id: string
  label: string
  color: string
  weight?: number
}

interface WheelManagementProps {
  options: WheelOption[]
  onOptionsChange: (options: WheelOption[]) => void
  isOwner: boolean
  disabled?: boolean
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

export default function WheelManagement({ 
  options, 
  onOptionsChange, 
  isOwner, 
  disabled = false 
}: WheelManagementProps) {
  const [newOption, setNewOption] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const addOption = () => {
    if (!newOption.trim() || !isOwner) return

    const newId = Date.now().toString()
    const newColor = DEFAULT_COLORS[options.length % DEFAULT_COLORS.length]
    
    const option: WheelOption = {
      id: newId,
      label: newOption.trim(),
      color: newColor,
      weight: 1
    }

    onOptionsChange([...options, option])
    setNewOption('')
  }

  const removeOption = (id: string) => {
    if (!isOwner || options.length <= 2) return
    onOptionsChange(options.filter(opt => opt.id !== id))
  }

  const updateWeight = (id: string, weight: number) => {
    if (!isOwner) return
    const validWeight = Math.max(1, Math.min(10, weight))
    onOptionsChange(
      options.map(opt => 
        opt.id === id ? { ...opt, weight: validWeight } : opt
      )
    )
  }

  const updateLabel = (id: string, label: string) => {
    if (!isOwner) return
    onOptionsChange(
      options.map(opt => 
        opt.id === id ? { ...opt, label } : opt
      )
    )
  }

  const updateColor = (id: string, color: string) => {
    if (!isOwner) return
    onOptionsChange(
      options.map(opt => 
        opt.id === id ? { ...opt, color } : opt
      )
    )
  }

  if (!isOwner) {
    const totalWeight = options.reduce((sum, opt) => sum + (opt.weight || 1), 0)
    
    return (
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Wheel Options ({options.length})</h3>
            <p className="text-xs text-gray-500 mt-1">Total weight: {totalWeight}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            {isExpanded ? '▼ Hide' : '▶ Show'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {options.map((option) => {
              const probability = ((option.weight || 1) / totalWeight * 100).toFixed(1)
              return (
                <div key={option.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                  <div 
                    className="w-6 h-6 rounded-full border-2"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="flex-1 font-medium text-sm">{option.label}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">🎲 {option.weight || 1}/10</div>
                    <div className="text-xs text-gray-500">{probability}% chance</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const totalWeight = options.reduce((sum, opt) => sum + (opt.weight || 1), 0)

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Manage Wheel Options</h3>
          <p className="text-xs text-gray-500 mt-1">
            {options.length} options • Total weight: {totalWeight}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          {isExpanded ? '▼ Hide' : '▶ Show'}
        </button>
      </div>

      {/* Add New Option */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Add new option..."
          className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
          disabled={disabled}
          onKeyPress={(e) => e.key === 'Enter' && addOption()}
        />
        <button
          onClick={addOption}
          disabled={!newOption.trim() || disabled}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
        >
          ➕ Add
        </button>
      </div>

      {/* Options List */}
      <div className={`space-y-3 ${!isExpanded ? 'max-h-32 overflow-hidden' : ''}`}>
        {options.map((option, index) => (
          <div key={option.id} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              {/* Color Picker */}
              <input
                type="color"
                value={option.color}
                onChange={(e) => updateColor(option.id, e.target.value)}
                disabled={disabled}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              
              {/* Label Input */}
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateLabel(option.id, e.target.value)}
                disabled={disabled}
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
              
              {/* Remove Button */}
              <button
                onClick={() => removeOption(option.id)}
                disabled={disabled || options.length <= 2}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs transition-colors"
                title={options.length <= 2 ? "Need at least 2 options" : "Remove option"}
              >
                ✕
              </button>
            </div>
            
            {/* Weight Control - Probability */}
            <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">🎲 Probability:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={option.weight || 1}
                onChange={(e) => updateWeight(option.id, parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((option.weight || 1) - 1) * 11.11}%, #ddd ${((option.weight || 1) - 1) * 11.11}%, #ddd 100%)`
                }}
              />
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-blue-600 w-8 text-center">{option.weight || 1}</span>
                <span className="text-xs text-gray-500">/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {options.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No options yet. Add some options to start spinning!
        </div>
      )}
    </div>
  )
}