use crate::shared::errors::AppError;
use crate::shared::AppState;
use crate::shared::utils::normalize_phone;

pub struct NotificationService {
    state: AppState,
}

impl NotificationService {
    pub fn new(state: AppState) -> Self {
        Self { state }
    }

    pub async fn send_sms(&self, phone: &str, message: &str) -> Result<(), AppError> {
        let normalized_phone = normalize_phone(phone);
        
        // Africa's Talking SMS API
        let client = reqwest::Client::new();
        let url = "https://api.africastalking.com/version1/messaging";
        
        let response = client
            .post(url)
            .header("apiKey", &self.state.config.africastalking_api_key)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .form(&[
                ("username", self.state.config.africastalking_username.as_str()),
                ("to", &normalized_phone),
                ("message", message),
                ("from", &self.state.config.africastalking_sms_sender_id),
            ])
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            tracing::warn!("Failed to send SMS: {}", error_text);
            // Don't fail the request if SMS fails, just log it
        }

        Ok(())
    }

    pub async fn send_whatsapp(&self, phone: &str, message: &str) -> Result<(), AppError> {
        // Africa's Talking WhatsApp API (if available)
        // Similar implementation to SMS
        self.send_sms(phone, message).await
    }
}

