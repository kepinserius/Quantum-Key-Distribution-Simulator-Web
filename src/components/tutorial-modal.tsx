"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Atom, 
  Zap, 
  Shield, 
  Key, 
  Activity, 
  TrendingUp,
  Lightbulb,
  BookOpen,
  Users,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TutorialModalProps {
  open: boolean
  onClose: () => void
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const [step, setStep] = useState(1)
  const totalSteps = 5

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: "Introduction to Quantum Key Distribution",
          icon: <Atom className="w-8 h-8 text-primary" />,
          content: (
            <div className="space-y-4">
              <p>
                Quantum Key Distribution (QKD) is a secure communication method that uses quantum mechanics 
                to enable two parties to produce a shared random secret key known only to them.
              </p>
              <p>
                This simulator demonstrates the BB84 protocol, the first quantum key distribution scheme 
                proposed by Charles Bennett and Gilles Brassard in 1984.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Key Concept
                </h4>
                <p className="mt-2">
                  Unlike classical cryptography, QKD relies on the fundamental laws of physics rather than 
                  computational complexity for security.
                </p>
              </div>
            </div>
          )
        }
      case 2:
        return {
          title: "Alice Generates Quantum Bits",
          icon: <Zap className="w-8 h-8 text-primary" />,
          content: (
            <div className="space-y-4">
              <p>
                In the first step, Alice generates random bits (0 or 1) and encodes them onto photons 
                using one of two polarization bases:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-primary/20 px-2 py-1 rounded">+</span>
                  <span><strong>Rectilinear basis:</strong> Horizontal (0°) or Vertical (90°) polarization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono bg-primary/20 px-2 py-1 rounded">×</span>
                  <span><strong>Diagonal basis:</strong> Diagonal + (45°) or Diagonal - (135°) polarization</span>
                </li>
              </ul>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Security Note
                </h4>
                <p className="mt-2">
                  The randomness of both bits and bases is crucial to the security of the protocol.
                </p>
              </div>
            </div>
          )
        }
      case 3:
        return {
          title: "Quantum Transmission & Measurement",
          icon: <Activity className="w-8 h-8 text-primary" />,
          content: (
            <div className="space-y-4">
              <p>
                Alice sends her polarized photons to Bob through a quantum channel. Bob measures each photon 
                using a randomly chosen basis (rectilinear or diagonal).
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="border-primary/20">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Matching Bases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      When Bob uses the same basis as Alice, he measures the correct bit value with 100% probability.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Mismatched Bases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      When bases don't match, Bob gets a random result with 50% probability of being correct.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        }
      case 4:
        return {
          title: "Key Sifting & Error Detection",
          icon: <Key className="w-8 h-8 text-primary" />,
          content: (
            <div className="space-y-4">
              <p>
                After transmission, Alice and Bob publicly compare their bases (but not the bit values) 
                to determine which measurements can be used for the key:
              </p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>They discard bits where bases didn't match</li>
                <li>They compare a subset of remaining bits to estimate the error rate</li>
                <li>High error rates indicate potential eavesdropping</li>
                <li>If secure, they use the remaining bits as their shared secret key</li>
              </ol>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Eavesdropping Detection
                </h4>
                <p className="mt-2">
                  In the BB84 protocol, any eavesdropping attempt introduces errors due to the 
                  quantum no-cloning theorem and measurement disturbance.
                </p>
              </div>
            </div>
          )
        }
      case 5:
        return {
          title: "Hacker Mode & Security Analysis",
          icon: <Shield className="w-8 h-8 text-primary" />,
          content: (
            <div className="space-y-4">
              <p>
                Enable Hacker Mode to simulate an eavesdropper (Eve) attempting to intercept the quantum communication:
              </p>
              <ul className="space-y-2">
                <li>Eve intercepts and measures photons using random bases</li>
                <li>Eve resends new photons to Bob based on her measurements</li>
                <li>This introduces errors in Bob's measurements</li>
                <li>Alice and Bob detect these errors during key comparison</li>
              </ul>
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Security Principle
                </h4>
                <p className="mt-2">
                  The quantum no-cloning theorem prevents Eve from perfectly copying unknown quantum states. 
                  Any measurement by Eve disturbs the quantum states, introducing detectable errors.
                </p>
              </div>
              <p>
                This simulator demonstrates how quantum mechanics provides provable security for 
                cryptographic key exchange.
              </p>
            </div>
          )
        }
      default:
        return {
          title: "",
          icon: null,
          content: null
        }
    }
  }

  const { title, icon, content } = getStepContent()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps} - Understanding the BB84 Protocol
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {content}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 === step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <Button onClick={nextStep}>
            {step === totalSteps ? "Finish Tutorial" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}