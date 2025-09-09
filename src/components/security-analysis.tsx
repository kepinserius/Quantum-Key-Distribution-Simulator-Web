"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { 
  Activity, 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import type { SimulationState } from "@/lib/quantum-simulator"

interface SecurityAnalysisProps {
  state: SimulationState
}

export function SecurityAnalysis({ state }: SecurityAnalysisProps) {
  // Generate chart data for error rate over time
  const errorRateData = [
    { name: "Initial", errorRate: 0 },
    { name: "After Transmission", errorRate: state.isHackerPresent ? 15 : 5 },
    { name: "After Sifting", errorRate: state.errorRate },
  ]

  // Generate basis matching data
  const basisMatchingData = [
    { name: "Matching", value: state.aliceBits.filter((bit, i) => 
      state.bobBits[i] && bit.basis === state.bobBits[i].basis
    ).length },
    { name: "Mismatching", value: state.aliceBits.filter((bit, i) => 
      state.bobBits[i] && bit.basis !== state.bobBits[i].basis
    ).length },
  ]

  const isSecure = state.errorRate <= 11

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Error Rate Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="errorRate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Error Rate</span>
              <span className={`font-bold ${isSecure ? "text-chart-5" : "text-destructive"}`}>
                {state.errorRate.toFixed(2)}%
              </span>
            </div>
            <Progress 
              value={state.errorRate} 
              max={25}
              className="h-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Secure Threshold</span>
              <span>11%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Basis Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={basisMatchingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">Matching Bases</div>
              <div className="text-2xl font-bold text-primary">
                {basisMatchingData[0].value}
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">Mismatched Bases</div>
              <div className="text-2xl font-bold">
                {basisMatchingData[1].value}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSecure ? (
              <CheckCircle className="w-5 h-5 text-chart-5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            )}
            Security Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-6 rounded-xl border-2 ${
            isSecure 
              ? "bg-chart-5/10 border-chart-5/30" 
              : "bg-destructive/10 border-destructive/30"
          }`}>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className={`p-4 rounded-full ${
                isSecure 
                  ? "bg-chart-5/20 text-chart-5" 
                  : "bg-destructive/20 text-destructive"
              }`}>
                {isSecure ? (
                  <Shield className="w-12 h-12" />
                ) : (
                  <AlertTriangle className="w-12 h-12" />
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className={`text-xl font-bold mb-2 ${
                  isSecure ? "text-chart-5" : "text-destructive"
                }`}>
                  {isSecure ? "Secure Communication Established" : "Eavesdropping Detected"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isSecure 
                    ? "The quantum key distribution protocol was completed successfully with no signs of eavesdropping. The generated key is cryptographically secure."
                    : "The error rate exceeds the security threshold, indicating potential eavesdropping. The quantum state has been compromised and the key should not be used."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/50 p-3 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground">Hacker Present</div>
                    <div className={`font-bold ${
                      state.isHackerPresent ? "text-destructive" : "text-chart-5"
                    }`}>
                      {state.isHackerPresent ? "YES" : "NO"}
                    </div>
                  </div>
                  
                  <div className="bg-background/50 p-3 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground">Intercepted Bits</div>
                    <div className={`font-bold ${
                      state.interceptedBits.length > 0 ? "text-destructive" : "text-chart-5"
                    }`}>
                      {state.interceptedBits.length}
                    </div>
                  </div>
                  
                  <div className="bg-background/50 p-3 rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground">Key Usable</div>
                    <div className={`font-bold ${isSecure ? "text-chart-5" : "text-destructive"}`}>
                      {isSecure ? "YES" : "NO"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}