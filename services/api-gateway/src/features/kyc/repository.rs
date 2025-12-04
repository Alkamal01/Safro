use sqlx::PgPool;
use uuid::Uuid;
use crate::features::kyc::model::KycDocument;
use crate::shared::errors::AppError;

pub struct KycRepository {
    pool: PgPool,
}

impl KycRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_document(
        &self,
        user_id: Uuid,
        document_type: &str,
        document_url: &str,
        document_number: &str,
    ) -> Result<KycDocument, AppError> {
        let doc = sqlx::query_as::<_, KycDocument>(
            r#"
            INSERT INTO kyc_documents (user_id, document_type, document_url, document_number, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
            "#
        )
        .bind(user_id)
        .bind(document_type)
        .bind(document_url)
        .bind(document_number)
        .fetch_one(&self.pool)
        .await?;

        Ok(doc)
    }

    pub async fn update_user_kyc_status(
        &self,
        user_id: Uuid,
        kyc_level: i32,
        kyc_status: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE users SET kyc_level = $1, kyc_status = $2 WHERE id = $3"
        )
        .bind(kyc_level)
        .bind(kyc_status)
        .bind(user_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_user_kyc_level(&self, user_id: Uuid) -> Result<(i32, String), AppError> {
        let row = sqlx::query_as::<_, (i32, String)>(
            "SELECT kyc_level, kyc_status FROM users WHERE id = $1"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(row)
    }
}

