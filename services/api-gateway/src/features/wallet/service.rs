use crate::shared::errors::AppError;
use crate::features::wallet::dto::*;

pub struct WalletService;

impl WalletService {
    pub async fn get_balance(&self, _user_id: uuid::Uuid) -> Result<WalletBalanceDto, AppError> {
        // TODO: Integrate with wallet canister
        Ok(WalletBalanceDto {
            btc_balance: 0,
            ckbtc_balance: 0,
            ngn_balance: 0,
        })
    }
}

