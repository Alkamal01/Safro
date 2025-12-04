use rand::Rng;

/// Generate a random 6-digit deal code
pub fn generate_deal_code() -> String {
    let mut rng = rand::thread_rng();
    format!("{:06}", rng.gen_range(100000..999999))
}

/// Format phone number to international format
pub fn normalize_phone(phone: &str) -> String {
    let cleaned = phone.replace(" ", "").replace("-", "").replace("+", "");
    
    // If starts with 0, replace with country code (assuming Nigeria +234)
    if cleaned.starts_with("0") {
        format!("+234{}", &cleaned[1..])
    } else if cleaned.starts_with("234") {
        format!("+{}", cleaned)
    } else if !cleaned.starts_with("+") {
        format!("+{}", cleaned)
    } else {
        phone.to_string()
    }
}

/// Hash a PIN (4-6 digits)
pub fn hash_pin(pin: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    format!("{:x}", hasher.finalize())
}

/// Format amount for display
pub fn format_amount(amount: u64, currency: &str) -> String {
    match currency {
        "NGN" | "NGN" => format!("₦{:.2}", amount as f64 / 100.0),
        "USD" => format!("${:.2}", amount as f64 / 100.0),
        _ => format!("{} {}", amount, currency),
    }
}

