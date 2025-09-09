"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { QuantumBit } from "@/lib/quantum-simulator"

interface EnhancedPhotonProps {
  bit: QuantumBit
  isTransmitting: boolean
  hackerIntercepting?: boolean
  onTransmissionComplete?: () => void
}

export function EnhancedPhoton({ 
  bit, 
  isTransmitting, 
  hackerIntercepting = false,
  onTransmissionComplete 
}: EnhancedPhotonProps) {
  const [position, setPosition] = useState(0)
  const [isIntercepted, setIsIntercepted] = useState(false)
  const [interceptPosition, setInterceptPosition] = useState(0)

  useEffect(() => {
    if (isTransmitting) {
      setPosition(0)
      setIsIntercepted(false)
      
      const travelInterval = setInterval(() => {
        setPosition(prev => {
          const newPosition = prev + 2
          
          // Hacker interception at 50% position
          if (hackerIntercepting && !isIntercepted && newPosition >= 50) {
            setIsIntercepted(true)
            setInterceptPosition(newPosition)
            
            // Continue after brief interception
            setTimeout(() => {
              if (newPosition >= 100) {
                clearInterval(travelInterval)
                onTransmissionComplete?.()
              }
            }, 300)
            
            return newPosition
          }
          
          if (newPosition >= 100) {
            clearInterval(travelInterval)
            onTransmissionComplete?.()
            return 100
          }
          
          return newPosition
        })
      }, 50)

      return () => clearInterval(travelInterval)
    }
  }, [isTransmitting, hackerIntercepting, isIntercepted, onTransmissionComplete])

  if (!isTransmitting) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Main photon */}
      <div
        className={`
          absolute top-1/2 w-6 h-6 rounded-full flex items-center justify-center
          text-xs font-bold transform -translate-y-1/2 transition-all duration-100
          ${isIntercepted ? "animate-ping" : ""}
        `}
        style={{
          left: `${position}%`,
          transform: `translate(-50%, -50%) rotate(${bit.polarization}deg)`,
          backgroundColor: getPhotonColor(bit.polarization),
          boxShadow: `0 0 15px ${getPhotonGlowColor(bit.polarization)}, 0 0 30px ${getPhotonGlowColor(bit.polarization)}80`,
        }}
      >
        <span className="text-white drop-shadow">{bit.value}</span>
      </div>
      
      {/* Polarization indicator */}
      <div
        className="absolute top-1/2 h-0.5 bg-white/80"
        style={{
          left: `${position}%`,
          width: "20px",
          transform: `translate(-50%, -50%) rotate(${bit.polarization}deg)`,
          transformOrigin: "center",
          boxShadow: "0 0 5px white",
        }}
      />
      
      {/* Hacker interception effect */}
      {hackerIntercepting && isIntercepted && (
        <div
          className="absolute w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
          style={{
            left: `${interceptPosition}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.9)",
          }}
        >
          <span className="text-white font-bold text-lg">E</span>
        </div>
      )}
      
      {/* Travel path */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />
    </div>
  )
}

const getPhotonColor = (polarization: number) => {
  switch (polarization) {
    case 0: return "#60a5fa"   // Blue for horizontal
    case 45: return "#34d399"  // Green for diagonal +
    case 90: return "#f87171"  // Red for vertical
    case 135: return "#fbbf24" // Yellow for diagonal -
    default: return "#ffffff"
  }
}

const getPhotonGlowColor = (polarization: number) => {
  switch (polarization) {
    case 0: return "#60a5fa"
    case 45: return "#34d399"
    case 90: return "#f87171"
    case 135: return "#fbbf24"
    default: return "#ffffff"
  }
}