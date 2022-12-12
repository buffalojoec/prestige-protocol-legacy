use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};

use crate::state::PrestigeDataAccount;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Challenge {
    pub challenge_id: u32,
    pub authority: Pubkey,
    pub bump: u8,
}

impl PrestigeDataAccount for Challenge {
    const SEED_PREFIX: &'static str = "challenge";
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ChallengeMetadata {
    pub title: String,
    pub description: String,
    pub author: String,
    pub tags: String,
    pub uri: String,
    pub fixed_prizes: [Option<FixedPrize>; 5],
    pub bump: u8,
}

impl PrestigeDataAccount for ChallengeMetadata {
    const SEED_PREFIX: &'static str = "challenge_metadata";
}

#[derive(BorshDeserialize, BorshSerialize, Clone, Copy)]
pub struct FixedPrize {
    pub mint: Pubkey,
    pub quantity: u64,
}