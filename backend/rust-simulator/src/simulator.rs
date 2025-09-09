use crate::models::{QuantumBit, SimulationState, HackerConfig, Basis, Phase};
use uuid::Uuid;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct BB84Simulator {
    state: SimulationState,
    hacker_config: HackerConfig,
}

impl BB84Simulator {
    pub fn new() -> Self {
        let session_id = format!("QKD-{}", Uuid::new_v4().to_string());
        let start_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        Self {
            state: SimulationState {
                alice_bits: Vec::new(),
                bob_bits: Vec::new(),
                shared_key: String::new(),
                intercepted_bits: Vec::new(),
                error_rate: 0.0,
                is_hacker_present: false,
                phase: Phase::Preparation,
                session_id,
                start_time,
                end_time: 0,
            },
            hacker_config: HackerConfig {
                interception_rate: 0.5,
                measurement_error_rate: 0.1,
                resend_error_rate: 0.1,
            },
        }
    }

    // Generate random quantum bits for Alice
    pub fn generate_alice_bits(&mut self, count: usize) -> Vec<QuantumBit> {
        let mut bits: Vec<QuantumBit> = Vec::new();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        for i in 0..count {
            let value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
            let basis = if rand::random::<f64>() < 0.5 { 
                Basis::Rectilinear 
            } else { 
                Basis::Diagonal 
            };

            // Map bit value and basis to polarization
            let polarization = match (&basis, value) {
                (Basis::Rectilinear, 0) => 0,
                (Basis::Rectilinear, 1) => 90,
                (Basis::Diagonal, 0) => 45,
                (Basis::Diagonal, 1) => 135,
                _ => 0,
            };

            bits.push(QuantumBit {
                id: format!("alice-{}", i),
                value,
                basis,
                polarization,
                timestamp: now + (i as u64) * 100,
            });
        }

        self.state.alice_bits = bits.clone();
        self.state.phase = Phase::Transmission;
        self.state.start_time = now;
        bits
    }

    // Bob measures the quantum bits with random bases
    pub fn measure_bits(&mut self, hacker_present: bool) -> Vec<QuantumBit> {
        let mut bob_bits: Vec<QuantumBit> = Vec::new();
        let mut intercepted_bits: Vec<QuantumBit> = Vec::new();
        let alice_bits = self.state.alice_bits.clone();

        for (index, alice_bit) in alice_bits.iter().enumerate() {
            let mut measured_bit = alice_bit.clone();

            // Hacker intercepts and resends (if present)
            if hacker_present && rand::random::<f64>() < self.hacker_config.interception_rate {
                // Hacker's random basis choice
                let hacker_basis = if rand::random::<f64>() < 0.5 { 
                    Basis::Rectilinear 
                } else { 
                    Basis::Diagonal 
                };

                // Hacker's measurement (with possible error)
                let hacker_value = if hacker_basis == alice_bit.basis {
                    // Correct basis - but still possible measurement error
                    if rand::random::<f64>() < self.hacker_config.measurement_error_rate {
                        if alice_bit.value == 0 { 1 } else { 0 }
                    } else {
                        alice_bit.value
                    }
                } else {
                    // Wrong basis - 50% chance correct + measurement error
                    let random_value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                    if rand::random::<f64>() < self.hacker_config.measurement_error_rate {
                        if random_value == 0 { 1 } else { 0 }
                    } else {
                        random_value
                    }
                };

                intercepted_bits.push(QuantumBit {
                    id: format!("hacker-{}", index),
                    basis: hacker_basis.clone(),
                    value: hacker_value,
                    ..alice_bit.clone()
                });

                // Hacker resends new photon to Bob (with possible error)
                let resend_value = if rand::random::<f64>() < self.hacker_config.resend_error_rate {
                    // Resend error - randomize the bit
                    if rand::random::<f64>() < 0.5 { 0 } else { 1 }
                } else {
                    // Correct resend
                    hacker_value
                };

                // Create new photon with hacker's basis
                let polarization = match (&hacker_basis, resend_value) {
                    (Basis::Rectilinear, 0) => 0,
                    (Basis::Rectilinear, 1) => 90,
                    (Basis::Diagonal, 0) => 45,
                    (Basis::Diagonal, 1) => 135,
                    _ => 0,
                };

                measured_bit = QuantumBit {
                    id: format!("alice-{}", index),
                    value: resend_value,
                    basis: hacker_basis,
                    polarization,
                    timestamp: alice_bit.timestamp,
                };
            }

            // Bob's random basis choice
            let bob_basis = if rand::random::<f64>() < 0.5 { 
                Basis::Rectilinear 
            } else { 
                Basis::Diagonal 
            };

            // If Bob uses the same basis as the incoming photon, he gets the correct value
            // If different basis, 50% chance of correct measurement
            let bob_value = if bob_basis == measured_bit.basis {
                measured_bit.value
            } else {
                if rand::random::<f64>() < 0.5 { 0 } else { 1 }
            };

            let polarization = match (&bob_basis, bob_value) {
                (Basis::Rectilinear, 0) => 0,
                (Basis::Rectilinear, 1) => 90,
                (Basis::Diagonal, 0) => 45,
                (Basis::Diagonal, 1) => 135,
                _ => 0,
            };

            bob_bits.push(QuantumBit {
                id: format!("bob-{}", index),
                value: bob_value,
                basis: bob_basis,
                polarization,
                timestamp: alice_bit.timestamp + 50,
            });
        }

        self.state.bob_bits = bob_bits.clone();
        self.state.intercepted_bits = intercepted_bits;
        self.state.is_hacker_present = hacker_present;
        self.state.phase = Phase::Sifting;
        bob_bits
    }

    // Sift the key by comparing bases
    pub fn sift_key(&mut self) -> String {
        let mut sifted_bits: Vec<String> = Vec::new();
        let mut errors = 0;
        let mut total_comparisons = 0;

        for (index, alice_bit) in self.state.alice_bits.iter().enumerate() {
            if let Some(bob_bit) = self.state.bob_bits.get(index) {
                if alice_bit.basis == bob_bit.basis {
                    sifted_bits.push(alice_bit.value.to_string());

                    // Count errors for error rate calculation
                    if alice_bit.value != bob_bit.value {
                        errors += 1;
                    }
                    total_comparisons += 1;
                }
            }
        }

        self.state.error_rate = if total_comparisons > 0 {
            (errors as f64 / total_comparisons as f64) * 100.0
        } else {
            0.0
        };

        self.state.shared_key = sifted_bits.join("");
        self.state.phase = Phase::ErrorCheck;
        self.state.shared_key.clone()
    }

    // Complete the simulation
    pub fn complete_simulation(&mut self) -> SimulationState {
        let end_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
        
        self.state.phase = Phase::Complete;
        self.state.end_time = end_time;
        self.state.clone()
    }

    // Reset simulation
    pub fn reset(&mut self) {
        let session_id = format!("QKD-{}", Uuid::new_v4().to_string());
        let start_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        self.state = SimulationState {
            alice_bits: Vec::new(),
            bob_bits: Vec::new(),
            shared_key: String::new(),
            intercepted_bits: Vec::new(),
            error_rate: 0.0,
            is_hacker_present: false,
            phase: Phase::Preparation,
            session_id,
            start_time,
            end_time: 0,
        };
    }

    // Configure hacker parameters
    pub fn configure_hacker(&mut self, config: HackerConfig) {
        self.hacker_config = config;
    }

    // Get current state
    pub fn get_state(&self) -> SimulationState {
        self.state.clone()
    }
}