pub mod badge;
pub mod challenge;
pub mod event;
pub mod user;

pub use badge::*;
pub use challenge::*;
pub use event::*;
pub use user::*;

use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::sysvar::{
    rent::Rent,
    Sysvar,
};
use std::io::Result;

pub trait PrestigeDataAccount: borsh::ser::BorshSerialize {

    const SEED_PREFIX: &'static str;

    fn span(&self) -> Result<usize> {
        Ok((self.try_to_vec()?).len())
    }

    fn lamports_required(&self) -> Result<u64> {
        Ok((Rent::get().unwrap()).minimum_balance(self.span()?))
    }
    
    fn size(&self) -> Result<u64> {
        Ok(self.span()?.try_into().unwrap())
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct MintAuthorityPda {    
    pub bump: u8,
}

impl PrestigeDataAccount for MintAuthorityPda {
    const SEED_PREFIX: &'static str = "mint_authority";
}