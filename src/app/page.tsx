"use client"

import { useState, useEffect } from "react"
import { BB84Simulator, type SimulationState } from "@/lib/quantum-simulator"
import { SimulationControls } from "@/components/simulation-controls"
import { EnhancedPhoton } from "@/components/enhanced-photon"
import { SecurityAnalysis } from "@/components/security-analysis"
import { TutorialModal } from "@/components/tutorial-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Atom, Key, Zap, Shield, Cpu, Info, TrendingUp, Activity, Lock, BarChart3 } from "lucide-react"

export default function QuantumSimulatorPage() {
  const [simulator] = useState(() => new BB84Simulator())
  const [state, setState] = useState<SimulationState>(simulator.getState())
  const [transmittingBit, setTransmittingBit] = useState<number | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSecurityAnalysis, setShowSecurityAnalysis] = useState(false)

  useEffect(() => {
    const unsubscribe = simulator.subscribe(setState)
    return unsubscribe
  }, [simulator])

  // Simulate photon transmission animation
  useEffect(() => {
    if (state.phase === "transmission" && state.aliceBits.length > 0) {
      let bitIndex = 0
      const interval = setInterval(() => {
        if (bitIndex < state.aliceBits.length) {
          setTransmittingBit(bitIndex)
          bitIndex++
        } else {
          clearInterval(interval)
          setTransmittingBit(null)
        }
      }, 300)
      return () => clearInterval(interval)
    }
  }, [state.phase, state.aliceBits.length])

  return (
    <div className="min-h-screen bg-background quantum-grid">
      <header className="border-b border-border quantum-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl amber-glow border border-primary/20">
                <Atom className="w-12 h-12 text-primary quantum-pulse" />
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-foreground mb-3">Quantum Key Distribution</h1>
                <p className="text-muted-foreground text-xl mb-4">
                  Interactive BB84 Protocol with Real-time Security Analysis
                </p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-primary text-primary-foreground border-primary/50 px-3 py-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Quantum Secure
                  </Badge>
                  <Badge variant="outline" className="bg-chart-4 text-white border-chart-4 px-3 py-1">
                    <Cpu className="w-4 h-4 mr-2" />
                    BB84 Protocol
                  </Badge>
                  <Badge variant="outline" className="bg-chart-5/20 text-foreground border-chart-5/50 px-3 py-1">
                    <Activity className="w-4 h-4 mr-2" />
                    Real-time Analysis
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowTutorial(!showTutorial)}
                variant="outline"
                className="bg-transparent border-primary/30 hover:bg-primary/10"
              >
                <Info className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
              <Button
                onClick={() => setShowSecurityAnalysis(!showSecurityAnalysis)}
                variant="outline"
                className="bg-transparent border-chart-5/30 hover:bg-chart-5/10"
                disabled={state.phase !== "complete"}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showTutorial && (
        <div className="bg-gradient-to-r from-primary/10 to-chart-4/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-background/50 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold">Quantum Bit Generation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alice generates random bits and encodes them using random polarization bases (+ or ×).
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background/50 border-chart-4/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-chart-4/20 rounded-full flex items-center justify-center">
                      <span className="text-chart-4 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold">Quantum Transmission</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Photons travel through quantum channel. Bob measures using random bases.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background/50 border-chart-5/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-chart-5/20 rounded-full flex items-center justify-center">
                      <span className="text-chart-5 font-bold">3</span>
                    </div>
                    <h3 className="font-semibold">Key Sifting & Security</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Matching bases create shared key. High error rates indicate eavesdropping.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="relative">
          <SimulationControls simulator={simulator} state={state} onStateChange={setState} />
        </div>

        <Card className="relative overflow-hidden navy-gradient border-primary/20 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Zap className="w-7 h-7 text-primary amber-glow" />
              Quantum Communication Channel
              {state.isHackerPresent && (
                <Badge variant="destructive" className="ml-auto animate-pulse">
                  <Shield className="w-3 h-3 mr-1" />
                  Intrusion Detected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 relative p-8">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center amber-glow shadow-2xl border-2 border-primary/30">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <span className="text-sm text-white font-semibold mt-3 bg-primary px-3 py-1 rounded-full border border-primary/30">
                Alice (Sender)
              </span>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center amber-glow shadow-2xl border-2 border-primary/30">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <span className="text-sm text-white font-semibold mt-3 bg-primary px-3 py-1 rounded-full border border-primary/30">
                Bob (Receiver)
              </span>
            </div>

            <div className="absolute top-1/2 left-24 right-24 h-2 bg-gradient-to-r from-primary via-primary/90 to-primary -translate-y-1/2 rounded-full amber-glow shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
            </div>

            {state.isHackerPresent && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center quantum-pulse shadow-2xl border-2 border-destructive/50">
                  <span className="text-destructive-foreground font-bold text-xl">E</span>
                </div>
                <span className="text-xs text-destructive font-semibold mt-2 bg-destructive/10 px-2 py-1 rounded-full animate-pulse">
                  Eve (Eavesdropper)
                </span>
              </div>
            )}

            {/* Enhanced Photon animation */}
            {transmittingBit !== null && state.aliceBits[transmittingBit] && (
              <EnhancedPhoton 
                bit={state.aliceBits[transmittingBit]} 
                isTransmitting={true} 
                hackerIntercepting={state.isHackerPresent}
              />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="navy-gradient border-primary/20 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 amber-glow">
                <Atom className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{state.aliceBits.length}</div>
              <div className="text-sm text-muted-foreground">Quantum Bits</div>
            </CardContent>
          </Card>
          <Card className="navy-gradient border-chart-4/20 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-chart-4" />
              </div>
              <div className="text-3xl font-bold text-chart-4 mb-1">{state.bobBits.length}</div>
              <div className="text-sm text-muted-foreground">Measurements</div>
            </CardContent>
          </Card>
          <Card className="navy-gradient border-chart-5/20 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-chart-5/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-chart-5" />
              </div>
              <div className="text-3xl font-bold text-chart-5 mb-1">{state.sharedKey.length}</div>
              <div className="text-sm text-muted-foreground">Shared Key</div>
            </CardContent>
          </Card>
          <Card className="navy-gradient border-destructive/20 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-destructive" />
              </div>
              <div className={`text-3xl font-bold mb-1 ${state.errorRate > 11 ? "text-destructive" : "text-chart-5"}`}>
                {state.errorRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="navy-gradient border-primary/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/15 to-transparent">
              <CardTitle className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary rounded-full amber-glow" />
                Alice's Quantum Bits
                {state.aliceBits.length > 0 && (
                  <Badge variant="outline" className="bg-primary text-primary-foreground border-primary ml-auto">
                    {state.aliceBits.length} bits
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {state.aliceBits.length > 0 ? (
                <div className="space-y-6">
                  <div className="p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Quantum Bits:
                    </div>
                    <div className="font-mono text-primary text-xl tracking-wider">
                      {state.aliceBits
                        .slice(0, 20)
                        .map((bit) => bit.value)
                        .join("")}
                      {state.aliceBits.length > 20 && "..."}
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Polarization Bases:
                    </div>
                    <div className="font-mono text-primary text-xl tracking-wider">
                      {state.aliceBits
                        .slice(0, 20)
                        .map((bit) => (bit.basis === "rectilinear" ? "+" : "×"))
                        .join(" ")}
                      {state.aliceBits.length > 20 && " ..."}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
                  <Atom className="w-12 h-12 opacity-50" />
                  <span>No quantum bits generated yet</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="navy-gradient border-chart-4/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-chart-4/15 to-transparent">
              <CardTitle className="flex items-center gap-3">
                <div
                  className="w-5 h-5 bg-chart-4 rounded-full"
                  style={{ boxShadow: "0 0 10px rgba(6, 182, 212, 0.5)" }}
                />
                Bob's Measurements
                {state.bobBits.length > 0 && (
                  <Badge variant="outline" className="bg-chart-4/20 text-foreground border-chart-4/50 ml-auto">
                    {state.bobBits.length} measured
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {state.bobBits.length > 0 ? (
                <div className="space-y-6">
                  <div className="p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-chart-4/20">
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Measured Bits:
                    </div>
                    <div className="font-mono text-chart-4 text-xl tracking-wider">
                      {state.bobBits
                        .slice(0, 20)
                        .map((bit) => bit.value)
                        .join("")}
                      {state.bobBits.length > 20 && "..."}
                    </div>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-chart-4/20">
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Detection Bases:
                    </div>
                    <div className="font-mono text-chart-4 text-xl tracking-wider">
                      {state.bobBits
                        .slice(0, 20)
                        .map((bit) => (bit.basis === "rectilinear" ? "+" : "×"))
                        .join(" ")}
                      {state.bobBits.length > 20 && " ..."}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
                  <TrendingUp className="w-12 h-12 opacity-50" />
                  <span>No measurements recorded yet</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {state.sharedKey && (
          <Card className="navy-gradient border-chart-5/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-chart-5/15 to-transparent">
              <CardTitle className="flex items-center gap-3">
                <Key
                  className="w-7 h-7 text-chart-5"
                  style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))" }}
                />
                Generated Quantum Cryptographic Key
                <Badge variant="outline" className="bg-chart-5/20 text-foreground border-chart-5/50">
                  {state.sharedKey.length} bits secure
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="font-mono text-xl bg-gradient-to-r from-muted/60 to-muted/40 p-8 rounded-2xl break-all border border-chart-5/20 shadow-inner">
                <div className="text-chart-5 leading-relaxed">
                  {state.sharedKey.match(/.{1,8}/g)?.join(" ") || state.sharedKey}
                </div>
              </div>
              {state.interceptedBits.length > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-destructive/15 to-destructive/10 border border-destructive/30 rounded-2xl">
                  <div className="flex items-center gap-3 text-destructive font-semibold text-lg mb-3">
                    <Shield className="w-6 h-6" />
                    Security Alert: {state.interceptedBits.length} bits compromised during transmission
                  </div>
                  <div className="text-destructive/80 leading-relaxed">
                    Quantum entanglement broken - eavesdropping detected through error rate analysis. The quantum
                    no-cloning theorem ensures that any attempt to intercept quantum information introduces detectable
                    errors in the communication channel.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showSecurityAnalysis && state.phase === "complete" && (
          <SecurityAnalysis state={state} />
        )}
      </main>

      <TutorialModal open={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  )
}
