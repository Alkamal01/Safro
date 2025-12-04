use uuid::Uuid;
use crate::features::reputation::repository::ReputationRepository;
use crate::features::reputation::dto::*;
use crate::shared::errors::AppError;

pub struct ReputationService {
    repo: ReputationRepository,
}

impl ReputationService {
    pub fn new(repo: ReputationRepository) -> Self {
        Self { repo }
    }

    pub async fn get_trust_score(&self, user_id: Uuid) -> Result<i32, AppError> {
        // Try to get latest snapshot
        if let Some(snapshot) = self.repo.get_latest_snapshot(user_id).await? {
            return Ok(snapshot.trust_score);
        }

        // Calculate fresh score
        self.calculate_trust_score(user_id).await
    }

    pub async fn calculate_trust_score(&self, user_id: Uuid) -> Result<i32, AppError> {
        let completed_deals = self.repo.get_completed_deals_count(user_id).await?;
        let dispute_count = self.repo.get_dispute_count(user_id).await?;

        // Simple scoring algorithm
        let base_score = 50;
        let deal_bonus = (completed_deals * 5).min(40); // Max 40 points from deals
        let dispute_penalty = (dispute_count * 10).min(30); // Max 30 point penalty

        let score = (base_score + deal_bonus - dispute_penalty).max(0).min(100);

        // Save snapshot
        self.repo.create_snapshot(user_id, completed_deals, dispute_count, score).await?;

        Ok(score)
    }

    pub async fn get_trust_badge(&self, score: i32) -> String {
        match score {
            90..=100 => "Trusted Seller".to_string(),
            80..=89 => "Reliable Trader".to_string(),
            70..=79 => "Good Standing".to_string(),
            60..=69 => "New User".to_string(),
            _ => "Building Reputation".to_string(),
        }
    }

    pub async fn update_reputation(&self, user_id: Uuid, event_type: &str) -> Result<(), AppError> {
        // Recalculate trust score after event
        self.calculate_trust_score(user_id).await?;
        Ok(())
    }

    pub async fn get_reputation_profile(&self, user_id: Uuid) -> Result<TrustScoreDto, AppError> {
        let score = self.get_trust_score(user_id).await?;
        let badge = self.get_trust_badge(score).await;
        let completed_deals = self.repo.get_completed_deals_count(user_id).await?;
        let dispute_count = self.repo.get_dispute_count(user_id).await?;

        Ok(TrustScoreDto {
            user_id,
            trust_score: score,
            badge,
            completed_deals,
            dispute_count,
        })
    }
}

