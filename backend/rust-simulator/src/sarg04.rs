use crate::models::{QuantumBit, SimulationState, HackerConfig, Basis, Phase, NoiseModel};
use uuid::Uuid;
use std::time::{SystemTime, UNIX_EPOCH};
use rayon::prelude::*;

pub struct SARG04Simulator {
    state: SimulationState,
    hacker_config: HackerConfig,
    noise_model: NoiseModel,
}

impl SARG04Simulator {
    pub fn new() -> Self {
        let session_id = format!("SARG04-{}", Uuid::new_v4().to_string());
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
            noise_model: NoiseModel::default(),
        }
    }

    // Configure noise model
    pub fn configure_noise(&mut self, noise_model: NoiseModel) {
        self.noise_model = noise_model;
    }

    // Generate random quantum bits for Alice using SARG04 encoding
    pub fn generate_alice_bits(&mut self, count: usize) -> Vec<QuantumBit> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        // Use parallel processing for large counts
        let bits: Vec<QuantumBit> = if count > 1000 {
            (0..count)
                .into_par_iter()
                .map(|i| {
                    let value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                    let basis = if rand::random::<f64>() < 0.5 { 
                        Basis::Rectilinear 
                    } else { 
                        Basis::Diagonal 
                    };

                    // In SARG04, the encoding is more complex:
                    // For rectilinear basis:
                    //   0 -> |0⟩ (0°)
                    //   1 -> |1⟩ (90°)
                    // For diagonal basis:
                    //   0 -> |+⟩ (45°)
                    //   1 -> |-⟩ (135°)
                    let polarization = match (&basis, value) {
                        (Basis::Rectilinear, 0) => 0,
                        (Basis::Rectilinear, 1) => 90,
                        (Basis::Diagonal, 0) => 45,
                        (Basis::Diagonal, 1) => 135,
                        _ => 0,
                    };

                    // Apply polarization drift based on time
                    let drifted_polarization = ((polarization as f64) + 
                        (self.noise_model.polarization_drift * (i as f64))).round() as u16 % 180;

                    QuantumBit {
                        id: format!("alice-{}", i),
                        value,
                        basis,
                        polarization: drifted_polarization,
                        timestamp: now + (i as u64) * 100,
                    }
                })
                .collect()
        } else {
            // Use sequential processing for smaller counts
            (0..count)
                .map(|i| {
                    let value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                    let basis = if rand::random::<f64>() < 0.5 { 
                        Basis::Rectilinear 
                    } else { 
                        Basis::Diagonal 
                    };

                    // In SARG04, the encoding is more complex:
                    // For rectilinear basis:
                    //   0 -> |0⟩ (0°)
                    //   1 -> |1⟩ (90°)
                    // For diagonal basis:
                    //   0 -> |+⟩ (45°)
                    //   1 -> |-⟩ (135°)
                    let polarization = match (&basis, value) {
                        (Basis::Rectilinear, 0) => 0,
                        (Basis::Rectilinear, 1) => 90,
                        (Basis::Diagonal, 0) => 45,
                        (Basis::Diagonal, 1) => 135,
                        _ => 0,
                    };

                    // Apply polarization drift based on time
                    let drifted_polarization = ((polarization as f64) + 
                        (self.noise_model.polarization_drift * (i as f64))).round() as u16 % 180;

                    QuantumBit {
                        id: format!("alice-{}", i),
                        value,
                        basis,
                        polarization: drifted_polarization,
                        timestamp: now + (i as u64) * 100,
                    }
                })
                .collect()
        };

        self.state.alice_bits = bits.clone();
        self.state.phase = Phase::Transmission;
        self.state.start_time = now;
        bits
    }

    // Bob measures the quantum bits with SARG04 protocol
    pub fn measure_bits(&mut self, hacker_present: bool) -> Vec<QuantumBit> {
        let alice_bits = self.state.alice_bits.clone();
        let hacker_config = self.hacker_config.clone();
        let noise_model = self.noise_model.clone();

        // Use parallel processing for large counts
        let (bob_bits, intercepted_bits): (Vec<_>, Vec<_>) = if alice_bits.len() > 1000 {
            alice_bits
                .par_iter()
                .enumerate()
                .map(|(index, alice_bit)| {
                    // Apply photon loss model
                    if rand::random::<f64>() < noise_model.loss_probability {
                        // Photon is lost, Bob gets no detection
                        return (
                            QuantumBit {
                                id: format!("bob-{}", index),
                                value: 0, // Random value for lost photon
                                basis: Basis::Rectilinear, // Random basis
                                polarization: 0,
                                timestamp: alice_bit.timestamp + 50,
                            },
                            None
                        );
                    }

                    // Apply dark count model
                    if rand::random::<f64>() < noise_model.dark_count_rate {
                        // Dark count event
                        let dark_basis = if rand::random::<f64>() < 0.5 { 
                            Basis::Rectilinear 
                        } else { 
                            Basis::Diagonal 
                        };
                        let dark_value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                        let dark_polarization = match (&dark_basis, dark_value) {
                            (Basis::Rectilinear, 0) => 0,
                            (Basis::Rectilinear, 1) => 90,
                            (Basis::Diagonal, 0) => 45,
                            (Basis::Diagonal, 1) => 135,
                            _ => 0,
                        };

                        return (
                            QuantumBit {
                                id: format!("bob-{}", index),
                                value: dark_value,
                                basis: dark_basis,
                                polarization: dark_polarization,
                                timestamp: alice_bit.timestamp + 50,
                            },
                            None
                        );
                    }

                    let mut measured_bit = alice_bit.clone();

                    // Hacker intercepts and resends (if present)
                    let mut intercepted = None;
                    if hacker_present && rand::random::<f64>() < hacker_config.interception_rate {
                        // Hacker's random basis choice
                        let hacker_basis = if rand::random::<f64>() < 0.5 { 
                            Basis::Rectilinear 
                        } else { 
                            Basis::Diagonal 
                        };

                        // Hacker's measurement (with possible error)
                        let hacker_value = if hacker_basis == alice_bit.basis {
                            // Correct basis - but still possible measurement error
                            if rand::random::<f64>() < hacker_config.measurement_error_rate {
                                if alice_bit.value == 0 { 1 } else { 0 }
                            } else {
                                alice_bit.value
                            }
                        } else {
                            // Wrong basis - 50% chance correct + measurement error
                            let random_value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                            if rand::random::<f64>() < hacker_config.measurement_error_rate {
                                if random_value == 0 { 1 } else { 0 }
                            } else {
                                random_value
                            }
                        };

                        intercepted = Some(QuantumBit {
                            id: format!("hacker-{}", index),
                            basis: hacker_basis.clone(),
                            value: hacker_value,
                            ..alice_bit.clone()
                        });

                        // Hacker resends new photon to Bob (with possible error)
                        let resend_value = if rand::random::<f64>() < hacker_config.resend_error_rate {
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

                    // Apply detector inefficiency
                    let mut bob_value = if rand::random::<f64>() > noise_model.detector_efficiency {
                        // Detector fails, random result
                        if rand::random::<f64>() < 0.5 { 0 } else { 1 }
                    } else if bob_basis == measured_bit.basis {
                        measured_bit.value
                    } else {
                        if rand::random::<f64>() < 0.5 { 0 } else { 1 }
                    };

                    // Apply measurement error
                    if rand::random::<f64>() < 0.01 { // 1% measurement error
                        bob_value = if bob_value == 0 { 1 } else { 0 };
                    }

                    let polarization = match (&bob_basis, bob_value) {
                        (Basis::Rectilinear, 0) => 0,
                        (Basis::Rectilinear, 1) => 90,
                        (Basis::Diagonal, 0) => 45,
                        (Basis::Diagonal, 1) => 135,
                        _ => 0,
                    };

                    let bob_bit = QuantumBit {
                        id: format!("bob-{}", index),
                        value: bob_value,
                        basis: bob_basis,
                        polarization,
                        timestamp: alice_bit.timestamp + 50,
                    };

                    (bob_bit, intercepted)
                })
                .collect()
        } else {
            // Use sequential processing for smaller counts
            alice_bits
                .into_iter()
                .enumerate()
                .map(|(index, alice_bit)| {
                    // Apply photon loss model
                    if rand::random::<f64>() < noise_model.loss_probability {
                        // Photon is lost, Bob gets no detection
                        return (
                            QuantumBit {
                                id: format!("bob-{}", index),
                                value: 0, // Random value for lost photon
                                basis: Basis::Rectilinear, // Random basis
                                polarization: 0,
                                timestamp: alice_bit.timestamp + 50,
                            },
                            None
                        );
                    }

                    // Apply dark count model
                    if rand::random::<f64>() < noise_model.dark_count_rate {
                        // Dark count event
                        let dark_basis = if rand::random::<f64>() < 0.5 { 
                            Basis::Rectilinear 
                        } else { 
                            Basis::Diagonal 
                        };
                        let dark_value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                        let dark_polarization = match (&dark_basis, dark_value) {
                            (Basis::Rectilinear, 0) => 0,
                            (Basis::Rectilinear, 1) => 90,
                            (Basis::Diagonal, 0) => 45,
                            (Basis::Diagonal, 1) => 135,
                            _ => 0,
                        };

                        return (
                            QuantumBit {
                                id: format!("bob-{}", index),
                                value: dark_value,
                                basis: dark_basis,
                                polarization: dark_polarization,
                                timestamp: alice_bit.timestamp + 50,
                            },
                            None
                        );
                    }

                    let mut measured_bit = alice_bit.clone();

                    // Hacker intercepts and resends (if present)
                    let mut intercepted = None;
                    if hacker_present && rand::random::<f64>() < hacker_config.interception_rate {
                        // Hacker's random basis choice
                        let hacker_basis = if rand::random::<f64>() < 0.5 { 
                            Basis::Rectilinear 
                        } else { 
                            Basis::Diagonal 
                        };

                        // Hacker's measurement (with possible error)
                        let hacker_value = if hacker_basis == alice_bit.basis {
                            // Correct basis - but still possible measurement error
                            if rand::random::<f64>() < hacker_config.measurement_error_rate {
                                if alice_bit.value == 0 { 1 } else { 0 }
                            } else {
                                alice_bit.value
                            }
                        } else {
                            // Wrong basis - 50% chance correct + measurement error
                            let random_value = if rand::random::<f64>() < 0.5 { 0 } else { 1 };
                            if rand::random::<f64>() < hacker_config.measurement_error_rate {
                                if random_value == 0 { 1 } else { 0 }
                            } else {
                                random_value
                            }
                        };

                        intercepted = Some(QuantumBit {
                            id: format!("hacker-{}", index),
                            basis: hacker_basis.clone(),
                            value: hacker_value,
                            ..alice_bit.clone()
                        });

                        // Hacker resends new photon to Bob (with possible error)
                        let resend_value = if rand::random::<f64>() < hacker_config.resend_error_rate {
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

                    // Apply detector inefficiency
                    let mut bob_value = if rand::random::<f64>() > noise_model.detector_efficiency {
                        // Detector fails, random result
                        if rand::random::<f64>() < 0.5 { 0 } else { 1 }
                    } else if bob_basis == measured_bit.basis {
                        measured_bit.value
                    } else {
                        if rand::random::<f64>() < 0.5 { 0 } else { 1 }
                    };

                    // Apply measurement error
                    if rand::random::<f64>() < 0.01 { // 1% measurement error
                        bob_value = if bob_value == 0 { 1 } else { 0 };
                    }

                    let polarization = match (&bob_basis, bob_value) {
                        (Basis::Rectilinear, 0) => 0,
                        (Basis::Rectilinear, 1) => 90,
                        (Basis::Diagonal, 0) => 45,
                        (Basis::Diagonal, 1) => 135,
                        _ => 0,
                    };

                    let bob_bit = QuantumBit {
                        id: format!("bob-{}", index),
                        value: bob_value,
                        basis: bob_basis,
                        polarization,
                        timestamp: alice_bit.timestamp + 50,
                    };

                    (bob_bit, intercepted)
                })
                .collect()
        };

        // Filter out None values for intercepted bits
        let intercepted_bits: Vec<QuantumBit> = intercepted_bits.into_iter().filter_map(|x| x).collect();

        self.state.bob_bits = bob_bits.clone();
        self.state.intercepted_bits = intercepted_bits;
        self.state.is_hacker_present = hacker_present;
        self.state.phase = Phase::Sifting;
        bob_bits
    }

    // Sift the key by comparing bases (SARG04 specific)
    pub fn sift_key(&mut self) -> String {
        let alice_bits = self.state.alice_bits.clone();
        let bob_bits = self.state.bob_bits.clone();

        // Use parallel processing for large counts
        let (sifted_bits, errors, total_comparisons): (Vec<String>, usize, usize) = if alice_bits.len() > 1000 {
            alice_bits
                .par_iter()
                .enumerate()
                .filter_map(|(index, alice_bit)| {
                    if let Some(bob_bit) = bob_bits.get(index) {
                        // In SARG04, key sifting is more complex
                        // Bob announces his basis, and Alice tells him if it's correct
                        // If correct, they keep the bit; if not, they discard it
                        if alice_bit.basis == bob_bit.basis {
                            let error = if alice_bit.value != bob_bit.value { 1 } else { 0 };
                            Some((alice_bit.value.to_string(), error, 1))
                        } else {
                            None
                        }
                        // In SARG04, even when bases don't match, 
                        // some information might be gained, but we discard these for security
                    } else {
                        None
                    }
                })
                .reduce(
                    || (Vec::new(), 0, 0),
                    |(mut acc_bits, acc_errors, acc_total), (bit, error, total)| {
                        let mut new_bits = acc_bits;
                        new_bits.push(bit);
                        (new_bits, acc_errors + error, acc_total + total)
                    },
                )
        } else {
            // Use sequential processing for smaller counts
            let mut sifted_bits = Vec::new();
            let mut errors = 0;
            let mut total_comparisons = 0;

            for (index, alice_bit) in alice_bits.iter().enumerate() {
                if let Some(bob_bit) = bob_bits.get(index) {
                    // In SARG04, key sifting is more complex
                    // Bob announces his basis, and Alice tells him if it's correct
                    // If correct, they keep the bit; if not, they discard it
                    if alice_bit.basis == bob_bit.basis {
                        sifted_bits.push(alice_bit.value.to_string());

                        // Count errors for error rate calculation
                        if alice_bit.value != bob_bit.value {
                            errors += 1;
                        }
                        total_comparisons += 1;
                    }
                    // In SARG04, even when bases don't match, 
                    // some information might be gained, but we discard these for security
                }
            }

            (sifted_bits, errors, total_comparisons)
        };

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
        let session_id = format!("SARG04-{}", Uuid::new_v4().to_string());
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