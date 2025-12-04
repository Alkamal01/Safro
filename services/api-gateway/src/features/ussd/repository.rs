use redis::Client as RedisClient;
use redis::AsyncCommands;
use serde_json;
use crate::features::ussd::model::UssdSession;
use crate::shared::errors::AppError;

pub struct UssdRepository {
    redis: RedisClient,
    ttl: u64,
}

impl UssdRepository {
    pub fn new(redis_url: &str, ttl: u64) -> Result<Self, AppError> {
        let client = RedisClient::open(redis_url)
            .map_err(|e| AppError::Internal(format!("Redis connection error: {}", e)))?;
        Ok(Self {
            redis: client,
            ttl,
        })
    }

    pub async fn get_session(&self, session_id: &str) -> Result<Option<UssdSession>, AppError> {
        let mut conn = self.redis.get_async_connection().await?;
        let key = format!("ussd:session:{}", session_id);
        
        let data: Option<String> = conn.get(&key).await?;
        
        if let Some(json) = data {
            let session: UssdSession = serde_json::from_str(&json)?;
            Ok(Some(session))
        } else {
            Ok(None)
        }
    }

    pub async fn save_session(&self, session: &UssdSession) -> Result<(), AppError> {
        let mut conn = self.redis.get_async_connection().await?;
        let key = format!("ussd:session:{}", session.session_id);
        let json = serde_json::to_string(session)?;
        
        conn.set_ex(&key, json, self.ttl).await?;
        Ok(())
    }

    pub async fn delete_session(&self, session_id: &str) -> Result<(), AppError> {
        let mut conn = self.redis.get_async_connection().await?;
        let key = format!("ussd:session:{}", session_id);
        conn.del(&key).await?;
        Ok(())
    }
}

