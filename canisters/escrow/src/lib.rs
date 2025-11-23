use ic_cdk::api::time;
use ic_cdk::{caller, query, update};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::Principal;

mod types;
use types::*;

// Thread-local storage for escrow records
thread_local! {
    static ESCROWS: RefCell<HashMap<String, EscrowRecord>> = RefCell::new(HashMap::new());
    static ESCROW_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    ic_cdk::println!("Escrow canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    // Store state before upgrade
    // In production, you'd serialize ESCROWS to stable memory
}

#[post_upgrade]
fn post_upgrade() {
    // Restore state after upgrade
}

// Helper function to generate escrow ID
fn generate_escrow_id() -> String {
    ESCROW_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        format!("ESC-{:010}", *c)
    })
}

// Helper function to generate deposit address (mock for now)
// In production, this would use threshold signatures
fn generate_deposit_address(escrow_id: &str, currency: &Currency) -> String {
    match currency {
        Currency::BTC => format!("tb1q{}", &escrow_id[4..].to_lowercase()),
        Currency::CkBTC => format!("ckbtc-{}", escrow_id),
    }
}

// Helper to get current timestamp
fn current_timestamp() -> u64 {
    time()
}

#[update]
fn create_escrow(params: CreateEscrowParams) -> std::result::Result<CreateEscrowResult, EscrowError> {
    let creator = caller();
    
    // Validate params
    if params.amount_satoshis == 0 {
        return Err(EscrowError::InvalidAmount);
    }
    
    if creator == params.counterparty_id {
        return Err(EscrowError::InternalError("Cannot create escrow with yourself".to_string()));
    }
    
    let escrow_id = generate_escrow_id();
    let deposit_address = generate_deposit_address(&escrow_id, &params.currency);
    let now = current_timestamp();
    
    let escrow = EscrowRecord {
        escrow_id: escrow_id.clone(),
        creator_id: creator,
        counterparty_id: params.counterparty_id,
        amount_satoshis: params.amount_satoshis,
        currency: params.currency.clone(),
        deposit_address: deposit_address.clone(),
        utxos: vec![],
        status: EscrowStatus::Created,
        time_lock_unix: params.time_lock_unix,
        created_at: now,
        updated_at: now,
        ai_risk_score: None,
        tags: vec![],
        creator_confirmed_delivery: false,
        counterparty_confirmed_delivery: false,
    };
    
    ESCROWS.with(|escrows| {
        escrows.borrow_mut().insert(escrow_id.clone(), escrow);
    });
    
    Ok(CreateEscrowResult {
        escrow_id,
        deposit_address,
    })
}

#[query]
fn get_escrow(escrow_id: String) -> Option<EscrowRecord> {
    ESCROWS.with(|escrows| {
        escrows.borrow().get(&escrow_id).cloned()
    })
}

#[query]
fn get_user_escrows(user_id: Principal) -> Vec<EscrowRecord> {
    ESCROWS.with(|escrows| {
        escrows
            .borrow()
            .values()
            .filter(|e| e.creator_id == user_id || e.counterparty_id == user_id)
            .cloned()
            .collect()
    })
}

