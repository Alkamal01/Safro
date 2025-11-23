use ic_cdk::api::time;
use ic_cdk::{query, update};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Deserialize};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct AIResult {
    pub escrow_id: String,
    pub risk_score: u8,
    pub risk_reasons: Vec<String>,
    pub recommended_action: String,
    pub generated_at: u64,
    pub model_version: String,
    pub signature: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum AIError {
    NotFound,
    Unauthorized,
    InvalidSignature,
    AlreadyProcessed,
}

thread_local! {
    static AI_RESULTS: RefCell<HashMap<String, AIResult>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("AI Orchestration canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {}

#[post_upgrade]
fn post_upgrade() {}

#[update]
fn store_ai_result(result: AIResult) -> std::result::Result<AIResult, AIError> {
    // In production, verify caller is AI gateway or authorized service
    // Also verify signature
    
    // Check if already exists
    let exists = AI_RESULTS.with(|results| {
        results.borrow().contains_key(&result.escrow_id)
    });
    
    if exists {
        return Err(AIError::AlreadyProcessed);
    }
    
    // Store result
    AI_RESULTS.with(|results| {
        results.borrow_mut().insert(result.escrow_id.clone(), result.clone());
    });
    
    Ok(result)
}

#[query]
fn get_ai_result(escrow_id: String) -> Option<AIResult> {
    AI_RESULTS.with(|results| {
        results.borrow().get(&escrow_id).cloned()
    })
}

#[query]
fn get_results_by_score_range(min_score: u8, max_score: u8) -> Vec<AIResult> {
    AI_RESULTS.with(|results| {
        results.borrow()
            .values()
            .filter(|r| r.risk_score >= min_score && r.risk_score <= max_score)
            .cloned()
            .collect()
    })
}

#[query]
fn get_total_assessments() -> u64 {
    AI_RESULTS.with(|results| results.borrow().len() as u64)
}

#[query]
fn get_avg_risk_score() -> u8 {
    AI_RESULTS.with(|results| {
        let results_map = results.borrow();
        if results_map.is_empty() {
            return 0;
        }
        
        let sum: u64 = results_map.values().map(|r| r.risk_score as u64).sum();
        (sum / results_map.len() as u64) as u8
    })
}

ic_cdk::export_candid!();
