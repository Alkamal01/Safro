use uuid::Uuid;
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use sha2::{Digest, Sha256};
use crate::features::auth::repository::AuthRepository;
use crate::features::auth::dto::*;
use crate::features::auth::model::User;
use crate::shared::errors::AppError;
use crate::shared::utils::hash_pin;
use crate::shared::config::AppConfig;

pub struct AuthService {
    repo: AuthRepository,
    config: AppConfig,
}

impl AuthService {
    pub fn new(repo: AuthRepository, config: AppConfig) -> Self {
        Self { repo, config }
    }

    pub async fn register(&self, dto: RegisterDto) -> Result<AuthResponseDto, AppError> {
        // Validate PIN
        if dto.approval_pin.len() < 4 || dto.approval_pin.len() > 6 {
            return Err(AppError::Validation("PIN must be 4-6 digits".to_string()));
        }

        // Check if user exists
        if let Some(email) = &dto.email {
            if self.repo.find_by_email(email).await?.is_some() {
                return Err(AppError::BadRequest("Email already registered".to_string()));
            }
        }

        if self.repo.find_by_phone(&dto.phone_number).await?.is_some() {
            return Err(AppError::BadRequest("Phone number already registered".to_string()));
        }

        // Hash password
        let password_hash = bcrypt::hash(&dto.password, bcrypt::DEFAULT_COST)
            .map_err(|e| AppError::Internal(format!("Password hashing error: {}", e)))?;

        // Hash PIN
        let pin_hash = hash_pin(&dto.approval_pin);

        // Create user
        let user = self.repo.create_user(
            dto.email.as_deref(),
            &dto.phone_number,
            &password_hash,
            &pin_hash,
        ).await?;

        // Generate token
        let token = self.generate_token(&user)?;

        // Store session
        let expires_at = Utc::now() + Duration::hours(self.config.token_expiry_hours);
        let token_hash = self.hash_token(&token);
        self.repo.create_session(user.id, &token_hash, expires_at).await?;

        Ok(AuthResponseDto {
            token,
            user: self.user_to_dto(&user),
        })
    }

    pub async fn login(&self, dto: LoginDto) -> Result<AuthResponseDto, AppError> {
        // Try to find by email or phone
        let user = if dto.phone_or_email.contains('@') {
            self.repo.find_by_email(&dto.phone_or_email).await?
        } else {
            self.repo.find_by_phone(&dto.phone_or_email).await?
        }
        .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

        // Verify password
        let password_hash = user.password_hash.as_ref()
            .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

        let valid = bcrypt::verify(&dto.password, password_hash)
            .map_err(|e| AppError::Internal(format!("Password verification error: {}", e)))?;

        if !valid {
            return Err(AppError::Unauthorized("Invalid credentials".to_string()));
        }

        // Update last login
        self.repo.update_last_login(user.id).await?;

        // Generate token
        let token = self.generate_token(&user)?;

        // Store session
        let expires_at = Utc::now() + Duration::hours(self.config.token_expiry_hours);
        let token_hash = self.hash_token(&token);
        self.repo.create_session(user.id, &token_hash, expires_at).await?;

        Ok(AuthResponseDto {
            token,
            user: self.user_to_dto(&user),
        })
    }

    pub async fn verify_pin(&self, user_id: Uuid, pin: &str) -> Result<bool, AppError> {
        let user = self.repo.find_by_id(user_id).await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        let pin_hash = user.approval_pin_hash
            .ok_or_else(|| AppError::BadRequest("PIN not set".to_string()))?;

        let provided_hash = hash_pin(pin);
        Ok(pin_hash == provided_hash)
    }

    pub async fn get_user(&self, user_id: Uuid) -> Result<UserDto, AppError> {
        let user = self.repo.find_by_id(user_id).await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        Ok(self.user_to_dto(&user))
    }

    pub async fn logout(&self, user_id: Uuid, token: &str) -> Result<(), AppError> {
        let token_hash = self.hash_token(token);
        self.repo.delete_session(user_id, &token_hash).await?;
        Ok(())
    }

    fn generate_token(&self, user: &User) -> Result<String, AppError> {
        let now = Utc::now();
        let exp = (now + Duration::hours(self.config.token_expiry_hours)).timestamp() as usize;
        let iat = now.timestamp() as usize;

        let claims = Claims {
            sub: user.id.to_string(),
            email: user.email.clone(),
            phone: user.phone_number.clone(),
            exp,
            iat,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.config.jwt_secret.as_ref()),
        )
        .map_err(|e| AppError::Internal(format!("Token generation error: {}", e)))
    }

    fn hash_token(&self, token: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    fn user_to_dto(&self, user: &User) -> UserDto {
        UserDto {
            id: user.id,
            email: user.email.clone(),
            phone_number: user.phone_number.clone(),
            auth_method: user.auth_method.clone(),
            email_verified: user.email_verified,
            phone_verified: user.phone_verified,
            kyc_level: user.kyc_level,
            created_at: user.created_at,
        }
    }
}