#[update]
fn notify_deposit(escrow_id: String, utxo: UTXO) -> Result<EscrowRecord> {
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        // Verify status
        if escrow.status != EscrowStatus::Created {
            return Err(EscrowError::InvalidStatus);
        }
        
        // Add UTXO
        escrow.utxos.push(utxo.clone());
        
        // Calculate total deposited
        let total_deposited: u64 = escrow.utxos.iter().map(|u| u.amount_satoshis).sum();
        
        // Update status if fully funded
        if total_deposited >= escrow.amount_satoshis {
            escrow.status = EscrowStatus::Funded;
        }
        
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[update]
fn confirm_delivery(escrow_id: String) -> Result<EscrowRecord> {
    let caller_id = caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        // Verify caller is participant
        if caller_id != escrow.creator_id && caller_id != escrow.counterparty_id {
            return Err(EscrowError::Unauthorized);
        }
        
        // Verify status
        if escrow.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }
        
        // Mark confirmation
        if caller_id == escrow.creator_id {
            if escrow.creator_confirmed_delivery {
                return Err(EscrowError::AlreadyConfirmed);
            }
            escrow.creator_confirmed_delivery = true;
        } else {
            if escrow.counterparty_confirmed_delivery {
                return Err(EscrowError::AlreadyConfirmed);
            }
            escrow.counterparty_confirmed_delivery = true;
        }
        
        // Update status if both confirmed
        if escrow.creator_confirmed_delivery && escrow.counterparty_confirmed_delivery {
            escrow.status = EscrowStatus::Delivered;
        }
        
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[update]
fn request_release(escrow_id: String) -> Result<EscrowRecord> {
    let caller_id = caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        // Verify caller is participant
        if caller_id != escrow.creator_id && caller_id != escrow.counterparty_id {
            return Err(EscrowError::Unauthorized);
        }
        
        // Check status (must be Delivered or time-lock expired)
        let can_release = escrow.status == EscrowStatus::Delivered
            || (escrow.status == EscrowStatus::Funded 
                && escrow.time_lock_unix.map_or(false, |lock| current_timestamp() >= lock));
        
        if !can_release {
            return Err(EscrowError::InvalidStatus);
        }
        
        // In production, this would trigger threshold signature transaction
        escrow.status = EscrowStatus::Released;
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[update]
fn force_refund(escrow_id: String, reason: String) -> Result<EscrowRecord> {
    let caller_id = caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        // Only creator can force refund before delivery
        if caller_id != escrow.creator_id {
            return Err(EscrowError::Unauthorized);
        }
        
        // Can only refund if not yet delivered
        if escrow.status != EscrowStatus::Created && escrow.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }
        
        // In production, trigger refund transaction
        escrow.status = EscrowStatus::Refunded;
        escrow.tags.push(format!("refund_reason: {}", reason));
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[update]
fn mark_disputed(escrow_id: String, reason: String) -> Result<EscrowRecord> {
    let caller_id = caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        // Verify caller is participant
        if caller_id != escrow.creator_id && caller_id != escrow.counterparty_id {
            return Err(EscrowError::Unauthorized);
        }
        
        // Can dispute funded or delivered escrows
        if escrow.status != EscrowStatus::Funded && escrow.status != EscrowStatus::Delivered {
            return Err(EscrowError::InvalidStatus);
        }
        
        escrow.status = EscrowStatus::Disputed;
        escrow.tags.push(format!("dispute_reason: {}", reason));
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[update]
fn resolve_dispute(escrow_id: String, resolution: String) -> Result<EscrowRecord> {
    // In production, only admin/arbitrator can call this
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        if escrow.status != EscrowStatus::Disputed {
            return Err(EscrowError::InvalidStatus);
        }
        
        // Resolution would determine Released or Refunded
        if resolution.contains("release") {
            escrow.status = EscrowStatus::Released;
        } else {
            escrow.status = EscrowStatus::Refunded;
        }
        
        escrow.tags.push(format!("resolution: {}", resolution));
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[update]
fn attach_ai_result(escrow_id: String, risk_score: u8, tags: Vec<String>) -> Result<EscrowRecord> {
    // In production, verify caller is AI orchestration canister
    ESCROWS.with(|escrows| {
        let mut escrows_map = escrows.borrow_mut();
        let escrow = escrows_map.get_mut(&escrow_id).ok_or(EscrowError::NotFound)?;
        
        escrow.ai_risk_score = Some(risk_score);
        escrow.tags.extend(tags);
        escrow.updated_at = current_timestamp();
        
        Ok(escrow.clone())
    })
}

#[query]
fn get_total_escrows() -> u64 {
    ESCROWS.with(|escrows| escrows.borrow().len() as u64)
}

#[query]
fn get_escrows_by_status(status: EscrowStatus) -> Vec<EscrowRecord> {
    ESCROWS.with(|escrows| {
        escrows
            .borrow()
            .values()
            .filter(|e| e.status == status)
            .cloned()
            .collect()
    })
}

// Export candid interface
ic_cdk::export_candid!();
