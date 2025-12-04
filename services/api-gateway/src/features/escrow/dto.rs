use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateEscrowDto {
    pub amount: u64, // Amount in smallest currency unit (e.g., kobo for NGN)
    pub currency: String, // "NGN", "USD", "BTC", "ckBTC"
    pub buyer_phone: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EscrowResponseDto {
    pub escrow_id: String,
    pub deal_code: String,
    pub amount: u64,
    pub currency: String,
    pub buyer_phone: String,
    pub status: String,
    pub trust_score: i32,
    pub trust_badge: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct FundEscrowDto {
    pub deal_code: String,
    pub payment_method: String, // "mobile_money", "bank", "crypto", "agent"
}

#[derive(Debug, Deserialize)]
pub struct ReleaseEscrowDto {
    pub deal_code: String,
    pub approval_pin: String,
}

#[derive(Debug, Serialize)]
pub struct EscrowStatusDto {
    pub escrow_id: String,
    pub deal_code: String,
    pub amount: u64,
    pub currency: String,
    pub status: String,
    pub seller_phone: Option<String>,
    pub buyer_phone: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub funded_at: Option<chrono::DateTime<chrono::Utc>>,
    pub released_at: Option<chrono::DateTime<chrono::Utc>>,
}

