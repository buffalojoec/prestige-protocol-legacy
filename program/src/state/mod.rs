pub mod award;
pub mod challenge;
pub mod event;

pub use award::*;
pub use challenge::*;
pub use event::*;

use solana_program::{
    account_info::AccountInfo,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
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

    fn bump(&self, program_id: &Pubkey) -> u8;

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey);

    fn is_not_initialized(account: &AccountInfo) -> bool {
        account.lamports() == 0
    }
}

pub trait PrestigeRoleAccount {
    fn is_correct_authority(&self, address: &Pubkey);
}