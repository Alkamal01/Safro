use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
pub struct KycDocument {
    pub id: Uuid,
    pub user_id: Uuid,
    pub document_type: String,
    pub document_url: String,
    pub document_number: String,
    pub status: String,
    pub verified_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

