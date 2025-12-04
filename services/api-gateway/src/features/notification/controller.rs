use axum::{
    extract::State,
    response::IntoResponse,
    Json,
};
use crate::features::notification::dto::*;
use crate::features::notification::service::NotificationService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn send_sms(
    State(state): State<AppState>,
    Json(dto): Json<SendSmsDto>,
) -> Result<impl IntoResponse, AppError> {
    let service = NotificationService::new(state);
    service.send_sms(&dto.phone_number, &dto.message).await?;
    
    Ok(Json(NotificationResponseDto {
        success: true,
        message_id: None,
    }))
}

