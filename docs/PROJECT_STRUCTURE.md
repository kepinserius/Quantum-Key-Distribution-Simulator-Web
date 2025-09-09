# Project Structure

## Frontend
The frontend is built with Next.js and React, located in the root directory.

## Backend
The backend consists of two services:

1. **Node.js Server** (`backend/node-server`):
   - Handles HTTP requests from the frontend
   - Manages WebSocket connections for real-time updates
   - Communicates with the Rust service

2. **Rust Service** (`backend/rust-simulator`):
   - Implements the high-performance quantum simulator
   - Provides HTTP API for simulation operations
   - Handles the computationally intensive parts of the simulation

## Running the Application

To run the full application, use:
```bash
npm run dev
```

This will start:
- Frontend on port 3000
- Node.js backend on port 3001
- Rust service on port 3030

## API Documentation

See [API_DOCS.md](API_DOCS.md) for detailed API documentation.