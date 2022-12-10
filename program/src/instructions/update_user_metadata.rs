use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
};

use crate::state::User;
use crate::util::validate_signer;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct UpdateUserMetadataArgs {
    pub name: String,
}

pub fn update_user_metadata(
    accounts: &[AccountInfo],
    args: UpdateUserMetadataArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let user = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;

    let mut user_inner_data = User::try_from_slice(
        &user.try_borrow_mut_data()?
    )?;

    validate_signer(payer)?;
    assert!(*payer.key == user_inner_data.wallet);

    user_inner_data.name = args.name;

    user_inner_data.serialize(
        &mut &mut user.data.borrow_mut()[..]
    )?;
    
    Ok(())
}