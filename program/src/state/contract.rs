use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    pub authority: Pubkey,
    pub challenge: Pubkey,
    pub earner: Pubkey,
    pub event: Pubkey,
    pub expiration: String,
    pub escrows_created: u32,
    pub status: u8, // 0: closed, 1: open, 2: fulfilled
    pub bump: u8,
}


impl Contract {

    pub const SEED_PREFIX: &'static str = "contract";
    
    pub fn new(
        authority: Pubkey,
        challenge: Pubkey,
        earner: Pubkey,
        event: Pubkey,
        expiration: String,
        bump: u8,
    ) -> Self {

        Contract {
            authority,
            challenge,
            earner,
            event,
            expiration,
            escrows_created: 0,
            status: 1,
            bump,
        }
    }
}