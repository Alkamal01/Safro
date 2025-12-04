use axum::{
    extract::{Request, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;
use crate::features::auth::dto::*;
use crate::features::auth::service::AuthService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn register(
    State(state): State<AppState>,
    Json(dto): Json<RegisterDto>,
) -> Result<impl IntoResponse, AppError> {
    let service = AuthService::new(
        state.auth_repo.clone(),
        state.config.clone(),
    );
    
    let response = service.register(dto).await?;
    Ok(Json(response))
}

pub async fn login(
    State(state): State<AppState>,
    Json(dto): Json<LoginDto>,
) -> Result<impl IntoResponse, AppError> {
    let service = AuthService::new(
        state.auth_repo.clone(),
        state.config.clone(),
    );
    
    let response = service.login(dto).await?;
    Ok(Json(response))
}

pub async fn me(
    State(state): State<AppState>,
    req: Request,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let service = AuthService::new(
        state.auth_repo.clone(),
        state.config.clone(),
    );
    
    let user = service.get_user(*user_id).await?;
    Ok(Json(user))
}

pub async fn logout(
    State(state): State<AppState>,
    req: Request,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;
    
    let token = req.extensions()
        .get::<String>()
        .ok_or_else(|| AppError::Unauthorized("Token not found".to_string()))?;

    let service = AuthService::new(
        state.auth_repo.clone(),
        state.config.clone(),
    );
    
    service.logout(*user_id, token).await?;
    Ok(Json(serde_json::json!({ "success": true })))
}

