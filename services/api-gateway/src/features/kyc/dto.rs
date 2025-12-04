use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct InitiateKycDto {
    pub full_name: String,
    pub date_of_birth: String,
    pub document_type: String, // "national_id", "passport", "drivers_license"
    pub document_number: String,
    pub document_url: String, // URL to uploaded document
}

#[derive(Debug, Serialize)]
pub struct KycStatusDto {
    pub user_id: Uuid,
    pub kyc_level: i32,
    pub kyc_status: String, // "pending", "verified", "rejected"
    pub verified_at: Option<chrono::DateTime<chrono::Utc>>,
}

