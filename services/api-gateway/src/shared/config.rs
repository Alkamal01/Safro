use std::env;

#[derive(Clone)]
pub struct AppConfig {
    pub ic_host: String,
    pub database_url: String,
    pub redis_url: String,
    pub port: String,
    // Africa's Talking config
    pub africastalking_api_key: String,
    pub africastalking_username: String,
    pub africastalking_sms_sender_id: String,
    pub africastalking_ussd_short_code: String,
    // JWT config
    pub jwt_secret: String,
    pub token_expiry_hours: i64,
    // USSD config
    pub ussd_session_ttl: u64,
    pub deal_code_expiry_hours: i64,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            ic_host: env::var("IC_HOST").unwrap_or_else(|_| "http://localhost:4943".to_string()),
            database_url: env::var("DATABASE_URL")
                .expect("DATABASE_URL must be set"),
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string()),
            port: env::var("PORT").unwrap_or_else(|_| "3001".to_string()),
            africastalking_api_key: env::var("AFRICASTALKING_API_KEY")
                .unwrap_or_else(|_| "your_api_key_here".to_string()),
            africastalking_username: env::var("AFRICASTALKING_USERNAME")
                .unwrap_or_else(|_| "your_username_here".to_string()),
            africastalking_sms_sender_id: env::var("AFRICASTALKING_SMS_SENDER_ID")
                .unwrap_or_else(|_| "SAFRO".to_string()),
            africastalking_ussd_short_code: env::var("AFRICASTALKING_USSD_SHORT_CODE")
                .unwrap_or_else(|_| "*XYZ#".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string()),
            token_expiry_hours: env::var("TOKEN_EXPIRY_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse()
                .unwrap_or(24),
            ussd_session_ttl: env::var("USSD_SESSION_TTL")
                .unwrap_or_else(|_| "300".to_string())
                .parse()
                .unwrap_or(300),
            deal_code_expiry_hours: env::var("DEAL_CODE_EXPIRY_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse()
                .unwrap_or(24),
        }
    }
}

