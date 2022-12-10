use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;


/**
* A User.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct User {

    pub username: String,
    pub authority: Pubkey,
    pub bump: u8,
}


impl User {

    pub const SEED_PREFIX: &'static str = "user";
    
    pub fn new(
        username: String,
        authority: Pubkey,
        bump: u8,
    ) -> Self {

        User {
            username,
            authority,
            bump,
        }
    }
}