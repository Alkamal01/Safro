use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
pub struct ReputationSnapshot {
    pub id: Uuid,
    pub user_id: Uuid,
    pub completed_deals: i32,
    pub dispute_count: i32,
    pub avg_response_time_seconds: i32,
    pub trust_score: i32,
    pub badges: serde_json::Value,
    pub snapshot_at: DateTime<Utc>,
}

