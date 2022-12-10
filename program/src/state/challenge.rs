use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Challenge {
    pub authority: Pubkey,
    pub title: String,
    pub description: String,
    pub author_name: String,
    pub tags: String,
    pub endorsements: u32,
    pub contracts_completed: u32,
    pub contracts_created: u32,
    pub status: u8, // 0: closed, 1: open
    pub bump: u8,
}

impl Challenge {

    pub const SEED_PREFIX: &'static str = "challenge";

    pub fn new(
        authority: Pubkey,
        title: String,
        description: String,
        author_name: String,
        tags: String,
        bump: u8,
    ) -> Self {

        Challenge {
            authority,
            title,
            description,
            author_name,
            tags,
            endorsements: 0,
            contracts_completed: 0,
            contracts_created: 0,
            status: 1,
            bump,
        }
    }
}