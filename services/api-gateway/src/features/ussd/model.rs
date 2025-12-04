use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct UssdSession {
    pub id: Uuid,
    pub session_id: String,
    pub phone_number: String,
    pub current_menu: String,
    pub step: i32,
    pub session_data: serde_json::Value, // Store collected data
    pub created_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
    pub completed: bool,
}

