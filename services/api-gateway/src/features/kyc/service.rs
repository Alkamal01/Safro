use uuid::Uuid;
use crate::features::kyc::repository::KycRepository;
use crate::features::kyc::dto::*;
use crate::shared::errors::AppError;

pub struct KycService {
    repo: KycRepository,
}

impl KycService {
    pub fn new(repo: KycRepository) -> Self {
        Self { repo }
    }

    pub async fn initiate_kyc(
        &self,
        user_id: Uuid,
        dto: InitiateKycDto,
    ) -> Result<KycStatusDto, AppError> {
        // Create KYC document record
        self.repo.create_document(
            user_id,
            &dto.document_type,
            &dto.document_url,
            &dto.document_number,
        ).await?;

        // Update user KYC status to pending
        self.repo.update_user_kyc_status(user_id, 1, "pending").await?;

        Ok(KycStatusDto {
            user_id,
            kyc_level: 1,
            kyc_status: "pending".to_string(),
            verified_at: None,
        })
    }

    pub async fn get_kyc_status(&self, user_id: Uuid) -> Result<KycStatusDto, AppError> {
        let (kyc_level, kyc_status) = self.repo.get_user_kyc_level(user_id).await?;

        Ok(KycStatusDto {
            user_id,
            kyc_level,
            kyc_status,
            verified_at: None, // TODO: Add verified_at to users table if needed
        })
    }

    // Admin function to verify KYC
    pub async fn verify_kyc(&self, user_id: Uuid, approved: bool) -> Result<(), AppError> {
        if approved {
            self.repo.update_user_kyc_status(user_id, 2, "verified").await?;
        } else {
            self.repo.update_user_kyc_status(user_id, 0, "rejected").await?;
        }
        Ok(())
    }
}

