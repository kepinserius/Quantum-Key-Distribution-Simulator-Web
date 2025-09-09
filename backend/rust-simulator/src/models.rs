use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumBit {
    pub id: String,
    pub value: u8, // 0 or 1
    pub basis: Basis,
    pub polarization: u16, // degrees (0, 45, 90, 135)
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Basis {
    Rectilinear, // +
    Diagonal,    // x
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationState {
    pub alice_bits: Vec<QuantumBit>,
    pub bob_bits: Vec<QuantumBit>,
    pub shared_key: String,
    pub intercepted_bits: Vec<QuantumBit>,
    pub error_rate: f64,
    pub is_hacker_present: bool,
    pub phase: Phase,
    pub session_id: String,
    pub start_time: u64,
    pub end_time: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Phase {
    Preparation,
    Transmission,
    Sifting,
    ErrorCheck,
    Complete,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HackerConfig {
    pub interception_rate: f64,    // 0.0 to 1.0
    pub measurement_error_rate: f64, // 0.0 to 1.0
    pub resend_error_rate: f64,      // 0.0 to 1.0
}

// Advanced noise models
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NoiseModel {
    pub detector_efficiency: f64,     // 0.0 to 1.0
    pub dark_count_rate: f64,         // Probability of dark counts
    pub polarization_drift: f64,      // Polarization drift over time
    pub loss_probability: f64,        // Photon loss probability
}