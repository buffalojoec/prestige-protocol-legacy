use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};


/**
* Payout: A record of the issuance of part of a pot to a specific wallet.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct Payout {

    pub earner: Pubkey,
    pub pot: Pubkey,
    pub amount: u64,
    pub bump: u8,
}


impl Payout {

    pub const SEED_PREFIX: &'static str = "payout";

    pub fn new(
        earner: Pubkey,
        pot: Pubkey,
        amount: u64,
        bump: u8,
    ) -> Self {

        Payout {
            earner,
            pot,
            amount,
            bump,
        }
    }
}