use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UTXO {
    pub txid: String,
    pub vout: u32,
    pub amount_satoshis: u64,
    pub confirmations: u32,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Delivered,
    Released,
    Refunded,
    Disputed,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum Currency {
    BTC,
    CkBTC,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct EscrowRecord {
    pub escrow_id: String,
    pub creator_id: Principal,
    pub counterparty_id: Principal,
    pub amount_satoshis: u64,
    pub currency: Currency,
    pub deposit_address: String,
    pub utxos: Vec<UTXO>,
    pub status: EscrowStatus,
    pub time_lock_unix: Option<u64>,
    pub created_at: u64,
    pub updated_at: u64,
    pub ai_risk_score: Option<u8>,
    pub tags: Vec<String>,
    pub creator_confirmed_delivery: bool,
    pub counterparty_confirmed_delivery: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateEscrowParams {
    pub counterparty_id: Principal,
    pub amount_satoshis: u64,
    pub currency: Currency,
    pub time_lock_unix: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateEscrowResult {
    pub escrow_id: String,
    pub deposit_address: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum EscrowError {
    NotFound,
    Unauthorized,
    InvalidStatus,
    InsufficientFunds,
    TimeLockNotExpired,
    AlreadyConfirmed,
    InvalidAmount,
    InternalError(String),
}

pub type Result<T> = std::result::Result<T, EscrowError>;
