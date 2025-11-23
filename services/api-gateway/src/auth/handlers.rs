use axum::{
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use chrono::{Duration, Utc};
use validator::Validate;

use super::models::*;
use crate::AppState;

const JWT_SECRET: &str = "your-secret-key-change-in-production"; // TODO: Load from env
const TOKEN_EXPIRY_HOURS: i64 = 24;

// Register new user
pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AuthError> {
    // Validate input
    payload.validate().map_err(|e| AuthError::ValidationError(e.to_string()))?;

    // Check if user already exists
    let existing_user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&payload.email)
    .fetch_optional(&state.db_pool)
    .await
    .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

    if existing_user.is_some() {
        return Err(AuthError::UserAlreadyExists);
    }

    // Hash password
    let password_hash = bcrypt::hash(&payload.password, bcrypt::DEFAULT_COST)
        .map_err(|e| AuthError::InternalError(e.to_string()))?;

    // Create user
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password_hash, auth_method, email_verified) 
         VALUES ($1, $2, 'email', false) 
         RETURNING *"
    )
    .bind(&payload.email)
    .bind(&password_hash)
    .fetch_one(&state.db_pool)
    .await
    .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

    // Generate JWT token
    let token = generate_token(&user)?;

    // Store session
    store_session(&state, &user.id, &token).await?;

    Ok(Json(AuthResponse {
        token,
        user: user_to_response(&user),
    }))
}

// Login user
pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AuthError> {
    // Validate input
    payload.validate().map_err(|e| AuthError::ValidationError(e.to_string()))?;

    // Find user
    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&payload.email)
    .fetch_optional(&state.db_pool)
    .await
    .map_err(|e| AuthError::DatabaseError(e.to_string()))?
    .ok_or(AuthError::InvalidCredentials)?;

    // Verify password
    let password_hash = user.password_hash.as_ref()
        .ok_or(AuthError::InvalidCredentials)?;
    
    let valid = bcrypt::verify(&payload.password, password_hash)
        .map_err(|e| AuthError::InternalError(e.to_string()))?;

    if !valid {
        return Err(AuthError::InvalidCredentials);
    }

    // Update last login
    sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
        .bind(&user.id)
        .execute(&state.db_pool)
        .await
        .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

    // Generate JWT token
    let token = generate_token(&user)?;

    // Store session
    store_session(&state, &user.id, &token).await?;

    Ok(Json(AuthResponse {
        token,
        user: user_to_response(&user),
    }))
}

// Get current user
pub async fn me(
    State(state): State<Arc<AppState>>,
    req: axum::extract::Request,
) -> Result<Json<UserResponse>, AuthError> {
    let user_id = req.extensions().get::<uuid::Uuid>()
        .ok_or(AuthError::Unauthorized)?;

    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(&state.db_pool)
    .await
    .map_err(|e| AuthError::DatabaseError(e.to_string()))?
    .ok_or(AuthError::Unauthorized)?;

    Ok(Json(user_to_response(&user)))
}

// Logout user
pub async fn logout(
    State(state): State<Arc<AppState>>,
    req: axum::extract::Request,
) -> Result<Json<serde_json::Value>, AuthError> {
    let user_id = req.extensions().get::<uuid::Uuid>()
        .ok_or(AuthError::Unauthorized)?;
    let token = req.extensions().get::<String>()
        .ok_or(AuthError::Unauthorized)?;

    let token_hash = hash_token(token);

    sqlx::query("DELETE FROM sessions WHERE user_id = $1 AND token_hash = $2")
        .bind(user_id)
        .bind(&token_hash)
        .execute(&state.db_pool)
        .await
        .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

    Ok(Json(serde_json::json!({ "success": true })))
}

// Helper functions
fn generate_token(user: &User) -> Result<String, AuthError> {
    let now = Utc::now();
    let exp = (now + Duration::hours(TOKEN_EXPIRY_HOURS)).timestamp() as usize;
    let iat = now.timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        exp,
        iat,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref()),
    )
    .map_err(|e| AuthError::InternalError(e.to_string()))
}

async fn store_session(state: &AppState, user_id: &uuid::Uuid, token: &str) -> Result<(), AuthError> {
    let token_hash = hash_token(token);
    let expires_at = Utc::now() + Duration::hours(TOKEN_EXPIRY_HOURS);

    sqlx::query(
        "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)"
    )
    .bind(user_id)
    .bind(&token_hash)
    .bind(&expires_at)
    .execute(&state.db_pool)
    .await
    .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

    Ok(())
}

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn user_to_response(user: &User) -> UserResponse {
    UserResponse {
        id: user.id,
        email: user.email.clone(),
        auth_method: user.auth_method.clone(),
        email_verified: user.email_verified,
        created_at: user.created_at,
    }
}

// Error handling
#[derive(Debug)]
pub enum AuthError {
    ValidationError(String),
    DatabaseError(String),
    InternalError(String),
    UserAlreadyExists,
    InvalidCredentials,
    Unauthorized,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AuthError::ValidationError(msg) => (StatusCode::BAD_REQUEST, msg),
            AuthError::DatabaseError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", msg)),
            AuthError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            AuthError::UserAlreadyExists => (StatusCode::CONFLICT, "User already exists".to_string()),
            AuthError::InvalidCredentials => (StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()),
            AuthError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
        };

        (status, Json(serde_json::json!({ "error": message }))).into_response()
    }
}
