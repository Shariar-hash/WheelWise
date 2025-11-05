'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface WheelOption {
  id: string
  label: string
  color: string
  weight?: number
  count?: number
  isImage?: boolean
  imageUrl?: string
}

interface SpinWheelProps {
  options: WheelOption[]
  onSpinComplete?: (result: { label: string, option: WheelOption }) => void
  spinning?: boolean
  spinDuration?: number
  onSpinStart?: () => void
  targetResult?: string  // The result to land on (for syncing across clients)
  onWheelClick?: () => void  // Click handler for the wheel
  theme?: {
    backgroundColor?: string
    pointerColor?: string
    borderColor?: string
  }
}

export default function SpinWheel({
  options,
  onSpinComplete,
  spinning = false,
  spinDuration = 4,
  onSpinStart,
  targetResult,
  onWheelClick,
  theme = {},
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [finalRotation, setFinalRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Filter out empty options and fix segment counting
  const validOptions = options.filter(option => option.label.trim() !== '')
  // Simple equal segments based on options count
  const getSegments = () => {
    const totalOptions = validOptions.length;
    const segmentAngle = 360 / totalOptions;
    
    return validOptions.map((opt, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      
      return {
        ...opt,
        index,
        startAngle,
        endAngle,
        sliceAngle: segmentAngle
      };
    });
  }

  useEffect(() => {
    drawWheel()
  }, [validOptions])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get proportional segments based on weights
    const segments = getSegments()

    // Draw segments
    segments.forEach((segment) => {
      const startAngle = (segment.startAngle - 90) * (Math.PI / 180)
      const endAngle = (segment.endAngle - 90) * (Math.PI / 180)

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = segment.color
      ctx.fill()
      ctx.strokeStyle = theme.borderColor || '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text or image
      if (segment.isImage && segment.imageUrl) {
        // Draw image segment
        const img = new Image()
        img.onload = () => {
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(startAngle + (segment.sliceAngle / 2) * (Math.PI / 180))
          
          // Create clipping path for the segment
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, radius - 40, -segment.sliceAngle / 2 * (Math.PI / 180), segment.sliceAngle / 2 * (Math.PI / 180))
          ctx.closePath()
          ctx.clip()
          
          // Draw image
          const imgSize = Math.min(radius - 60, 80)
          ctx.drawImage(img, radius - imgSize - 30, -imgSize/2, imgSize, imgSize)
          
          ctx.restore()
        }
        img.src = segment.imageUrl
      } else {
        // Draw text
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(startAngle + (segment.sliceAngle / 2) * (Math.PI / 180))
        ctx.textAlign = 'right'
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 16px Arial'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.fillText(segment.label, radius - 20, 5)
        ctx.restore()
      }
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI)
    ctx.fillStyle = theme.backgroundColor || '#1e293b'
    ctx.fill()
    ctx.strokeStyle = theme.borderColor || '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  const calculateWinningSegment = (finalRotationValue: number) => {
    if (validOptions.length === 0) return 0
    
    const totalOptions = validOptions.length;
    const segmentAngle = 360 / totalOptions;
    
    // Normalize angle between 0–360
    const normalizedRotation = ((finalRotationValue % 360) + 360) % 360;
    
    // Calculate which segment the pointer lands on (pointer at top)
    const index = Math.floor((360 - normalizedRotation) / segmentAngle) % totalOptions;
    
    return index;
  }

  const handleSpin = (resultValue: number) => {
    if (isSpinning) return

    setIsSpinning(true)

    const totalOptions = validOptions.length;
    const segmentAngle = 360 / totalOptions;

    // Decide which option to stop at
    const targetIndex = targetResult
      ? validOptions.findIndex(opt => opt.label === targetResult)
      : Math.floor(Math.random() * totalOptions);

    // Use valid index if targetResult not found
    const finalTargetIndex = targetIndex >= 0 ? targetIndex : Math.floor(Math.random() * totalOptions);

    // Calculate the angle for that option
    const targetAngle = finalTargetIndex * segmentAngle;

    // Add multiple full rotations for animation
    const extraSpins = 5; // number of full spins
    const finalRotation = extraSpins * 360 + (360 - targetAngle) + Math.random() * (segmentAngle / 3);

    const newFinalRotation = rotation + finalRotation;
    setRotation(newFinalRotation)
    setFinalRotation(newFinalRotation)

    // Complete spin after animation
    setTimeout(() => {
      setIsSpinning(false)
      fireConfetti()
      
      // Determine the result after the spin completes
      const resultIndex = calculateWinningSegment(newFinalRotation)
      const actualWinner = validOptions[resultIndex];
      
      console.log(`🎯 Wheel result: The wheel stopped on "${actualWinner?.label}"`);
      
      if (onSpinComplete && actualWinner) {
        onSpinComplete({
          label: actualWinner.label || actualWinner.id,
          option: actualWinner
        })
      }
    }, spinDuration * 1000)
  }

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f3ff', '#ff00ff', '#00ff88', '#ffff00'],
    })
  }

  useEffect(() => {
    if (spinning && !isSpinning) {
      // Trigger spin with random value (in real app, this comes from server)
      const randomValue = Math.random()
      handleSpin(randomValue)
    }
  }, [spinning])

  return (
    <div className="relative flex items-center justify-center">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px]"
            style={{ borderTopColor: theme.pointerColor || '#ef4444' }}
          />
        </div>

        {/* Spinning Canvas */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{
            duration: spinDuration,
            ease: [0.17, 0.67, 0.12, 0.99],
          }}
          className="relative"
        >
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="drop-shadow-2xl"
            style={{
              background: theme.backgroundColor || 'transparent',
              borderRadius: '50%',
            }}
          />
        </motion.div>

        {/* Center Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => {
              if (!isSpinning && validOptions.length > 0) {
                if (onWheelClick) {
                  onWheelClick();
                } else {
                  // For single player mode, spin directly
                  handleSpin(Math.random());
                }
              }
            }}
            disabled={isSpinning || validOptions.length === 0}
            className={`w-20 h-20 rounded-full bg-black text-white font-bold text-sm shadow-xl transition-all ${
              isSpinning || validOptions.length === 0
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-110 hover:bg-gray-800'
            }`}
          >
            SPIN
          </button>
        </div>
      </div>
    </div>
  )
}
