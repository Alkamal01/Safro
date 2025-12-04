use axum::{
    extract::State,
    response::IntoResponse,
    Json,
};
use crate::features::ussd::dto::*;
use crate::features::ussd::service::UssdService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn handle_ussd_webhook(
    State(state): State<AppState>,
    Json(dto): Json<UssdRequestDto>,
) -> Result<impl IntoResponse, AppError> {
    let service = UssdService::new(
        state.ussd_repo.clone(),
        state.clone(),
    );
    
    let response = service.handle_request(dto).await?;
    
    // Format response for Africa's Talking
    Ok(Json(response))
}

