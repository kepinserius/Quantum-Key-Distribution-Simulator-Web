# Quantum Key Distribution (QKD) Simulator

An interactive simulator for the BB84 Quantum Key Distribution protocol, demonstrating how quantum cryptography works and how eavesdropping can be detected.

## Features

- Interactive visualization of quantum key distribution
- Real-time simulation of photon transmission
- Hacker mode to demonstrate eavesdropping detection
- Security analysis and error rate calculation
- PDF report generation
- Responsive design with modern UI

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: 
  - Node.js/Express for HTTP API and WebSocket connections
  - Rust for high-performance quantum simulation
- **UI Components**: Radix UI, Lucide Icons
- **Utilities**: jsPDF for PDF generation

## Project Structure

```
.
├── src/                 # Frontend source code
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   └── lib/             # Frontend utilities
├── backend/             # Backend services
│   ├── node-server/     # Node.js HTTP server
│   └── rust-simulator/  # Rust quantum simulator
├── public/              # Static assets
└── docs/                # Documentation
```

For detailed project structure information, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Rust and Cargo (latest stable version)
- npm or yarn

### Installation

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend/node-server
   npm install
   ```

3. Build Rust service:
   ```bash
   cd backend/rust-simulator
   cargo build
   ```

### Running the Application

To run the full application with both frontend and backend:

```bash
npm run dev
```

This will start:
- Frontend development server on [http://localhost:3000](http://localhost:3000)
- Node.js backend on port 3001
- Rust service on port 3030

The simulator will be available at [http://localhost:3000](http://localhost:3000).

### Alternative Ways to Run

#### Frontend Only
```bash
npm run dev:frontend
```

#### Backend Services Only
```bash
npm run dev:backend
```

This will start both the Node.js server and Rust service.

#### Full Application with Bash Script
```bash
npm run dev:full
```

This uses a bash script to start all services and manage their lifecycle.

## API Documentation

See [docs/API_DOCS.md](docs/API_DOCS.md) for detailed API documentation.

## How It Works

The BB84 protocol simulation follows these steps:

1. **Quantum Bit Generation**: Alice generates random bits and encodes them using random polarization bases (+ or ×).

2. **Quantum Transmission**: Photons travel through a quantum channel. Bob measures them using random bases.

3. **Key Sifting**: Alice and Bob compare their bases publicly and keep only bits where they used the same basis.

4. **Security Check**: They compare a subset of their bits to calculate the error rate. High error rates indicate eavesdropping.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
