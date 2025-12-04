use axum::{
    extract::{Path, Request, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;
use crate::features::escrow::dto::*;
use crate::features::escrow::service::EscrowService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn create_escrow(
    State(state): State<AppState>,
    req: Request,
    Json(dto): Json<CreateEscrowDto>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let service = EscrowService::new(state.escrow_repo.clone(), state.clone());
    let response = service.create_escrow(*user_id, dto).await?;
    Ok(Json(response))
}

pub async fn fund_escrow(
    State(state): State<AppState>,
    Json(dto): Json<FundEscrowDto>,
) -> Result<impl IntoResponse, AppError> {
    let service = EscrowService::new(state.escrow_repo.clone(), state.clone());
    let response = service.fund_escrow(dto).await?;
    Ok(Json(response))
}

pub async fn release_escrow(
    State(state): State<AppState>,
    req: Request,
    Json(dto): Json<ReleaseEscrowDto>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let service = EscrowService::new(state.escrow_repo.clone(), state.clone());
    let response = service.release_escrow(*user_id, dto).await?;
    Ok(Json(response))
}

pub async fn get_escrow_status(
    State(state): State<AppState>,
    Path(deal_code): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let service = EscrowService::new(state.escrow_repo.clone(), state.clone());
    let response = service.get_escrow_status(&deal_code).await?;
    Ok(Json(response))
}

