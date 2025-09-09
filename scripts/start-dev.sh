#!/bin/bash

# Script to start the full QKD Simulator application in development mode

echo "Starting QKD Simulator in development mode..."

# Start Rust service in background
echo "Starting Rust service..."
cd backend/rust-simulator
cargo run &
RUST_PID=$!
cd ../..

# Start Node.js backend in background
echo "Starting Node.js backend..."
cd backend/node-server
npm run dev &
NODE_PID=$!
cd ../..

# Wait a moment for backend services to start
sleep 3

# Start frontend
echo "Starting frontend..."
npm run dev:frontend

# Cleanup function to kill background processes
cleanup() {
    echo "Shutting down services..."
    kill $RUST_PID $NODE_PID 2>/dev/null
    exit 0
}

# Trap exit signals to cleanup
trap cleanup EXIT INT TERM