use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub password_hash: Option<String>,
    pub principal_id: Option<String>,
    pub auth_method: String,
    pub email_verified: bool,
    pub phone_verified: bool,
    pub kyc_level: i32,
    pub kyc_status: String,
    pub approval_pin_hash: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_hash: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

