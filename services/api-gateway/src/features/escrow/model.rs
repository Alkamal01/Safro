use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize)]
pub struct Escrow {
    pub id: Uuid,
    pub escrow_id: String,
    pub creator_id: Uuid,
    pub counterparty_id: Option<Uuid>,
    pub amount_satoshis: i64,
    pub currency: String,
    pub deposit_address: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub funded_at: Option<DateTime<Utc>>,
    pub released_at: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow)]
pub struct DealCode {
    pub id: Uuid,
    pub deal_code: String,
    pub escrow_id: String,
    pub seller_id: Uuid,
    pub buyer_phone: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub used: bool,
}

