# QKD Simulator Backend

This is the backend service for the Quantum Key Distribution (QKD) Simulator. It consists of two components:

1. **Node.js Server**: Handles HTTP requests and WebSocket connections
2. **Rust Service**: Performs high-performance quantum simulations

## Architecture

```
┌─────────────────┐    HTTP/WS    ┌──────────────────┐
│   Frontend      │◄─────────────►│  Node.js Server  │
│  (Next.js)      │               │   (Express)      │
└─────────────────┘               └─────────┬────────┘
                                            │
                                            │ HTTP
                                            ▼
                                ┌─────────────────────┐
                                │   Rust Service      │
                                │ (High-performance   │
                                │  quantum simulator) │
                                └─────────────────────┘
```

## Prerequisites

- Node.js (v14 or higher)
- Rust (latest stable version)
- Cargo (Rust package manager)

## Installation

### Node.js Server

```bash
cd backend/node-server
npm install
```

### Rust Service

```bash
cd backend/rust-simulator
cargo build
```

## Running the Services

### Node.js Server

```bash
cd backend/node-server
npm start
```

The server will start on port 3001.

### Rust Service

```bash
cd backend/rust-simulator
cargo run
```

The service will start on port 3030.

## API Documentation

See [API_DOCS.md](API_DOCS.md) for detailed API documentation.

## Development

### Node.js Server

For development with auto-reload:
```bash
cd backend/node-server
npm run dev
```

### Rust Service

For development with auto-reload:
```bash
cd backend/rust-simulator
cargo watch -x run
```

## Testing

### Node.js Server

```bash
cd backend/node-server
npm test
```

### Rust Service

```bash
cd backend/rust-simulator
cargo test
```

## Building for Production

### Node.js Server

```bash
cd backend/node-server
npm run build
```

### Rust Service

```bash
cd backend/rust-simulator
cargo build --release
```