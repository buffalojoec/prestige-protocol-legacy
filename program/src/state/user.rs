use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct User {
    pub wallet: Pubkey,
    pub name: String,
    pub endorsements: u32,
    pub challenges_authored: u32,
    pub contracts_completed: u32,
    pub contracts_created: u32,
    pub events_hosted: u32,
    pub bump: u8,
}

impl User {

    pub const SEED_PREFIX: &'static str = "user";
    
    pub fn new(
        wallet: Pubkey,
        name: String,
        bump: u8,
    ) -> Self {

        User {
            wallet,
            name,
            endorsements: 0,
            challenges_authored: 0,
            contracts_completed: 0,
            contracts_created: 0,
            events_hosted: 0,
            bump,
        }
    }
}