use ic_cdk::api::time;
use ic_cdk::{caller, query, update};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use std::cell::RefCell;
use std::collections::HashMap;
use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct WalletBalance {
    pub user_id: Principal,
    pub btc_balance: u64,
    pub ckbtc_balance: u64,
    pub pending_deposits: u64,
    pub pending_withdrawals: u64,
    pub last_updated: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct DepositAddress {
    pub user_id: Principal,
    pub address: String,
    pub currency: String,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Transaction {
    pub tx_id: String,
    pub user_id: Principal,
    pub tx_type: String,
    pub amount: u64,
    pub currency: String,
    pub status: String,
    pub created_at: u64,
    pub confirmed_at: Option<u64>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TransferParams {
    pub to: Principal,
    pub amount: u64,
    pub currency: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum WalletError {
    InsufficientBalance,
    InvalidAddress,
    InvalidAmount,
    TransferFailed(String),
    NotFound,
    Unauthorized,
}

thread_local! {
    static BALANCES: RefCell<HashMap<Principal, WalletBalance>> = RefCell::new(HashMap::new());
    static ADDRESSES: RefCell<HashMap<Principal, Vec<DepositAddress>>> = RefCell::new(HashMap::new());
    static TRANSACTIONS: RefCell<HashMap<Principal, Vec<Transaction>>> = RefCell::new(HashMap::new());
    static TX_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    ic_cdk::println!("Wallet canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    // Store state before upgrade
}

#[post_upgrade]
fn post_upgrade() {
    // Restore state after upgrade
}

fn get_or_create_balance(user_id: Principal) -> WalletBalance {
    BALANCES.with(|balances| {
        balances.borrow_mut().entry(user_id).or_insert_with(|| {
            WalletBalance {
                user_id,
                btc_balance: 0,
                ckbtc_balance: 0,
                pending_deposits: 0,
                pending_withdrawals: 0,
                last_updated: time(),
            }
        }).clone()
    })
}

fn generate_tx_id() -> String {
    TX_COUNTER.with(|counter| {
        let mut c = counter.borrow_mut();
        *c += 1;
        format!("TX-{:010}", *c)
    })
}

#[query]
fn get_balance(user_id: Principal) -> Option<WalletBalance> {
    BALANCES.with(|balances| {
        balances.borrow().get(&user_id).cloned()
    })
}

#[query]
fn get_my_balance() -> Option<WalletBalance> {
    get_balance(caller())
}

#[update]
fn get_deposit_address(currency: String) -> std::result::Result<DepositAddress, WalletError> {
    let user_id = caller();
    
    // Check if user already has an address for this currency
    let existing = ADDRESSES.with(|addresses| {
        addresses.borrow()
            .get(&user_id)
            .and_then(|addrs| addrs.iter().find(|a| a.currency == currency).cloned())
    });
    
    if let Some(addr) = existing {
        return Ok(addr);
    }
    
    // Generate new address (mock for now)
    let address = match currency.as_str() {
        "BTC" => format!("tb1q{:x}", time() % 1000000),
        "ckBTC" => format!("ckbtc-{:x}", time() % 1000000),
        _ => return Err(WalletError::InvalidAddress),
    };
    
    let deposit_address = DepositAddress {
        user_id,
        address: address.clone(),
        currency: currency.clone(),
        created_at: time(),
    };
    
    ADDRESSES.with(|addresses| {
        addresses.borrow_mut()
            .entry(user_id)
            .or_insert_with(Vec::new)
            .push(deposit_address.clone());
    });
    
    // Initialize balance if not exists
    get_or_create_balance(user_id);
    
    Ok(deposit_address)
}

#[query]
fn get_my_addresses() -> Vec<DepositAddress> {
    let user_id = caller();
    ADDRESSES.with(|addresses| {
        addresses.borrow()
            .get(&user_id)
            .cloned()
            .unwrap_or_default()
    })
}

#[update]
fn transfer(params: TransferParams) -> std::result::Result<WalletBalance, WalletError> {
    let from = caller();
    
    if params.amount == 0 {
        return Err(WalletError::InvalidAmount);
    }
    
    if from == params.to {
        return Err(WalletError::TransferFailed("Cannot transfer to yourself".to_string()));
    }
    
    BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        
        // Get sender balance
        let sender_balance = balances_map.get_mut(&from)
            .ok_or(WalletError::InsufficientBalance)?;
        
        // Check sufficient balance
        let balance_to_check = match params.currency.as_str() {
            "BTC" => &mut sender_balance.btc_balance,
            "ckBTC" => &mut sender_balance.ckbtc_balance,
            _ => return Err(WalletError::InvalidAddress),
        };
        
        if *balance_to_check < params.amount {
            return Err(WalletError::InsufficientBalance);
        }
        
        // Deduct from sender
        *balance_to_check -= params.amount;
        sender_balance.last_updated = time();
        let updated_sender = sender_balance.clone();
        
        // Get or create recipient balance
        let recipient_balance = balances_map.entry(params.to)
            .or_insert_with(|| WalletBalance {
                user_id: params.to,
                btc_balance: 0,
                ckbtc_balance: 0,
                pending_deposits: 0,
                pending_withdrawals: 0,
                last_updated: time(),
            });
        
        // Add to recipient
        match params.currency.as_str() {
            "BTC" => recipient_balance.btc_balance += params.amount,
            "ckBTC" => recipient_balance.ckbtc_balance += params.amount,
            _ => unreachable!(),
        };
        recipient_balance.last_updated = time();
        
        // Record transaction for both parties
        let tx_id = generate_tx_id();
        let now = time();
        
        let sender_tx = Transaction {
            tx_id: tx_id.clone(),
            user_id: from,
            tx_type: "transfer_out".to_string(),
            amount: params.amount,
            currency: params.currency.clone(),
            status: "confirmed".to_string(),
            created_at: now,
            confirmed_at: Some(now),
        };
        
        let recipient_tx = Transaction {
            tx_id: tx_id.clone(),
            user_id: params.to,
            tx_type: "transfer_in".to_string(),
            amount: params.amount,
            currency: params.currency,
            status: "confirmed".to_string(),
            created_at: now,
            confirmed_at: Some(now),
        };
        
        TRANSACTIONS.with(|txs| {
            let mut txs_map = txs.borrow_mut();
            txs_map.entry(from).or_insert_with(Vec::new).push(sender_tx);
            txs_map.entry(params.to).or_insert_with(Vec::new).push(recipient_tx);
        });
        
        Ok(updated_sender)
    })
}

#[query]
fn get_transactions(user_id: Principal) -> Vec<Transaction> {
    TRANSACTIONS.with(|txs| {
        txs.borrow()
            .get(&user_id)
            .cloned()
            .unwrap_or_default()
    })
}

#[query]
fn get_my_transactions() -> Vec<Transaction> {
    get_transactions(caller())
}

#[update]
fn update_balance(user_id: Principal, amount: u64, currency: String) -> std::result::Result<WalletBalance, WalletError> {
    // In production, add authorization check
    
    BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        let balance = balances_map.entry(user_id)
            .or_insert_with(|| WalletBalance {
                user_id,
                btc_balance: 0,
                ckbtc_balance: 0,
                pending_deposits: 0,
                pending_withdrawals: 0,
                last_updated: time(),
            });
        
        match currency.as_str() {
            "BTC" => balance.btc_balance += amount,
            "ckBTC" => balance.ckbtc_balance += amount,
            _ => return Err(WalletError::InvalidAddress),
        };
        
        balance.last_updated = time();
        
        // Record deposit transaction
        let tx = Transaction {
            tx_id: generate_tx_id(),
            user_id,
            tx_type: "deposit".to_string(),
            amount,
            currency,
            status: "confirmed".to_string(),
            created_at: time(),
            confirmed_at: Some(time()),
        };
        
        TRANSACTIONS.with(|txs| {
            txs.borrow_mut()
                .entry(user_id)
                .or_insert_with(Vec::new)
                .push(tx);
        });
        
        Ok(balance.clone())
    })
}

ic_cdk::export_candid!();
