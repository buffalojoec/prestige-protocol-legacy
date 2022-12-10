use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;



#[derive(BorshDeserialize, BorshSerialize)]
pub struct MintAuthorityPda {
    
    pub bump: u8,
}

impl MintAuthorityPda {

    pub const SEED_PREFIX: &'static str = "mint_authority";

    pub const ACCOUNT_SPAN: u8 = 8 + 1;

    pub fn new(
        bump: u8,
    ) -> Self {

        MintAuthorityPda {
            bump,
        }
    }

    pub fn get_prestige_mint_authority_address(program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[
                MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(),
            ],
            program_id
        )
    }
}


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CustomMint {}

impl CustomMint {

    pub fn new() -> Self {

        CustomMint {}
    }
}


#[derive(BorshDeserialize, BorshSerialize)]
pub enum MintControl {
    Remintable,
    OneToOne,
    Escrow,
}