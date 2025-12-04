use axum::{
    extract::State,
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use sqlx::postgres::PgPoolOptions;
use redis::Client as RedisClient;

mod canister;
mod features;
mod shared;

use shared::{AppConfig, AppError, AppState};
use shared::auth_middleware;
use features::{
    auth::controller::{register, login, me, logout},
    kyc::controller::{initiate_kyc, get_kyc_status},
    escrow::controller::{create_escrow, fund_escrow, release_escrow, get_escrow_status},
    ussd::controller::handle_ussd_webhook,
    notification::controller::send_sms,
    reputation::controller::get_reputation,
    wallet::controller::get_balance,
};

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("api_gateway=debug,tower_http=debug")
        .init();

    // Load environment
    dotenv::dotenv().ok();
    let config = AppConfig::from_env();

    // Create database connection pool
    info!("Connecting to database...");
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");
    
    info!("Database connected successfully");

    // Create Redis client
    let redis_client = RedisClient::open(&config.redis_url)
        .expect("Failed to create Redis client");

    // Initialize repositories
    let auth_repo = Arc::new(features::auth::repository::AuthRepository::new(db_pool.clone()));
    let kyc_repo = Arc::new(features::kyc::repository::KycRepository::new(db_pool.clone()));
    let escrow_repo = Arc::new(features::escrow::repository::EscrowRepository::new(db_pool.clone()));
    let reputation_repo = Arc::new(features::reputation::repository::ReputationRepository::new(db_pool.clone()));
    let ussd_repo = Arc::new(features::ussd::repository::UssdRepository::new(&config.redis_url, config.ussd_session_ttl)
        .expect("Failed to create USSD repository"));

    let state = Arc::new(AppState {
        config: config.clone(),
        db_pool: db_pool.clone(),
        auth_repo: auth_repo.clone(),
        kyc_repo: kyc_repo.clone(),
        escrow_repo: escrow_repo.clone(),
        reputation_repo: reputation_repo.clone(),
        ussd_repo: ussd_repo.clone(),
    });

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        // Auth routes (public)
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        // Auth routes (protected)
        .route("/api/auth/me", get(me).route_layer(middleware::from_fn(auth_middleware)))
        .route("/api/auth/logout", post(logout).route_layer(middleware::from_fn(auth_middleware)))
        // KYC routes (protected)
        .route("/api/kyc/initiate", post(initiate_kyc).route_layer(middleware::from_fn(auth_middleware)))
        .route("/api/kyc/status", get(get_kyc_status).route_layer(middleware::from_fn(auth_middleware)))
        // Escrow routes (protected)
        .route("/api/escrow", post(create_escrow).route_layer(middleware::from_fn(auth_middleware)))
        .route("/api/escrow/fund", post(fund_escrow).route_layer(middleware::from_fn(auth_middleware)))
        .route("/api/escrow/release", post(release_escrow).route_layer(middleware::from_fn(auth_middleware)))
        .route("/api/escrow/status/:deal_code", get(get_escrow_status))
        // USSD routes (public - webhook from Africa's Talking)
        .route("/api/ussd/webhook", post(handle_ussd_webhook))
        // Notification routes (protected)
        .route("/api/notification/sms", post(send_sms).route_layer(middleware::from_fn(auth_middleware)))
        // Reputation routes
        .route("/api/reputation/:user_id", get(get_reputation))
        // Wallet routes (protected)
        .route("/api/wallet/balance", get(get_balance).route_layer(middleware::from_fn(auth_middleware)))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    let addr = format!("0.0.0.0:{}", config.port);
    info!("API Gateway listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "api-gateway"
    }))
}
