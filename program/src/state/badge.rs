use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};

use crate::state::PrestigeDataAccount;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct BadgeMetadata {
    pub challenge: Pubkey,
    pub event: Pubkey,
    pub bump: u8,
}

impl PrestigeDataAccount for BadgeMetadata {
    const SEED_PREFIX: &'static str = "badge_metadata";
}

impl BadgeMetadata {
    pub fn new(
        challenge: Pubkey,
        event: Pubkey,
        bump: u8,
    ) -> Self {

        Self {
            challenge,
            event,
            bump,
        }
    }
}