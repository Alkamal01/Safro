use axum::{
    extract::{Request, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;
use crate::features::kyc::dto::*;
use crate::features::kyc::service::KycService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn initiate_kyc(
    State(state): State<AppState>,
    req: Request,
    Json(dto): Json<InitiateKycDto>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let service = KycService::new(state.kyc_repo.clone());
    let response = service.initiate_kyc(*user_id, dto).await?;
    Ok(Json(response))
}

pub async fn get_kyc_status(
    State(state): State<AppState>,
    req: Request,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let service = KycService::new(state.kyc_repo.clone());
    let response = service.get_kyc_status(*user_id).await?;
    Ok(Json(response))
}

