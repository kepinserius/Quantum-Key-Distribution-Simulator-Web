export interface QuantumBit {
  id: string
  value: 0 | 1
  basis: "rectilinear" | "diagonal" // + or x basis
  polarization: 0 | 45 | 90 | 135 // degrees
  timestamp: number
}

export interface SimulationState {
  aliceBits: QuantumBit[]
  bobBits: QuantumBit[]
  sharedKey: string
  interceptedBits: QuantumBit[]
  errorRate: number
  isHackerPresent: boolean
  phase: "preparation" | "transmission" | "sifting" | "error-check" | "complete"
  sessionId: string
  startTime: number
  endTime: number
}

export interface HackerConfig {
  interceptionRate: number // 0.0 to 1.0
  measurementErrorRate: number // 0.0 to 1.0 - probability of incorrect measurement
  resendErrorRate: number // 0.0 to 1.0 - probability of incorrect resend
}

export class BB84Simulator {
  private state: SimulationState
  private listeners: ((state: SimulationState) => void)[] = []
  private hackerConfig: HackerConfig

  constructor() {
    this.state = {
      aliceBits: [],
      bobBits: [],
      sharedKey: "",
      interceptedBits: [],
      errorRate: 0,
      isHackerPresent: false,
      phase: "preparation",
      sessionId: this.generateSessionId(),
      startTime: 0,
      endTime: 0,
    }
    
    this.hackerConfig = {
      interceptionRate: 0.5, // 50% interception rate
      measurementErrorRate: 0.1, // 10% measurement error
      resendErrorRate: 0.1, // 10% resend error
    }
  }

  // Generate random quantum bits for Alice
  generateAliceBits(count = 100): QuantumBit[] {
    const bits: QuantumBit[] = []

    for (let i = 0; i < count; i++) {
      const value = Math.random() < 0.5 ? 0 : 1
      const basis = Math.random() < 0.5 ? "rectilinear" : "diagonal"

      // Map bit value and basis to polarization
      let polarization: 0 | 45 | 90 | 135
      if (basis === "rectilinear") {
        polarization = value === 0 ? 0 : 90 // 0° or 90°
      } else {
        polarization = value === 0 ? 45 : 135 // 45° or 135°
      }

      bits.push({
        id: `alice-${i}`,
        value,
        basis,
        polarization,
        timestamp: Date.now() + i * 100,
      })
    }

    this.state.aliceBits = bits
    this.state.phase = "transmission"
    this.state.startTime = Date.now()
    this.notifyListeners()
    return bits
  }

  // Bob measures the quantum bits with random bases
  measureBits(aliceBits: QuantumBit[], hackerPresent = false): QuantumBit[] {
    const bobBits: QuantumBit[] = []
    const interceptedBits: QuantumBit[] = []

    aliceBits.forEach((aliceBit, index) => {
      let measuredBit = { ...aliceBit }

      // Hacker intercepts and resends (if present)
      if (hackerPresent && Math.random() < this.hackerConfig.interceptionRate) {
        // Hacker's random basis choice
        const hackerBasis = Math.random() < 0.5 ? "rectilinear" : "diagonal"
        
        // Hacker's measurement (with possible error)
        let hackerValue: 0 | 1
        if (hackerBasis === aliceBit.basis) {
          // Correct basis - but still possible measurement error
          hackerValue = Math.random() < this.hackerConfig.measurementErrorRate 
            ? (aliceBit.value === 0 ? 1 : 0) 
            : aliceBit.value
        } else {
          // Wrong basis - 50% chance correct + measurement error
          hackerValue = Math.random() < 0.5 ? 0 : 1
          if (Math.random() < this.hackerConfig.measurementErrorRate) {
            hackerValue = hackerValue === 0 ? 1 : 0
          }
        }

        interceptedBits.push({
          ...aliceBit,
          id: `hacker-${index}`,
          basis: hackerBasis,
          value: hackerValue,
        })

        // Hacker resends new photon to Bob (with possible error)
        let resendValue: 0 | 1
        if (Math.random() < this.hackerConfig.resendErrorRate) {
          // Resend error - randomize the bit
          resendValue = Math.random() < 0.5 ? 0 : 1
        } else {
          // Correct resend
          resendValue = hackerValue
        }

        // Create new photon with hacker's basis
        measuredBit = {
          ...aliceBit,
          value: resendValue,
          basis: hackerBasis,
          polarization: hackerBasis === "rectilinear" 
            ? (resendValue === 0 ? 0 : 90) 
            : resendValue === 0 ? 45 : 135,
        }
      }

      // Bob's random basis choice
      const bobBasis = Math.random() < 0.5 ? "rectilinear" : "diagonal"
      let bobValue: 0 | 1

      // If Bob uses the same basis as the incoming photon, he gets the correct value
      // If different basis, 50% chance of correct measurement
      if (bobBasis === measuredBit.basis) {
        bobValue = measuredBit.value
      } else {
        bobValue = Math.random() < 0.5 ? 0 : 1
      }

      bobBits.push({
        id: `bob-${index}`,
        value: bobValue,
        basis: bobBasis,
        polarization: bobBasis === "rectilinear" ? (bobValue === 0 ? 0 : 90) : bobValue === 0 ? 45 : 135,
        timestamp: aliceBit.timestamp + 50,
      })
    })

    this.state.bobBits = bobBits
    this.state.interceptedBits = interceptedBits
    this.state.isHackerPresent = hackerPresent
    this.state.phase = "sifting"
    this.notifyListeners()
    return bobBits
  }

