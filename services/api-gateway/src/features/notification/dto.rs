use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct SendSmsDto {
    pub phone_number: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct NotificationResponseDto {
    pub success: bool,
    pub message_id: Option<String>,
}

