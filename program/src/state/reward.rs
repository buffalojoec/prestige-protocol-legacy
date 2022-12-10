use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};


/**
* Reward: A record of the issuance of a prize to a specific wallet.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct Reward {

    pub earner: Pubkey,
    pub prize: Pubkey,
    pub bump: u8,
}


impl Reward {

    pub const SEED_PREFIX: &'static str = "reward";

    pub fn new(
        earner: Pubkey,
        prize: Pubkey,
        bump: u8,
    ) -> Self {

        Reward {
            earner,
            prize,
            bump,
        }
    }
}