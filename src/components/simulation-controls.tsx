"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Shield, ShieldAlert, Download, Zap, Activity, Settings } from "lucide-react"
import type { BB84Simulator, SimulationState, HackerConfig } from "@/lib/quantum-simulator"
import { QuantumPDFGenerator } from "@/lib/pdf-generator"

interface SimulationControlsProps {
  simulator: BB84Simulator
  state: SimulationState
  onStateChange: (state: SimulationState) => void
}

export function SimulationControls({ simulator, state, onStateChange }: SimulationControlsProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [hackerMode, setHackerMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hackerConfig, setHackerConfig] = useState<HackerConfig>(simulator.getHackerConfig())

  const startSimulation = async () => {
    setIsRunning(true)

    // Configure hacker settings if enabled
    if (hackerMode) {
      simulator.configureHacker(hackerConfig)
    }

    // Step 1: Alice generates bits
    await new Promise((resolve) => setTimeout(resolve, 500))
    simulator.generateAliceBits(50)

    // Step 2: Transmission (with or without hacker)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    simulator.measureBits(simulator.getState().aliceBits, hackerMode)

    // Step 3: Key sifting
    await new Promise((resolve) => setTimeout(resolve, 1000))
    simulator.siftKey()

    // Step 4: Complete
    await new Promise((resolve) => setTimeout(resolve, 500))
    simulator.completeSimulation()

    setIsRunning(false)
  }

  const resetSimulation = () => {
    simulator.reset()
    setIsRunning(false)
  }

  const toggleHackerMode = () => {
    setHackerMode(!hackerMode)
    if (state.phase !== "preparation") {
      resetSimulation()
    }
  }

  const exportToPDF = async () => {
    if (state.phase !== "complete") return

    setIsExporting(true)
    try {
      await QuantumPDFGenerator.generatePDF(state)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const updateHackerConfig = (key: keyof HackerConfig, value: number) => {
    setHackerConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "preparation":
        return "bg-muted text-muted-foreground"
      case "transmission":
        return "bg-primary text-primary-foreground"
      case "sifting":
        return "bg-chart-2 text-white"
      case "error-check":
        return "bg-chart-3 text-white"
      case "complete":
        return "bg-chart-5 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="w-full navy-gradient border-primary/20 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/15 to-transparent">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Activity className="w-6 h-6 text-primary amber-glow" />
          Quantum Key Distribution Controls
          <Badge variant="outline" className={`${getPhaseColor(state.phase)} border-0 px-3 py-1 font-semibold`}>
            {state.phase.toUpperCase()}
          </Badge>
          {hackerMode && (
            <Badge 
              variant="destructive" 
              className="ml-auto animate-pulse cursor-pointer"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-3 h-3 mr-1" />
              Hacker Settings
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={startSimulation}
            disabled={isRunning || state.phase === "complete"}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base font-semibold"
            size="lg"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? "Running Simulation..." : "Start Quantum Simulation"}
          </Button>

          <Button
            onClick={resetSimulation}
            variant="outline"
            className="flex items-center gap-2 bg-transparent border-primary/30 hover:bg-primary/10 px-6 py-3 text-base"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>

          <Button
            onClick={toggleHackerMode}
            variant={hackerMode ? "destructive" : "secondary"}
            className={`flex items-center gap-2 px-6 py-3 text-base font-semibold ${
              hackerMode ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-secondary hover:bg-secondary/80"
            }`}
            size="lg"
          >
            {hackerMode ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            {hackerMode ? "Hacker Mode ACTIVE" : "Enable Hacker Mode"}
          </Button>

          <Button
            onClick={exportToPDF}
            disabled={state.phase !== "complete" || isExporting}
            variant="outline"
            className="flex items-center gap-2 bg-transparent border-chart-5/30 hover:bg-chart-5/10 px-6 py-3 text-base"
            size="lg"
          >
            <Download className="w-5 h-5" />
            {isExporting ? "Generating PDF..." : "Export Report"}
          </Button>
        </div>

        {showSettings && hackerMode && (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-destructive flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Hacker Configuration
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Interception Rate: {hackerConfig.interceptionRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[hackerConfig.interceptionRate]}
                    onValueChange={([value]) => updateHackerConfig("interceptionRate", value)}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Probability that the hacker will intercept each photon
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Measurement Error: {hackerConfig.measurementErrorRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[hackerConfig.measurementErrorRate]}
                    onValueChange={([value]) => updateHackerConfig("measurementErrorRate", value)}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Probability that the hacker will make an incorrect measurement
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Resend Error: {hackerConfig.resendErrorRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[hackerConfig.resendErrorRate]}
                    onValueChange={([value]) => updateHackerConfig("resendErrorRate", value)}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Probability that the hacker will resend an incorrect photon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isRunning && (
          <div className="p-4 bg-gradient-to-r from-primary/10 to-chart-4/10 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-semibold text-primary">Quantum Simulation in Progress</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-chart-4 h-2 rounded-full animate-pulse"
                style={{ width: `${Math.min(100, (state.aliceBits.length / 50) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Simulation Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-primary">Alice's Bits</div>
            <div className="text-2xl font-mono">{state.aliceBits.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-primary">Bob's Bits</div>
            <div className="text-2xl font-mono">{state.bobBits.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-primary">Shared Key</div>
            <div className="text-2xl font-mono">{state.sharedKey.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-primary">Error Rate</div>
            <div className={`text-2xl font-mono ${state.errorRate > 11 ? "text-destructive" : "text-chart-5"}`}>
              {state.errorRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {state.phase === "complete" && (
          <div
            className={`p-6 rounded-2xl border-2 ${
              state.errorRate > 11
                ? "bg-gradient-to-r from-destructive/15 to-destructive/10 border-destructive/50 text-destructive"
                : "bg-gradient-to-r from-chart-5/15 to-chart-5/10 border-chart-5/50 text-chart-5"
            }`}
          >
            <div className="font-bold flex items-center gap-3 text-lg mb-3">
              {state.errorRate > 11 ? <ShieldAlert className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              {state.errorRate > 11 ? "⚠️ Eavesdropping Detected!" : "✅ Secure Communication Established"}
            </div>
            <div className="leading-relaxed">
              {state.errorRate > 11
                ? `High error rate (${state.errorRate.toFixed(1)}%) indicates potential quantum state collapse due to unauthorized measurement. The shared key should be discarded and the protocol restarted.`
                : `Low error rate (${state.errorRate.toFixed(1)}%) confirms the integrity of quantum key distribution. The generated key is cryptographically secure.`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
