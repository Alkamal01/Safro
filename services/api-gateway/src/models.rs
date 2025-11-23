use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CreateEscrowRequest {
    pub counterparty_id: String,
    pub amount_satoshis: u64,
    pub currency: String,
    pub time_lock_unix: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct CreateEscrowResponse {
    pub escrow_id: String,
    pub deposit_address: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub email: Option<String>,
    pub bio: Option<String>,
}
