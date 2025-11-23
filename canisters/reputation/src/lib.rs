use ic_cdk::api::time;
use ic_cdk::{caller, query, update};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ReputationProfile {
    pub user_id: Principal,
    pub completed_deals: u64,
    pub dispute_count: u64,
    pub avg_response_time_seconds: u64,
    pub trust_score: u8,
    pub badges: Vec<String>,
    pub last_update: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct DisputeRecord {
    pub dispute_id: String,
    pub escrow_id: String,
    pub user_id: Principal,
    pub dispute_type: String,
    pub resolution: String,
    pub created_at: u64,
    pub resolved_at: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ReputationError {
    NotFound,
    Unauthorized,
    InvalidScore,
}

thread_local! {
    static REPUTATIONS: RefCell<HashMap<Principal, ReputationProfile>> = RefCell::new(HashMap::new());
    static DISPUTES: RefCell<HashMap<String, DisputeRecord>> = RefCell::new(HashMap::new());
    static USER_DISPUTES: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
    static DISPUTE_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    ic_cdk::println!("Reputation canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {}

#[post_upgrade]
fn post_upgrade() {}

fn get_or_create_reputation(user_id: Principal) -> ReputationProfile {
    REPUTATIONS.with(|reps| {
        reps.borrow_mut().entry(user_id).or_insert_with(|| {
            ReputationProfile {
                user_id,
                completed_deals: 0,
                dispute_count: 0,
                avg_response_time_seconds: 0,
                trust_score: 50,
                badges: vec![],
                last_update: time(),
            }
        }).clone()
    })
}

fn calculate_trust_score(profile: &ReputationProfile) -> u8 {
    let mut score = 50u8;
    
    // Boost for completed deals
    score = score.saturating_add((profile.completed_deals.min(50) as u8));
    
    // Penalty for disputes
    let dispute_penalty = (profile.dispute_count.min(25) * 2) as u8;
    score = score.saturating_sub(dispute_penalty);
    
    // Bonus for good response time (under 1 hour)
    if profile.avg_response_time_seconds < 3600 {
        score = score.saturating_add(10);
    }
    
    // Bonus for badges
    score = score.saturating_add((profile.badges.len() * 5).min(20) as u8);
    
    score.min(100)
}

#[query]
fn get_reputation(user_id: Principal) -> Option<ReputationProfile> {
    REPUTATIONS.with(|reps| {
        reps.borrow().get(&user_id).cloned()
    })
}

#[query]
fn get_my_reputation() -> Option<ReputationProfile> {
    get_reputation(caller())
}

#[update]
fn record_completed_deal(user_id: Principal, response_time_seconds: u64) -> std::result::Result<ReputationProfile, ReputationError> {
    // In production, verify caller is escrow canister
    
    REPUTATIONS.with(|reps| {
        let mut reps_map = reps.borrow_mut();
        let profile = reps_map.entry(user_id).or_insert_with(|| {
            ReputationProfile {
                user_id,
                completed_deals: 0,
                dispute_count: 0,
                avg_response_time_seconds: 0,
                trust_score: 50,
                badges: vec![],
                last_update: time(),
            }
        });
        
        // Update completed deals
        profile.completed_deals += 1;
        
        // Update average response time
        if profile.avg_response_time_seconds == 0 {
            profile.avg_response_time_seconds = response_time_seconds;
        } else {
            profile.avg_response_time_seconds = 
                (profile.avg_response_time_seconds + response_time_seconds) / 2;
        }
        
        // Award milestone badges
        match profile.completed_deals {
            10 => profile.badges.push("10 Deals".to_string()),
            50 => profile.badges.push("50 Deals".to_string()),
            100 => profile.badges.push("100 Deals".to_string()),
            _ => {}
        }
        
        // Recalculate trust score
        profile.trust_score = calculate_trust_score(profile);
        profile.last_update = time();
        
        Ok(profile.clone())
    })
}

#[update]
fn record_dispute(user_id: Principal, escrow_id: String, dispute_type: String) -> std::result::Result<ReputationProfile, ReputationError> {
    // In production, verify caller is escrow canister
    
    let dispute_id = DISPUTE_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        format!("DISP-{:010}", *c)
    });
    
    let dispute = DisputeRecord {
        dispute_id: dispute_id.clone(),
        escrow_id,
        user_id,
        dispute_type,
        resolution: String::new(),
        created_at: time(),
        resolved_at: None,
    };
    
    DISPUTES.with(|disputes| {
        disputes.borrow_mut().insert(dispute_id.clone(), dispute);
    });
    
    USER_DISPUTES.with(|user_disputes| {
        user_disputes.borrow_mut()
            .entry(user_id)
            .or_insert_with(Vec::new)
            .push(dispute_id);
    });
    
    REPUTATIONS.with(|reps| {
        let mut reps_map = reps.borrow_mut();
        let profile = reps_map.entry(user_id).or_insert_with(|| {
            ReputationProfile {
                user_id,
                completed_deals: 0,
                dispute_count: 0,
                avg_response_time_seconds: 0,
                trust_score: 50,
                badges: vec![],
                last_update: time(),
            }
        });
        
        profile.dispute_count += 1;
        profile.trust_score = calculate_trust_score(profile);
        profile.last_update = time();
        
        Ok(profile.clone())
    })
}

#[update]
fn resolve_dispute(dispute_id: String, resolution: String) -> std::result::Result<ReputationProfile, ReputationError> {
    // In production, verify caller is authorized
    
    DISPUTES.with(|disputes| {
        let mut disputes_map = disputes.borrow_mut();
        let dispute = disputes_map.get_mut(&dispute_id)
            .ok_or(ReputationError::NotFound)?;
        
        dispute.resolution = resolution;
        dispute.resolved_at = Some(time());
        
        let user_id = dispute.user_id;
        
        REPUTATIONS.with(|reps| {
            let profile = reps.borrow().get(&user_id).cloned()
                .ok_or(ReputationError::NotFound)?;
            Ok(profile)
        })
    })
}

#[update]
fn award_badge(user_id: Principal, badge: String) -> std::result::Result<ReputationProfile, ReputationError> {
    // In production, verify caller is authorized
    
    REPUTATIONS.with(|reps| {
        let mut reps_map = reps.borrow_mut();
        let profile = reps_map.entry(user_id).or_insert_with(|| {
            ReputationProfile {
                user_id,
                completed_deals: 0,
                dispute_count: 0,
                avg_response_time_seconds: 0,
                trust_score: 50,
                badges: vec![],
                last_update: time(),
            }
        });
        
        if !profile.badges.contains(&badge) {
            profile.badges.push(badge);
            profile.trust_score = calculate_trust_score(profile);
            profile.last_update = time();
        }
        
        Ok(profile.clone())
    })
}

#[query]
fn get_top_users(limit: u64) -> Vec<ReputationProfile> {
    REPUTATIONS.with(|reps| {
        let mut profiles: Vec<ReputationProfile> = reps.borrow().values().cloned().collect();
        profiles.sort_by(|a, b| b.trust_score.cmp(&a.trust_score));
        profiles.truncate(limit as usize);
        profiles
    })
}

#[query]
fn get_dispute_history(user_id: Principal) -> Vec<DisputeRecord> {
    USER_DISPUTES.with(|user_disputes| {
        let dispute_ids = user_disputes.borrow()
            .get(&user_id)
            .cloned()
            .unwrap_or_default();
        
        DISPUTES.with(|disputes| {
            let disputes_map = disputes.borrow();
            dispute_ids.iter()
                .filter_map(|id| disputes_map.get(id).cloned())
                .collect()
        })
    })
}

ic_cdk::export_candid!();