  // Sift the key by comparing bases
  siftKey(): string {
    const siftedBits: string[] = []
    let errors = 0
    let totalComparisons = 0

    this.state.aliceBits.forEach((aliceBit, index) => {
      const bobBit = this.state.bobBits[index]

      if (aliceBit.basis === bobBit.basis) {
        siftedBits.push(aliceBit.value.toString())

        // Count errors for error rate calculation
        if (aliceBit.value !== bobBit.value) {
          errors++
        }
        totalComparisons++
      }
    })

    this.state.errorRate = totalComparisons > 0 ? (errors / totalComparisons) * 100 : 0
    this.state.sharedKey = siftedBits.join("")
    this.state.phase = "error-check"
    this.notifyListeners()
    return this.state.sharedKey
  }

  // Complete the simulation
  completeSimulation(): SimulationState {
    this.state.phase = "complete"
    this.state.endTime = Date.now()
    this.notifyListeners()
    return this.state
  }

  // Reset simulation
  reset(): void {
    this.state = {
      aliceBits: [],
      bobBits: [],
      sharedKey: "",
      interceptedBits: [],
      errorRate: 0,
      isHackerPresent: false,
      phase: "preparation",
      sessionId: this.generateSessionId(),
      startTime: 0,
      endTime: 0,
    }
    this.notifyListeners()
  }

  // Configure hacker parameters
  configureHacker(config: Partial<HackerConfig>): void {
    this.hackerConfig = { ...this.hackerConfig, ...config }
  }

  // Get hacker configuration
  getHackerConfig(): HackerConfig {
    return { ...this.hackerConfig }
  }

  // Subscribe to state changes
  subscribe(listener: (state: SimulationState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }

  private generateSessionId(): string {
    return `QKD-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`
  }

  getState(): SimulationState {
    return { ...this.state }
  }
}

// Utility functions for quantum calculations
export const calculateErrorRate = (aliceBits: QuantumBit[], bobBits: QuantumBit[]): number => {
  let errors = 0
  let comparisons = 0

  aliceBits.forEach((aliceBit, index) => {
    const bobBit = bobBits[index]
    if (aliceBit.basis === bobBit.basis) {
      comparisons++
      if (aliceBit.value !== bobBit.value) {
        errors++
      }
    }
  })

  return comparisons > 0 ? (errors / comparisons) * 100 : 0
}

export const detectEavesdropping = (errorRate: number): boolean => {
  // In BB84, error rates above ~11% typically indicate eavesdropping
  return errorRate > 11
}

export const formatBinaryKey = (key: string, groupSize = 8): string => {
  return key.match(new RegExp(`.{1,${groupSize}}`, "g"))?.join(" ") || key
}

// Advanced quantum analysis functions
export const analyzeQuantumChannel = (state: SimulationState): {
  basisMatchingRate: number
  siftedKeyLength: number
  theoreticalErrorRate: number
} => {
  const matchingBases = state.aliceBits.filter((aliceBit, index) => {
    const bobBit = state.bobBits[index]
    return bobBit && aliceBit.basis === bobBit.basis
  }).length
  
  const basisMatchingRate = state.aliceBits.length > 0 
    ? (matchingBases / state.aliceBits.length) * 100 
    : 0
    
  const siftedKeyLength = state.sharedKey.length
  
  // Theoretical error rate calculation for BB84 with eavesdropping
  // Without eavesdropping: 0% error rate for matching bases
  // With eavesdropping: 25% error rate for matching bases (due to 50% basis mismatch + 50% measurement error)
  const theoreticalErrorRate = state.isHackerPresent ? 12.5 : 0

  return {
    basisMatchingRate,
    siftedKeyLength,
    theoreticalErrorRate
  }
}