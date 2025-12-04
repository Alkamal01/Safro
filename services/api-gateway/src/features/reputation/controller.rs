use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;
use crate::features::reputation::dto::*;
use crate::features::reputation::service::ReputationService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn get_reputation(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let service = ReputationService::new(state.reputation_repo.clone());
    let profile = service.get_reputation_profile(user_id).await?;
    Ok(Json(profile))
}

