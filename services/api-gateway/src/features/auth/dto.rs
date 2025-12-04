use serde::{Deserialize, Serialize};
use validator::Validate;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// Request DTOs
#[derive(Debug, Deserialize, Validate)]
pub struct RegisterDto {
    #[validate(email(message = "Invalid email address"))]
    pub email: Option<String>,
    pub phone_number: String,
    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,
    pub approval_pin: String, // 4-6 digit PIN
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginDto {
    pub phone_or_email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyPhoneDto {
    pub phone_number: String,
    pub verification_code: String,
}

#[derive(Debug, Deserialize)]
pub struct SetApprovalPinDto {
    pub pin: String,
}

// Response DTOs
#[derive(Debug, Serialize)]
pub struct AuthResponseDto {
    pub token: String,
    pub user: UserDto,
}

#[derive(Debug, Serialize)]
pub struct UserDto {
    pub id: Uuid,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub auth_method: String,
    pub email_verified: bool,
    pub phone_verified: bool,
    pub kyc_level: i32,
    pub created_at: DateTime<Utc>,
}

// JWT Claims
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id
    pub email: Option<String>,
    pub phone: Option<String>,
    pub exp: usize,
    pub iat: usize,
}

