use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

use crate::state::PrestigeDataAccount;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct User {
    pub challenges_authored: u32,
    pub events_hosted: u32,
    pub username: String,
    pub authority: Pubkey,
    pub bump: u8,
}

impl PrestigeDataAccount for User {
    const SEED_PREFIX: &'static str = "user";
}