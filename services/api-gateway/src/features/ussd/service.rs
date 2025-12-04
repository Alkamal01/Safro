use uuid::Uuid;
use chrono::Utc;
use crate::features::ussd::repository::UssdRepository;
use crate::features::ussd::dto::*;
use crate::features::ussd::model::UssdSession;
use crate::features::escrow::service::EscrowService;
use crate::features::escrow::dto::*;
use crate::features::reputation::service::ReputationService;
use crate::features::auth::repository::AuthRepository;
use crate::shared::errors::AppError;
use crate::shared::utils::normalize_phone;
use crate::shared::AppState;

pub struct UssdService {
    repo: UssdRepository,
    state: AppState,
}

impl UssdService {
    pub fn new(repo: UssdRepository, state: AppState) -> Self {
        Self { repo, state }
    }

    pub async fn handle_request(&self, dto: UssdRequestDto) -> Result<UssdResponseDto, AppError> {
        let normalized_phone = normalize_phone(&dto.phone_number);
        
        // Get or create session
        let mut session = self.repo.get_session(&dto.session_id).await?
            .unwrap_or_else(|| UssdSession {
                id: Uuid::new_v4(),
                session_id: dto.session_id.clone(),
                phone_number: normalized_phone.clone(),
                current_menu: "main".to_string(),
                step: 0,
                session_data: serde_json::json!({}),
                created_at: Utc::now(),
                last_activity: Utc::now(),
                completed: false,
            });

        // Parse user input
        let input_parts: Vec<&str> = dto.text.split('*').filter(|s| !s.is_empty()).collect();
        let current_input = input_parts.last().unwrap_or(&"");

        // Update session
        session.last_activity = Utc::now();
        session.step = input_parts.len() as i32;

        // Route based on menu
        let response = match session.current_menu.as_str() {
            "main" => self.handle_main_menu(&mut session, current_input).await?,
            "create_escrow" => self.handle_create_escrow(&mut session, current_input, &input_parts).await?,
            "release_payment" => self.handle_release_payment(&mut session, current_input, &input_parts).await?,
            "check_status" => self.handle_check_status(&mut session, current_input).await?,
            "trust_score" => self.handle_trust_score(&mut session).await?,
            _ => self.get_main_menu(),
        };

        // Save session
        self.repo.save_session(&session).await?;

        Ok(response)
    }

    fn get_main_menu(&self) -> UssdResponseDto {
        UssdResponseDto {
            message: "Welcome to Safro Escrow\n\n1. Create Payment Request\n2. Release Payment\n3. Check Deal Status\n4. My Trust Score\n5. Help\n\nReply with option number".to_string(),
            action: "CON".to_string(),
        }
    }

    async fn handle_main_menu(
        &self,
        session: &mut UssdSession,
        input: &str,
    ) -> Result<UssdResponseDto, AppError> {
        match input {
            "1" => {
                session.current_menu = "create_escrow".to_string();
                session.step = 1;
                Ok(UssdResponseDto {
                    message: "Create Escrow Payment\n\nEnter amount:".to_string(),
                    action: "CON".to_string(),
                })
            }
            "2" => {
                session.current_menu = "release_payment".to_string();
                session.step = 1;
                Ok(UssdResponseDto {
                    message: "Release Payment\n\nEnter Deal Code:".to_string(),
                    action: "CON".to_string(),
                })
            }
            "3" => {
                session.current_menu = "check_status".to_string();
                session.step = 1;
                Ok(UssdResponseDto {
                    message: "Check Deal Status\n\nEnter Deal Code:".to_string(),
                    action: "CON".to_string(),
                })
            }
            "4" => {
                session.current_menu = "trust_score".to_string();
                self.handle_trust_score(session).await
            }
            "5" => {
                Ok(UssdResponseDto {
                    message: "Help\n\nSafro Escrow helps you make secure payments.\n\nTo create a payment request, select option 1.\nTo release payment, select option 2.\n\nFor support, contact us at support@safro.com".to_string(),
                    action: "END".to_string(),
                })
            }
            _ => {
                Ok(UssdResponseDto {
                    message: "Invalid option. Please try again.\n\n1. Create Payment Request\n2. Release Payment\n3. Check Deal Status\n4. My Trust Score\n5. Help".to_string(),
                    action: "CON".to_string(),
                })
            }
        }
    }

