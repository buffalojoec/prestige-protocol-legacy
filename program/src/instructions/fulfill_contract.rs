use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
};

use crate::state::{ Contract, User };
use crate::util::validate_signer;

pub fn fulfill_contract(accounts: &[AccountInfo]) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let contract = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;

    let mut contract_inner_data = Contract::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    let user_inner_data = User::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    validate_signer(payer)?;
    assert!(*authority.key == contract_inner_data.authority);
    assert!(*payer.key == user_inner_data.wallet);

    // Transfer rewards!

    contract_inner_data.status = 2;

    contract_inner_data.serialize(
        &mut &mut contract.data.borrow_mut()[..]
    )?;
    
    Ok(())
}