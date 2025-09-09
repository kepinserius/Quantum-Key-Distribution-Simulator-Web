use qkd_simulator::{BB84Simulator, HackerConfig};
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::Filter;

#[tokio::main]
async fn main() {
    // Initialize simulator
    let simulator = Arc::new(Mutex::new(BB84Simulator::new()));
    
    // CORS configuration
    let cors = warp::cors()
        .allow_any_origin()
        .allow_header("content-type")
        .allow_method("GET")
        .allow_method("POST")
        .allow_method("PUT")
        .allow_method("DELETE")
        .build();

    // Routes
    let simulator_clone = simulator.clone();
    let generate_route = warp::path("generate")
        .and(warp::path::param::<usize>())
        .and(warp::post())
        .and(with_simulator(simulator_clone))
        .and_then(generate_bits_handler);

    let simulator_clone = simulator.clone();
    let measure_route = warp::path("measure")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_simulator(simulator_clone))
        .and_then(measure_bits_handler);

    let simulator_clone = simulator.clone();
    let sift_route = warp::path("sift")
        .and(warp::post())
        .and(with_simulator(simulator_clone))
        .and_then(sift_key_handler);

    let simulator_clone = simulator.clone();
    let complete_route = warp::path("complete")
        .and(warp::post())
        .and(with_simulator(simulator_clone))
        .and_then(complete_simulation_handler);

    let simulator_clone = simulator.clone();
    let reset_route = warp::path("reset")
        .and(warp::post())
        .and(with_simulator(simulator_clone))
        .and_then(reset_handler);

    let simulator_clone = simulator.clone();
    let configure_hacker_route = warp::path("configure-hacker")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_simulator(simulator_clone))
        .and_then(configure_hacker_handler);

    let simulator_clone = simulator.clone();
    let state_route = warp::path("state")
        .and(warp::get())
        .and(with_simulator(simulator_clone))
        .and_then(get_state_handler);

    // Combine routes
    let api = generate_route
        .or(measure_route)
        .or(sift_route)
        .or(complete_route)
        .or(reset_route)
        .or(configure_hacker_route)
        .or(state_route)
        .with(cors);

    // Start server
    println!("Starting QKD Simulator server on port 3030");
    warp::serve(api).run(([127, 0, 0, 1], 3030)).await;
}

// Handler functions
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

async fn get_state_handler(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let sim = simulator.lock().await;
    let state = sim.get_state();
    Ok(warp::reply::json(&state))
}

// Helper function to pass simulator to handlers
fn with_simulator(
    simulator: Arc<Mutex<BB84Simulator>>,
) -> impl Filter<Extract = (Arc<Mutex<BB84Simulator>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || simulator.clone())
}