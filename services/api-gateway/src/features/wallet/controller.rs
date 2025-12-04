use axum::{
    extract::{Request, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;
use crate::features::wallet::dto::*;
use crate::features::wallet::service::WalletService;
use crate::shared::errors::AppError;
use crate::shared::AppState;

pub async fn get_balance(
    State(_state): State<AppState>,
    req: Request,
) -> Result<impl IntoResponse, AppError> {
    let user_id = req.extensions()
        .get::<Uuid>()
        .ok_or_else(|| AppError::Unauthorized("Not authenticated".to_string()))?;

    let service = WalletService;
    let balance = service.get_balance(*user_id).await?;
    Ok(Json(balance))
}