    async fn handle_create_escrow(
        &self,
        session: &mut UssdSession,
        current_input: &str,
        input_parts: &[&str],
    ) -> Result<UssdResponseDto, AppError> {
        match session.step {
            1 => {
                // Collect amount
                let amount: u64 = current_input.parse()
                    .map_err(|_| AppError::BadRequest("Invalid amount".to_string()))?;
                
                session.session_data["amount"] = serde_json::json!(amount);
                session.step = 2;
                
                Ok(UssdResponseDto {
                    message: format!("Amount: {}\n\nEnter buyer phone number:", amount),
                    action: "CON".to_string(),
                })
            }
            2 => {
                // Collect buyer phone
                let buyer_phone = normalize_phone(current_input);
                session.session_data["buyer_phone"] = serde_json::json!(buyer_phone);
                session.step = 3;
                
                Ok(UssdResponseDto {
                    message: format!("Buyer: {}\n\nEnter currency:\n1. NGN\n2. USD\n3. BTC", buyer_phone),
                    action: "CON".to_string(),
                })
            }
            3 => {
                // Collect currency
                let currency = match current_input {
                    "1" => "NGN",
                    "2" => "USD",
                    "3" => "BTC",
                    _ => return Err(AppError::BadRequest("Invalid currency option".to_string())),
                };
                
                // Get seller user
                let auth_repo = &self.state.auth_repo;
                let seller = auth_repo.find_by_phone(&session.phone_number).await?
                    .ok_or_else(|| AppError::NotFound("User not found. Please register first.".to_string()))?;

                // Create escrow
                let escrow_service = EscrowService::new(
                    self.state.escrow_repo.clone(),
                    self.state.clone(),
                );

                let create_dto = CreateEscrowDto {
                    amount: session.session_data["amount"].as_u64().unwrap(),
                    currency: currency.to_string(),
                    buyer_phone: session.session_data["buyer_phone"].as_str().unwrap().to_string(),
                    description: None,
                };

                let response = escrow_service.create_escrow(seller.id, create_dto).await?;

                session.completed = true;
                
                Ok(UssdResponseDto {
                    message: format!(
                        "Escrow created successfully!\n\nDeal Code: {}\nAmount: {}{}\nBuyer: {}\n\nYour Trust Score: {}/100 ({})\n\nBuyer will receive SMS to fund.",
                        response.deal_code,
                        response.amount,
                        response.currency,
                        response.buyer_phone,
                        response.trust_score,
                        response.trust_badge
                    ),
                    action: "END".to_string(),
                })
            }
            _ => {
                Ok(UssdResponseDto {
                    message: "Invalid input. Please try again.".to_string(),
                    action: "CON".to_string(),
                })
            }
        }
    }

    async fn handle_release_payment(
        &self,
        session: &mut UssdSession,
        current_input: &str,
        _input_parts: &[&str],
    ) -> Result<UssdResponseDto, AppError> {
        match session.step {
            1 => {
                // Collect deal code
                session.session_data["deal_code"] = serde_json::json!(current_input);
                session.step = 2;
                
                Ok(UssdResponseDto {
                    message: format!("Deal Code: {}\n\nEnter your Approval PIN:", current_input),
                    action: "CON".to_string(),
                })
            }
            2 => {
                // Collect PIN and release
                let deal_code = session.session_data["deal_code"].as_str().unwrap();
                let pin = current_input;

                // Get buyer user
                let auth_repo = &self.state.auth_repo;
                let buyer = auth_repo.find_by_phone(&session.phone_number).await?
                    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

                // Release escrow
                let escrow_service = EscrowService::new(
                    self.state.escrow_repo.clone(),
                    self.state.clone(),
                );

                let release_dto = ReleaseEscrowDto {
                    deal_code: deal_code.to_string(),
                    approval_pin: pin.to_string(),
                };

                let response = escrow_service.release_escrow(buyer.id, release_dto).await?;

                session.completed = true;

                Ok(UssdResponseDto {
                    message: format!(
                        "Payment released successfully!\n\nDeal Code: {}\nAmount: {}{}\n\nYour Trust Score has increased!",
                        response.deal_code,
                        response.amount,
                        response.currency
                    ),
                    action: "END".to_string(),
                })
            }
            _ => {
                Ok(UssdResponseDto {
                    message: "Invalid input. Please try again.".to_string(),
                    action: "CON".to_string(),
                })
            }
        }
    }

    async fn handle_check_status(
        &self,
        session: &mut UssdSession,
        current_input: &str,
    ) -> Result<UssdResponseDto, AppError> {
        let escrow_service = EscrowService::new(
            self.state.escrow_repo.clone(),
            self.state.clone(),
        );

        let status = escrow_service.get_escrow_status(current_input).await?;

        session.completed = true;

        Ok(UssdResponseDto {
            message: format!(
                "Deal Status\n\nDeal Code: {}\nAmount: {}{}\nStatus: {}\n\nCreated: {}",
                status.deal_code,
                status.amount,
                status.currency,
                status.status,
                status.created_at.format("%Y-%m-%d %H:%M")
            ),
            action: "END".to_string(),
        })
    }

    async fn handle_trust_score(
        &self,
        session: &mut UssdSession,
    ) -> Result<UssdResponseDto, AppError> {
        // Get user
        let auth_repo = &self.state.auth_repo;
        let user = auth_repo.find_by_phone(&session.phone_number).await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        let reputation_service = ReputationService::new(self.state.reputation_repo.clone());
        let trust_score = reputation_service.get_trust_score(user.id).await.unwrap_or(50);
        let badge = reputation_service.get_trust_badge(trust_score).await;

        session.completed = true;

        Ok(UssdResponseDto {
            message: format!(
                "My Trust Score\n\nScore: {}/100\nBadge: {}\n\nKeep completing deals to increase your score!",
                trust_score,
                badge
            ),
            action: "END".to_string(),
        })
    }
}

