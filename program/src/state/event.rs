use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};

use crate::state::PrestigeDataAccount;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Event {
    pub event_id: u32,
    pub authority: Pubkey,
    pub bump: u8,
}

impl PrestigeDataAccount for Event {
    const SEED_PREFIX: &'static str = "event";
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct EventMetadata {
    pub title: String,
    pub description: String,
    pub host: String,
    pub tags: String,
    pub uri: String,
    pub bump: u8,
}

impl PrestigeDataAccount for EventMetadata {
    const SEED_PREFIX: &'static str = "event_metadata";
}