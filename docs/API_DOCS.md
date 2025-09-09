# QKD Simulator Backend API

## Overview
This document describes the API endpoints for the QKD Simulator backend, which consists of a Node.js server for handling HTTP requests and a Rust service for performing quantum simulations.

## Base URLs
- Node.js API: `http://localhost:3001/api`
- Rust Service: `http://localhost:3030`

## WebSocket
The backend provides real-time updates via WebSocket at `ws://localhost:3001`.

## Endpoints

### Start Simulation
- **URL**: `POST /api/simulation/start`
- **Description**: Initializes a new quantum key distribution simulation
- **Request Body**:
  ```json
  {
    "bitCount": 50,          // Number of quantum bits to generate (optional, default: 50)
    "hackerMode": false,     // Enable hacker mode (optional, default: false)
    "hackerConfig": {        // Hacker configuration (optional)
      "interceptionRate": 0.5,
      "measurementErrorRate": 0.1,
      "resendErrorRate": 0.1
    }
  }
  ```
- **Response**:
  ```json
  {
    "simulationId": "sim-1234567890",
    "state": {
      // Current simulation state
    }
  }
  ```

### Configure Hacker Settings
- **URL**: `POST /api/simulation/:id/configure-hacker`
- **Description**: Updates hacker configuration for a simulation
- **Request Body**:
  ```json
  {
    "interceptionRate": 0.5,
    "measurementErrorRate": 0.1,
    "resendErrorRate": 0.1
  }
  ```
- **Response**:
  ```json
  {
    "message": "Hacker configuration updated"
  }
  ```

### Run Simulation Step
- **URL**: `POST /api/simulation/:id/run`
- **Description**: Executes a specific step in the simulation
- **Request Body**:
  ```json
  {
    "step": "measure"  // Can be "measure", "sift", or "complete"
  }
  ```
- **Response**:
  ```json
  {
    // Updated simulation state
  }
  ```

### Get Simulation State
- **URL**: `GET /api/simulation/:id`
- **Description**: Retrieves the current state of a simulation
- **Response**:
  ```json
  {
    // Current simulation state
  }
  ```

### Reset Simulation
- **URL**: `POST /api/simulation/:id/reset`
- **Description**: Resets a simulation to its initial state
- **Response**:
  ```json
  {
    // Reset simulation state
  }
  ```

## Data Models

### QuantumBit
```json
{
  "id": "alice-0",
  "value": 0,
  "basis": "rectilinear",
  "polarization": 0,
  "timestamp": 1234567890
}
```

### SimulationState
```json
{
  "aliceBits": [],
  "bobBits": [],
  "sharedKey": "",
  "interceptedBits": [],
  "errorRate": 0,
  "isHackerPresent": false,
  "phase": "preparation",
  "sessionId": "QKD-abc123",
  "startTime": 1234567890,
  "endTime": 0
}
```

### HackerConfig
```json
{
  "interceptionRate": 0.5,
  "measurementErrorRate": 0.1,
  "resendErrorRate": 0.1
}
```

## WebSocket Messages
The backend sends real-time updates via WebSocket with the following format:
```json
{
  "type": "simulationUpdate",
  "simulationId": "sim-1234567890",
  "state": {
    // Updated simulation state
  }
}
```