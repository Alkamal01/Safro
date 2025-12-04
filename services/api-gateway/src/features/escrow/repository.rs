use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::features::escrow::model::{Escrow, DealCode};
use crate::shared::errors::AppError;

pub struct EscrowRepository {
    pool: PgPool,
}

impl EscrowRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_escrow(
        &self,
        escrow_id: &str,
        creator_id: Uuid,
        amount_satoshis: i64,
        currency: &str,
        deposit_address: Option<&str>,
    ) -> Result<Escrow, AppError> {
        let escrow = sqlx::query_as::<_, Escrow>(
            r#"
            INSERT INTO escrow_transactions (escrow_id, creator_id, amount_satoshis, currency, deposit_address, status)
            VALUES ($1, $2, $3, $4, $5, 'CREATED')
            RETURNING *
            "#
        )
        .bind(escrow_id)
        .bind(creator_id)
        .bind(amount_satoshis)
        .bind(currency)
        .bind(deposit_address)
        .fetch_one(&self.pool)
        .await?;

        Ok(escrow)
    }

    pub async fn create_deal_code(
        &self,
        deal_code: &str,
        escrow_id: &str,
        seller_id: Uuid,
        buyer_phone: &str,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<DealCode, AppError> {
        let deal = sqlx::query_as::<_, DealCode>(
            r#"
            INSERT INTO deal_codes (deal_code, escrow_id, seller_id, buyer_phone, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#
        )
        .bind(deal_code)
        .bind(escrow_id)
        .bind(seller_id)
        .bind(buyer_phone)
        .bind(expires_at)
        .fetch_one(&self.pool)
        .await?;

        Ok(deal)
    }

    pub async fn find_by_deal_code(&self, deal_code: &str) -> Result<Option<DealCode>, AppError> {
        let deal = sqlx::query_as::<_, DealCode>(
            "SELECT * FROM deal_codes WHERE deal_code = $1 AND used = false"
        )
        .bind(deal_code)
        .fetch_optional(&self.pool)
        .await?;

        Ok(deal)
    }

    pub async fn find_escrow_by_id(&self, escrow_id: &str) -> Result<Option<Escrow>, AppError> {
        let escrow = sqlx::query_as::<_, Escrow>(
            "SELECT * FROM escrow_transactions WHERE escrow_id = $1"
        )
        .bind(escrow_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(escrow)
    }

    pub async fn update_escrow_status(
        &self,
        escrow_id: &str,
        status: &str,
    ) -> Result<(), AppError> {
        let mut query = sqlx::query("UPDATE escrow_transactions SET status = $1, updated_at = NOW() WHERE escrow_id = $2");

        if status == "FUNDED" {
            query = sqlx::query("UPDATE escrow_transactions SET status = $1, funded_at = NOW(), updated_at = NOW() WHERE escrow_id = $2");
        } else if status == "RELEASED" {
            query = sqlx::query("UPDATE escrow_transactions SET status = $1, released_at = NOW(), updated_at = NOW() WHERE escrow_id = $2");
        }

        query
            .bind(status)
            .bind(escrow_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn mark_deal_code_used(&self, deal_code: &str) -> Result<(), AppError> {
        sqlx::query("UPDATE deal_codes SET used = true WHERE deal_code = $1")
            .bind(deal_code)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}

