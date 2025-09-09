import type { SimulationState, QuantumBit } from "./quantum-simulator"

// PDF generation using jsPDF (will be imported dynamically)
export interface PDFExportData {
  timestamp: string
  simulationState: SimulationState
  sessionId: string
}

export class QuantumPDFGenerator {
  private static formatTimestamp(): string {
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  private static formatBinaryString(binary: string, groupSize = 8): string {
    return binary.match(new RegExp(`.{1,${groupSize}}`, "g"))?.join(" ") || binary
  }

  private static getBasisString(bits: QuantumBit[]): string {
    return bits.map((bit) => (bit.basis === "rectilinear" ? "+" : "x")).join("")
  }

  private static getValueString(bits: QuantumBit[]): string {
    return bits.map((bit) => bit.value).join("")
  }

  static async generatePDF(state: SimulationState): Promise<void> {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf")

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 30

    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Quantum Key Distribution Report", margin, yPosition)

    yPosition += 10
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated: ${this.formatTimestamp()}`, margin, yPosition)

    yPosition += 5
    doc.text(`Protocol: BB84 Quantum Key Distribution`, margin, yPosition)

    yPosition += 20

    // Simulation Overview
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Simulation Overview", margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const overviewData = [
      ["Phase:", state.phase.toUpperCase()],
      ["Total Bits Generated:", state.aliceBits.length.toString()],
      ["Bits Measured:", state.bobBits.length.toString()],
      ["Shared Key Length:", state.sharedKey.length.toString()],
      ["Error Rate:", `${state.errorRate.toFixed(2)}%`],
      ["Hacker Present:", state.isHackerPresent ? "YES" : "NO"],
      ["Intercepted Bits:", state.interceptedBits.length.toString()],
      ["Security Status:", state.errorRate > 11 ? "COMPROMISED" : "SECURE"],
    ]

    overviewData.forEach(([label, value]) => {
      doc.text(label, margin, yPosition)
      doc.text(value, margin + 80, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // Alice's Data
    if (state.aliceBits.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Alice's Quantum Bits", margin, yPosition)
      yPosition += 12

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const aliceValues = this.getValueString(state.aliceBits)
      const aliceBases = this.getBasisString(state.aliceBits)

      doc.text("Bit Values:", margin, yPosition)
      yPosition += 6
      doc.setFont("courier", "normal")
      doc.text(this.formatBinaryString(aliceValues), margin + 5, yPosition)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      doc.text("Measurement Bases:", margin, yPosition)
      yPosition += 6
      doc.setFont("courier", "normal")
      doc.text(this.formatBinaryString(aliceBases), margin + 5, yPosition)
      yPosition += 15
    }

    // Bob's Data
    if (state.bobBits.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Bob's Measurements", margin, yPosition)
      yPosition += 12

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const bobValues = this.getValueString(state.bobBits)
      const bobBases = this.getBasisString(state.bobBits)

      doc.text("Measured Values:", margin, yPosition)
      yPosition += 6
      doc.setFont("courier", "normal")
      doc.text(this.formatBinaryString(bobValues), margin + 5, yPosition)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      doc.text("Measurement Bases:", margin, yPosition)
      yPosition += 6
      doc.setFont("courier", "normal")
      doc.text(this.formatBinaryString(bobBases), margin + 5, yPosition)
      yPosition += 15
    }

    // Shared Key
    if (state.sharedKey) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Generated Quantum Key", margin, yPosition)
      yPosition += 12

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Key Length: ${state.sharedKey.length} bits`, margin, yPosition)
      yPosition += 8

      doc.text("Binary Key:", margin, yPosition)
      yPosition += 6
      doc.setFont("courier", "normal")

      // Split long keys across multiple lines
      const keyChunks = state.sharedKey.match(/.{1,64}/g) || [state.sharedKey]
      keyChunks.forEach((chunk) => {
        doc.text(this.formatBinaryString(chunk), margin + 5, yPosition)
        yPosition += 6
      })
      yPosition += 10
    }

    // Security Analysis
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Security Analysis", margin, yPosition)
    yPosition += 12

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    if (state.errorRate > 11) {
      doc.setTextColor(220, 38, 38) // Red color
      doc.text("⚠ SECURITY ALERT: Eavesdropping Detected", margin, yPosition)
      yPosition += 8
      doc.setTextColor(0, 0, 0) // Reset to black
      doc.text(`Error rate of ${state.errorRate.toFixed(2)}% exceeds the 11% threshold.`, margin, yPosition)
      yPosition += 6
      doc.text("This indicates potential quantum channel interception.", margin, yPosition)
      yPosition += 6
      doc.text("Recommendation: Discard this key and retry transmission.", margin, yPosition)
    } else {
      doc.setTextColor(34, 197, 94) // Green color
      doc.text("✓ SECURE: No Eavesdropping Detected", margin, yPosition)
      yPosition += 8
      doc.setTextColor(0, 0, 0) // Reset to black
      doc.text(`Error rate of ${state.errorRate.toFixed(2)}% is within acceptable limits.`, margin, yPosition)
      yPosition += 6
      doc.text("The quantum key can be safely used for encryption.", margin, yPosition)
    }

    yPosition += 15

    // Technical Details
    if (state.interceptedBits.length > 0) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Interception Details", margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`${state.interceptedBits.length} bits were intercepted during transmission.`, margin, yPosition)
      yPosition += 6
      doc.text("This demonstrates the quantum no-cloning theorem in action.", margin, yPosition)
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("Generated by Quantum Key Distribution Simulator", margin, pageHeight - 15)
    doc.text(`Report ID: QKD-${Date.now()}`, margin, pageHeight - 10)

    // Save the PDF
    const filename = `QKD_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.pdf`
    doc.save(filename)
  }
}
