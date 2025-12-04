use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct TrustScoreDto {
    pub user_id: Uuid,
    pub trust_score: i32,
    pub badge: String,
    pub completed_deals: i32,
    pub dispute_count: i32,
}

