use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};

use crate::state::{
    MintControl,
};


/**
* A PrizePot - offered for an event as a pot for dynamic payouts.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct PrizePot {

    pub mint_control: MintControl,
    pub pot: u64,
    pub mint: Pubkey,
    pub escrow_or_mint_authority: Pubkey,

    pub payouts_count: u8,

    pub event: Pubkey,
    pub bump: u8,
}


impl PrizePot {

    pub const SEED_PREFIX: &'static str = "prize_pot";

    pub fn new(
        mint_control: MintControl,
        pot: u64,
        mint: Pubkey,
        escrow_or_mint_authority: Pubkey,
        event: Pubkey,
        bump: u8,
    ) -> Self {

        PrizePot {
            mint_control,
            pot,
            mint,
            escrow_or_mint_authority,
            payouts_count: 0,
            event,
            bump,
        }
    }
}