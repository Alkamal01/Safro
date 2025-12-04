pub mod config;
pub mod errors;
pub mod middleware;
pub mod utils;

pub use config::AppConfig;
pub use errors::{AppError, AppResult};
pub use middleware::auth_middleware;
pub use utils::*;

use std::sync::Arc;
use sqlx::PgPool;
use crate::features::auth::repository::AuthRepository;
use crate::features::kyc::repository::KycRepository;
use crate::features::escrow::repository::EscrowRepository;
use crate::features::reputation::repository::ReputationRepository;
use crate::features::ussd::repository::UssdRepository;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub db_pool: PgPool,
    pub auth_repo: Arc<AuthRepository>,
    pub kyc_repo: Arc<KycRepository>,
    pub escrow_repo: Arc<EscrowRepository>,
    pub reputation_repo: Arc<ReputationRepository>,
    pub ussd_repo: Arc<UssdRepository>,
}
