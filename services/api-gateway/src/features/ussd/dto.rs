use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct UssdRequestDto {
    pub session_id: String,
    pub phone_number: String,
    pub service_code: String,
    pub text: String, // User input (menu selections)
}

#[derive(Debug, Serialize)]
pub struct UssdResponseDto {
    #[serde(rename = "USSD_BODY")]
    pub message: String,
    #[serde(rename = "ACTION")]
    pub action: String, // "CON" for continue, "END" for end session
}

