use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Event {
    pub authority: Pubkey,
    pub title: String,
    pub description: String,
    pub location: String,
    pub host_name: String,
    pub date: String,
    pub endorsements: u32,
    pub contracts_completed: u32,
    pub bump: u8,
}

impl Event {

    pub const SEED_PREFIX: &'static str = "event";
    
    pub fn new(
        authority: Pubkey,
        title: String,
        description: String,
        location: String,
        host_name: String,
        date: String,
        bump: u8,
    ) -> Self {

        Event {
            authority,
            title,
            description,
            location,
            host_name,
            date,
            endorsements: 0,
            contracts_completed: 0,
            bump,
        }
    }
}
