const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Store active simulations
const simulations = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Handle WebSocket messages if needed
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Broadcast to all connected WebSocket clients
const broadcast = (data) => {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Helper function to send updates to clients
const sendUpdate = (simulationId, state) => {
  broadcast({
    type: 'simulationUpdate',
    simulationId,
    state
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'QKD Simulator Backend API' });
});

// Start simulation
app.post('/api/simulation/start', async (req, res) => {
  try {
    const { bitCount = 50, hackerMode = false, hackerConfig = {} } = req.body;
    
    // Create simulation ID
    const simulationId = `sim-${Date.now()}`;
    
    // Initialize simulation in Rust service
    const response = await axios.post('http://localhost:3030/generate', bitCount);
    
    // Store simulation
    simulations.set(simulationId, {
      id: simulationId,
      state: response.data,
      hackerMode
    });
    
    // Send update to clients
    sendUpdate(simulationId, response.data);
    
    res.json({
      simulationId,
      state: response.data
    });
  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({ error: 'Failed to start simulation' });
  }
});

// Configure hacker settings
app.post('/api/simulation/:id/configure-hacker', async (req, res) => {
  try {
    const { id } = req.params;
    const hackerConfig = req.body;
    
    if (!simulations.has(id)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    // Configure hacker in Rust service
    await axios.post('http://localhost:3030/configure-hacker', hackerConfig);
    
    res.json({ message: 'Hacker configuration updated' });
  } catch (error) {
    console.error('Error configuring hacker:', error);
    res.status(500).json({ error: 'Failed to configure hacker' });
  }
});

// Run simulation step
app.post('/api/simulation/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const { step } = req.body;
    
    if (!simulations.has(id)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    const simulation = simulations.get(id);
    let response;
    
    switch (step) {
      case 'measure':
        response = await axios.post('http://localhost:3030/measure', simulation.hackerMode);
        break;
      case 'sift':
        response = await axios.post('http://localhost:3030/sift');
        break;
      case 'complete':
        response = await axios.post('http://localhost:3030/complete');
        break;
      default:
        return res.status(400).json({ error: 'Invalid step' });
    }
    
    // Update simulation state
    simulation.state = response.data;
    simulations.set(id, simulation);
    
    // Send update to clients
    sendUpdate(id, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error running simulation step:', error);
    res.status(500).json({ error: 'Failed to run simulation step' });
  }
});

// Get simulation state
app.get('/api/simulation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!simulations.has(id)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    // Get state from Rust service
    const response = await axios.get('http://localhost:3030/state');
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting simulation state:', error);
    res.status(500).json({ error: 'Failed to get simulation state' });
  }
});

// Reset simulation
app.post('/api/simulation/:id/reset', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!simulations.has(id)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    // Reset in Rust service
    const response = await axios.post('http://localhost:3030/reset');
    
    // Update simulation state
    const simulation = simulations.get(id);
    simulation.state = response.data;
    simulations.set(id, simulation);
    
    // Send update to clients
    sendUpdate(id, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error resetting simulation:', error);
    res.status(500).json({ error: 'Failed to reset simulation' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`QKD Simulator backend running on port ${PORT}`);
  console.log(`WebSocket server running on port ${PORT}`);
});