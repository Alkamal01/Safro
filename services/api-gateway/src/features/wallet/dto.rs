use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct WalletBalanceDto {
    pub btc_balance: u64,
    pub ckbtc_balance: u64,
    pub ngn_balance: u64,
}

