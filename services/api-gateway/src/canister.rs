// Canister client module
// This will contain IC Agent integration for calling canisters

pub struct CanisterClient {
    pub agent: ic_agent::Agent,
}

impl CanisterClient {
    pub async fn new(ic_host: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let agent = ic_agent::Agent::builder()
            .with_url(ic_host)
            .build()?;

        // Fetch root key for local development
        if ic_host.contains("localhost") || ic_host.contains("127.0.0.1") {
            agent.fetch_root_key().await?;
        }

        Ok(Self { agent })
    }

    // Add methods to call specific canisters here
}
