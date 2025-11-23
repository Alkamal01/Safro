use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::sync::Arc;

use super::models::Claims;
use crate::AppState;

const JWT_SECRET: &str = "your-secret-key-change-in-production"; // TODO: Load from env

// Middleware to extract user from JWT token
pub async fn auth_middleware(
    State(_state): State<Arc<AppState>>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let token = auth_header
        .and_then(|auth| auth.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Parse user_id from claims
    let user_id = uuid::Uuid::parse_str(&token_data.claims.sub)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Clone token before inserting to avoid borrow issues
    let token_string = token.to_string();

    // Insert user_id and token into request extensions
    req.extensions_mut().insert(user_id);
    req.extensions_mut().insert(token_string);

    Ok(next.run(req).await)
}

