use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};

use crate::state::{
    MintControl,
};


/**
* A Prize - offered for completing a challenge - such as XP Tokens or NFT Badges.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct Prize {

    pub mint_control: MintControl,
    pub quantity: u64,
    pub mint: Pubkey,
    pub escrow_or_mint_authority: Pubkey,

    pub rewards_count: u8,

    pub challenge: Pubkey,
    pub event: Pubkey,
    pub bump: u8,
}


impl Prize {

    pub const SEED_PREFIX: &'static str = "prize";

    pub fn new(
        mint_control: MintControl,
        quantity: u64,
        mint: Pubkey,
        escrow_or_mint_authority: Pubkey,
        challenge: Pubkey,
        event: Pubkey,
        bump: u8,
    ) -> Self {

        Prize {
            mint_control,
            quantity,
            mint,
            escrow_or_mint_authority,
            rewards_count: 0,
            challenge,
            event,
            bump,
        }
    }
}