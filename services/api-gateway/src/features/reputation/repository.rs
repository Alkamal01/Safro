use sqlx::PgPool;
use uuid::Uuid;
use crate::features::reputation::model::ReputationSnapshot;
use crate::shared::errors::AppError;

pub struct ReputationRepository {
    pool: PgPool,
}

impl ReputationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get_latest_snapshot(&self, user_id: Uuid) -> Result<Option<ReputationSnapshot>, AppError> {
        let snapshot = sqlx::query_as::<_, ReputationSnapshot>(
            "SELECT * FROM reputation_snapshots WHERE user_id = $1 ORDER BY snapshot_at DESC LIMIT 1"
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(snapshot)
    }

    pub async fn create_snapshot(
        &self,
        user_id: Uuid,
        completed_deals: i32,
        dispute_count: i32,
        trust_score: i32,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO reputation_snapshots (user_id, completed_deals, dispute_count, trust_score, badges)
            VALUES ($1, $2, $3, $4, '[]'::jsonb)
            "#
        )
        .bind(user_id)
        .bind(completed_deals)
        .bind(dispute_count)
        .bind(trust_score)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_completed_deals_count(&self, user_id: Uuid) -> Result<i32, AppError> {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM escrow_transactions WHERE (creator_id = $1 OR counterparty_id = $1) AND status = 'RELEASED'"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(count.0 as i32)
    }

    pub async fn get_dispute_count(&self, user_id: Uuid) -> Result<i32, AppError> {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM escrow_transactions WHERE (creator_id = $1 OR counterparty_id = $1) AND status = 'DISPUTED'"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(count.0 as i32)
    }
}

