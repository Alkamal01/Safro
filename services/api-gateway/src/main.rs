use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use sqlx::postgres::PgPoolOptions;

mod canister;
mod models;
mod auth;

use models::*;

#[derive(Clone)]
struct AppState {
    ic_host: String,
    db_pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("api_gateway=debug,tower_http=debug")
        .init();

    // Load environment
    dotenv::dotenv().ok();
    let ic_host = std::env::var("IC_HOST").unwrap_or_else(|_| "http://localhost:4943".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // Create database connection pool
    info!("Connecting to database...");
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");
    
    info!("Database connected successfully");

    let state = Arc::new(AppState { ic_host, db_pool });

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        // Auth routes
        .route("/api/auth/register", post(auth::register))
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/logout", post(auth::logout))
        .route("/api/auth/me", get(auth::me))
        // Escrow routes
        .route("/api/escrow", post(create_escrow))
        .route("/api/escrow/:id", get(get_escrow))
        .route("/api/escrow/:id/confirm", post(confirm_delivery))
        .route("/api/escrow/:id/release", post(release_escrow))
        // Wallet routes
        .route("/api/wallet/balance", get(get_balance))
        .route("/api/wallet/transactions", get(get_transactions))
        // Reputation routes
        .route("/api/reputation/:id", get(get_reputation))
        // Profile routes
        .route("/api/profile", get(get_profile))
        .route("/api/profile", post(update_profile))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    let addr = format!("0.0.0.0:{}", port);
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

async fn create_escrow(
    State(_state): State<Arc<AppState>>,
    Json(payload): Json<CreateEscrowRequest>,
) -> Result<Json<CreateEscrowResponse>, AppError> {
    info!("Creating escrow: {:?}", payload);
    
    // TODO: Call escrow canister
    // For now, return mock response
    Ok(Json(CreateEscrowResponse {
        escrow_id: format!("ESC-{}", uuid::Uuid::new_v4().to_string().split('-').next().unwrap().to_uppercase()),
        deposit_address: format!("tb1q{}", uuid::Uuid::new_v4().to_string().replace("-", "")),
    }))
}

async fn get_escrow(
    State(_state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Getting escrow: {}", id);
    
    // TODO: Call escrow canister
    Ok(Json(serde_json::json!({
        "escrow_id": id,
        "status": "FUNDED"
    })))
}

async fn confirm_delivery(
    State(_state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Confirming delivery for escrow: {}", id);
    
    // TODO: Call escrow canister
    Ok(Json(serde_json::json!({
        "success": true
    })))
}

async fn release_escrow(
    State(_state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Releasing escrow: {}", id);
    
    // TODO: Call escrow canister
    Ok(Json(serde_json::json!({
        "success": true
    })))
}

async fn get_balance(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Getting wallet balance");
    
    // TODO: Call wallet canister
    Ok(Json(serde_json::json!({
        "btc_balance": 0,
        "ckbtc_balance": 0
    })))
}

async fn get_transactions(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Getting transactions");
    
    // TODO: Call wallet canister
    Ok(Json(serde_json::json!({
        "transactions": []
    })))
}

async fn get_reputation(
    State(_state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Getting reputation for: {}", id);
    
    // TODO: Call reputation canister
    Ok(Json(serde_json::json!({
        "trust_score": 0,
        "completed_deals": 0
    })))
}

async fn get_profile(
    State(_state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Getting profile");
    
    // TODO: Call identity canister
    Ok(Json(serde_json::json!({
        "username": null
    })))
}

async fn update_profile(
    State(_state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    info!("Updating profile: {:?}", payload);
    
    // TODO: Call identity canister
    Ok(Json(serde_json::json!({
        "success": true
    })))
}

// Error handling
struct AppError(String);

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: std::error::Error,
{
    fn from(err: E) -> Self {
        AppError(err.to_string())
    }
}
