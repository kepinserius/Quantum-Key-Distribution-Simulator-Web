"use client"

import { useEffect, useState } from "react"
import type { QuantumBit } from "@/lib/quantum-simulator"

interface QuantumPhotonProps {
  bit: QuantumBit
  isTransmitting: boolean
  onTransmissionComplete?: () => void
}

export function QuantumPhoton({ bit, isTransmitting, onTransmissionComplete }: QuantumPhotonProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isTransmitting) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onTransmissionComplete?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isTransmitting, onTransmissionComplete])

  if (!isVisible) return null

  // Determine photon color based on polarization
  const getPhotonColor = (polarization: number) => {
    switch (polarization) {
      case 0:
        return "bg-blue-400" // Horizontal
      case 45:
        return "bg-green-400" // Diagonal +
      case 90:
        return "bg-red-400" // Vertical
      case 135:
        return "bg-yellow-400" // Diagonal -
      default:
        return "bg-white"
    }
  }

  return (
    <div className="fixed top-1/2 left-0 z-50 pointer-events-none">
      <div
        className={`
          w-4 h-4 rounded-full ${getPhotonColor(bit.polarization)}
          photon-travel shadow-lg shadow-current
          flex items-center justify-center text-xs font-bold text-black
        `}
        style={{
          transform: `rotate(${bit.polarization}deg)`,
          boxShadow: `0 0 20px currentColor`,
        }}
      >
        {bit.value}
      </div>

      {/* Polarization indicator */}
      <div
        className="absolute top-1/2 left-1/2 w-8 h-1 bg-current opacity-60"
        style={{
          transform: `translate(-50%, -50%) rotate(${bit.polarization}deg)`,
          transformOrigin: "center",
        }}
      />
    </div>
  )
}
