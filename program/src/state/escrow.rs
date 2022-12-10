use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Escrow {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub quantity: u64,
    pub bump: u8,
}

impl Escrow {

    pub const SEED_PREFIX: &'static str = "escrow";
    
    pub fn new(
        authority: Pubkey,
        mint: Pubkey,
        quantity: u64,
        bump: u8,
    ) -> Self {

        Escrow {
            authority,
            mint,
            quantity,
            bump,
        }
    }
}