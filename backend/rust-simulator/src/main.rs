use qkd_simulator::{BB84Simulator, SARG04Simulator, HackerConfig};
use qkd_simulator::models::NoiseModel;
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::Filter;

#[tokio::main]
async fn main() {
    // Initialize simulators
    let bb84_simulator = Arc::new(Mutex::new(BB84Simulator::new()));
    let sarg04_simulator = Arc::new(Mutex::new(SARG04Simulator::new()));
    
    // CORS configuration
    let cors = warp::cors()
        .allow_any_origin()
        .allow_header("content-type")
        .allow_method("GET")
        .allow_method("POST")
        .allow_method("PUT")
        .allow_method("DELETE")
        .build();

    // BB84 Routes
    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_generate_route = warp::path("bb84")
        .and(warp::path("generate"))
        .and(warp::path::param::<usize>())
        .and(warp::post())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(generate_bits_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_measure_route = warp::path("bb84")
        .and(warp::path("measure"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(measure_bits_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_sift_route = warp::path("bb84")
        .and(warp::path("sift"))
        .and(warp::post())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(sift_key_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_complete_route = warp::path("bb84")
        .and(warp::path("complete"))
        .and(warp::post())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(complete_simulation_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_reset_route = warp::path("bb84")
        .and(warp::path("reset"))
        .and(warp::post())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(reset_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_configure_hacker_route = warp::path("bb84")
        .and(warp::path("configure-hacker"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(configure_hacker_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_configure_noise_route = warp::path("bb84")
        .and(warp::path("configure-noise"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(configure_noise_handler);

    let bb84_simulator_clone = bb84_simulator.clone();
    let bb84_state_route = warp::path("bb84")
        .and(warp::path("state"))
        .and(warp::get())
        .and(with_simulator(bb84_simulator_clone))
        .and_then(get_state_handler);

    // SARG04 Routes
    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_generate_route = warp::path("sarg04")
        .and(warp::path("generate"))
        .and(warp::path::param::<usize>())
        .and(warp::post())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_generate_bits_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_measure_route = warp::path("sarg04")
        .and(warp::path("measure"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_measure_bits_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_sift_route = warp::path("sarg04")
        .and(warp::path("sift"))
        .and(warp::post())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_sift_key_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_complete_route = warp::path("sarg04")
        .and(warp::path("complete"))
        .and(warp::post())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_complete_simulation_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_reset_route = warp::path("sarg04")
        .and(warp::path("reset"))
        .and(warp::post())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_reset_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_configure_hacker_route = warp::path("sarg04")
        .and(warp::path("configure-hacker"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_configure_hacker_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_configure_noise_route = warp::path("sarg04")
        .and(warp::path("configure-noise"))
        .and(warp::post())
        .and(warp::body::json())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_configure_noise_handler);

    let sarg04_simulator_clone = sarg04_simulator.clone();
    let sarg04_state_route = warp::path("sarg04")
        .and(warp::path("state"))
        .and(warp::get())
        .and(with_sarg04_simulator(sarg04_simulator_clone))
        .and_then(sarg04_get_state_handler);

    // Health check route
    let health_route = warp::path("health")
        .and(warp::get())
        .and_then(health_handler);

    // Combine routes
    let api = bb84_generate_route
        .or(bb84_measure_route)
        .or(bb84_sift_route)
        .or(bb84_complete_route)
        .or(bb84_reset_route)
        .or(bb84_configure_hacker_route)
        .or(bb84_configure_noise_route)
        .or(bb84_state_route)
        .or(sarg04_generate_route)
        .or(sarg04_measure_route)
        .or(sarg04_sift_route)
        .or(sarg04_complete_route)
        .or(sarg04_reset_route)
        .or(sarg04_configure_hacker_route)
        .or(sarg04_configure_noise_route)
        .or(sarg04_state_route)
        .or(health_route)
        .with(cors);

    // Start server
    println!("Starting QKD Simulator server on port 3030");
    warp::serve(api).run(([127, 0, 0, 1], 3030)).await;
}

// BB84 Handler functions
async fn generate_bits_handler(
    count: usize,
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.generate_alice_bits(count);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn measure_bits_handler(
    hacker_present: bool,
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.measure_bits(hacker_present);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sift_key_handler(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.sift_key();
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn complete_simulation_handler(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    let state = sim.complete_simulation();
    Ok(warp::reply::json(&state))
}

async fn reset_handler(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.reset();
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn configure_hacker_handler(
    config: HackerConfig,
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.configure_hacker(config);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn configure_noise_handler(
    noise_model: qkd_simulator::simulator::NoiseModel,
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.configure_noise(noise_model);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn get_state_handler(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let sim = simulator.lock().await;
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

// SARG04 Handler functions
async fn sarg04_generate_bits_handler(
    count: usize,
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.generate_alice_bits(count);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sarg04_measure_bits_handler(
    hacker_present: bool,
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.measure_bits(hacker_present);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sarg04_sift_key_handler(
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.sift_key();
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sarg04_complete_simulation_handler(
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    let state = sim.complete_simulation();
    Ok(warp::reply::json(&state))
}

async fn sarg04_reset_handler(
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.reset();
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sarg04_configure_hacker_handler(
    config: HackerConfig,
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.configure_hacker(config);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sarg04_configure_noise_handler(
    noise_model: qkd_simulator::simulator::NoiseModel,
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut sim = simulator.lock().await;
    sim.configure_noise(noise_model);
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn sarg04_get_state_handler(
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let sim = simulator.lock().await;
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

async fn health_handler() -> Result<impl warp::Reply, warp::Rejection> {
    Ok(warp::reply::json(&serde_json::json!({
        "status": "ok",
        "service": "qkd-simulator",
        "timestamp": std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    })))
}

// Helper functions to pass simulators to handlers
fn with_simulator(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> impl Filter<Extract = (Arc<Mutex<BB84Simulator>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || simulator.clone())
}

fn with_sarg04_simulator(
    simulator: Arc<Mutex<SARG04Simulator>>,
) -> impl Filter<Extract = (Arc<Mutex<SARG04Simulator>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || simulator.clone())
}