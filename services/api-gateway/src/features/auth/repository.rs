use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::features::auth::model::User;
use crate::shared::errors::AppError;

pub struct AuthRepository {
    pool: PgPool,
}

impl AuthRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_user(
        &self,
        email: Option<&str>,
        phone_number: &str,
        password_hash: &str,
        approval_pin_hash: &str,
    ) -> Result<User, AppError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (email, phone_number, password_hash, auth_method, email_verified, phone_verified, kyc_level, kyc_status, approval_pin_hash)
            VALUES ($1, $2, $3, 'phone', false, true, 0, 'pending', $4)
            RETURNING *
            "#
        )
        .bind(email)
        .bind(phone_number)
        .bind(password_hash)
        .bind(approval_pin_hash)
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email = $1"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_phone(&self, phone: &str) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE phone_number = $1"
        )
        .bind(phone)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn update_last_login(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
            .bind(user_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn create_session(
        &self,
        user_id: Uuid,
        token_hash: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)"
        )
        .bind(user_id)
        .bind(token_hash)
        .bind(expires_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn delete_session(&self, user_id: Uuid, token_hash: &str) -> Result<(), AppError> {
        sqlx::query("DELETE FROM sessions WHERE user_id = $1 AND token_hash = $2")
            .bind(user_id)
            .bind(token_hash)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}

