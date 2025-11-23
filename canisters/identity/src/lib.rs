use ic_cdk::api::time;
use ic_cdk::{caller, query, update};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub principal_id: Principal,
    pub username: Option<String>,
    pub phone_number: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub kyc_level: u8,
    pub is_agent: bool,
    pub badges: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateProfileParams {
    pub username: Option<String>,
    pub phone_number: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ProfileError {
    NotFound,
    Unauthorized,
    UsernameAlreadyTaken,
    InvalidInput(String),
}

thread_local! {
    static PROFILES: RefCell<HashMap<Principal, UserProfile>> = RefCell::new(HashMap::new());
    static USERNAME_INDEX: RefCell<HashMap<String, Principal>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("Identity canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {}

#[post_upgrade]
fn post_upgrade() {}

#[update]
fn create_profile() -> std::result::Result<UserProfile, ProfileError> {
    let principal_id = caller();
    
    // Check if profile already exists
    let exists = PROFILES.with(|profiles| {
        profiles.borrow().contains_key(&principal_id)
    });
    
    if exists {
        return Err(ProfileError::InvalidInput("Profile already exists".to_string()));
    }
    
    let now = time();
    let profile = UserProfile {
        principal_id,
        username: None,
        phone_number: None,
        email: None,
        avatar_url: None,
        bio: None,
        kyc_level: 0,
        is_agent: false,
        badges: vec![],
        created_at: now,
        updated_at: now,
    };
    
    PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(principal_id, profile.clone());
    });
    
    Ok(profile)
}

#[query]
fn get_profile(principal_id: Principal) -> Option<UserProfile> {
    PROFILES.with(|profiles| {
        profiles.borrow().get(&principal_id).cloned()
    })
}

#[query]
fn get_my_profile() -> Option<UserProfile> {
    get_profile(caller())
}

#[update]
fn update_profile(params: UpdateProfileParams) -> std::result::Result<UserProfile, ProfileError> {
    let principal_id = caller();
    
    PROFILES.with(|profiles| {
        let mut profiles_map = profiles.borrow_mut();
        let profile = profiles_map.get_mut(&principal_id)
            .ok_or(ProfileError::NotFound)?;
        
        // If username is being changed, check if it's available
        if let Some(ref new_username) = params.username {
            if new_username.len() < 3 || new_username.len() > 20 {
                return Err(ProfileError::InvalidInput("Username must be 3-20 characters".to_string()));
            }
            
            // Check if username is taken
            let username_taken = USERNAME_INDEX.with(|index| {
                index.borrow()
                    .get(new_username)
                    .map_or(false, |existing_principal| *existing_principal != principal_id)
            });
            
            if username_taken {
                return Err(ProfileError::UsernameAlreadyTaken);
            }
            
            // Remove old username from index if exists
            if let Some(ref old_username) = profile.username {
                USERNAME_INDEX.with(|index| {
                    index.borrow_mut().remove(old_username);
                });
            }
            
            // Add new username to index
            USERNAME_INDEX.with(|index| {
                index.borrow_mut().insert(new_username.clone(), principal_id);
            });
            
            profile.username = Some(new_username.clone());
        }
        
        if let Some(phone) = params.phone_number {
            profile.phone_number = Some(phone);
        }
        
        if let Some(email) = params.email {
            profile.email = Some(email);
        }
        
        if let Some(avatar) = params.avatar_url {
            profile.avatar_url = Some(avatar);
        }
        
        if let Some(bio) = params.bio {
            if bio.len() > 500 {
                return Err(ProfileError::InvalidInput("Bio must be under 500 characters".to_string()));
            }
            profile.bio = Some(bio);
        }
        
        profile.updated_at = time();
        
        Ok(profile.clone())
    })
}

#[update]
fn update_kyc_level(principal_id: Principal, kyc_level: u8) -> std::result::Result<UserProfile, ProfileError> {
    // In production, verify caller is authorized
    
    if kyc_level > 3 {
        return Err(ProfileError::InvalidInput("KYC level must be 0-3".to_string()));
    }
    
    PROFILES.with(|profiles| {
        let mut profiles_map = profiles.borrow_mut();
        let profile = profiles_map.get_mut(&principal_id)
            .ok_or(ProfileError::NotFound)?;
        
        profile.kyc_level = kyc_level;
        profile.updated_at = time();
        
        Ok(profile.clone())
    })
}

#[update]
fn set_agent_status(principal_id: Principal, is_agent: bool) -> std::result::Result<UserProfile, ProfileError> {
    // In production, verify caller is authorized
    
    PROFILES.with(|profiles| {
        let mut profiles_map = profiles.borrow_mut();
        let profile = profiles_map.get_mut(&principal_id)
            .ok_or(ProfileError::NotFound)?;
        
        profile.is_agent = is_agent;
        profile.updated_at = time();
        
        if is_agent && !profile.badges.contains(&"Agent".to_string()) {
            profile.badges.push("Agent".to_string());
        }
        
        Ok(profile.clone())
    })
}

#[query]
fn get_agents() -> Vec<UserProfile> {
    PROFILES.with(|profiles| {
        profiles.borrow()
            .values()
            .filter(|p| p.is_agent)
            .cloned()
            .collect()
    })
}

#[query]
fn search_by_username(username: String) -> Option<UserProfile> {
    USERNAME_INDEX.with(|index| {
        index.borrow().get(&username).and_then(|principal_id| {
            PROFILES.with(|profiles| {
                profiles.borrow().get(principal_id).cloned()
            })
        })
    })
}

#[query]
fn get_total_users() -> u64 {
    PROFILES.with(|profiles| profiles.borrow().len() as u64)
}

ic_cdk::export_candid!();
