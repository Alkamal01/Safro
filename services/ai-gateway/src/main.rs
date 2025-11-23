use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

#[derive(Clone)]
struct AppState {
    openai_api_key: Option<String>,
    ic_host: String,
}

#[derive(Debug, Deserialize)]
struct RiskAssessmentRequest {
    escrow_id: String,
    user_id: String,
    counterparty_id: String,
    amount_satoshis: u64,
    user_trust_score: Option<u8>,
    counterparty_trust_score: Option<u8>,
}

#[derive(Debug, Serialize)]
struct RiskAssessmentResponse {
    escrow_id: String,
    risk_score: u8,
    risk_level: String,
    reasons: Vec<String>,
    recommended_action: String,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("ai_gateway=debug,tower_http=debug")
        .init();

    // Load environment
    dotenv::dotenv().ok();
    let openai_api_key = std::env::var("OPENAI_API_KEY").ok();
    let ic_host = std::env::var("IC_HOST").unwrap_or_else(|_| "http://localhost:4943".to_string());
    let port = std::env::var("AI_GATEWAY_PORT").unwrap_or_else(|_| "3002".to_string());

    if openai_api_key.is_none() {
        tracing::warn!("OPENAI_API_KEY not set, will return mock risk assessments");
    }

    let state = Arc::new(AppState {
        openai_api_key,        ic_host,
    });

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/assess-risk", post(assess_risk))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    let addr = format!("0.0.0.0:{}", port);
    info!("AI Gateway listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "ai-gateway"
    }))
}

async fn assess_risk(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RiskAssessmentRequest>,
) -> Result<Json<RiskAssessmentResponse>, AppError> {
    info!("Assessing risk for escrow: {}", payload.escrow_id);

    // If we have an OpenAI API key, use it
    let (risk_score, reasons, action) = if let Some(api_key) = &state.openai_api_key {
        analyze_with_ai(&api_key, &payload).await?
    } else {
        // Mock risk assessment
        let score = calculate_mock_risk(&payload);
        let reasons = vec![
            "User trust score evaluation".to_string(),
            "Transaction amount analysis".to_string(),
        ];
        let action = if score < 30 {
            "APPROVE"
        } else if score < 70 {
            "REVIEW"
        } else {
            "REJECT"
        };
        (score, reasons, action.to_string())
    };

    let risk_level = match risk_score {
        0..=30 => "LOW",
        31..=70 => "MEDIUM",
        _ => "HIGH",
    }.to_string();

    let response = RiskAssessmentResponse {
        escrow_id: payload.escrow_id.clone(),
        risk_score,
        risk_level,
        reasons,
        recommended_action: action,
    };

    // TODO: Store result in AI Orchestration canister

    Ok(Json(response))
}

async fn analyze_with_ai(
    api_key: &str,
    payload: &RiskAssessmentRequest,
) -> Result<(u8, Vec<String>, String), AppError> {
    let client = reqwest::Client::new();

    let prompt = format!(
        "Analyze this Bitcoin escrow transaction for fraud risk:\n\
        Amount: {} satoshis\n\
        User trust score: {:?}/100\n\
        Counterparty trust score: {:?}/100\n\
        \n\
        Provide:\n\
        1. Risk score (0-100, where 0 is safest)\n\
        2. 2-3 key reasons for this score\n\
        3. Recommended action: APPROVE, REVIEW, or REJECT\n\
        \n\
        Format your response as JSON with fields: risk_score, reasons (array), action",
        payload.amount_satoshis,
        payload.user_trust_score,
        payload.counterparty_trust_score
    );

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "model": "gpt-3.5-turbo",
            "messages": [{
                "role": "user",
                "content": prompt
            }],
            "temperature": 0.3
        }))
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(AppError("OpenAI API request failed".to_string()));
    }

    // Parse OpenAI response
    // For now, return mock data
    Ok((
        calculate_mock_risk(payload),
        vec!["AI analysis pending".to_string()],
        "REVIEW".to_string(),
    ))
}

fn calculate_mock_risk(payload: &RiskAssessmentRequest) -> u8 {
    let mut score = 50u8;

    // Factor in user trust scores
    if let Some(user_score) = payload.user_trust_score {
        score = score.saturating_sub((user_score / 5) as u8);
    }

    if let Some(cp_score) = payload.counterparty_trust_score {
        score = score.saturating_sub((cp_score / 5) as u8);
    }

    // Factor in amount (higher amounts = higher risk)
    if payload.amount_satoshis > 10_000_000 {
        // > 0.1 BTC
        score = score.saturating_add(20);
    }

    score.min(100)
}

// Error handling
struct AppError(String);

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: std::error::Error,
{
    fn from(err: E) -> Self {
        AppError(err.to_string())
    }
}
