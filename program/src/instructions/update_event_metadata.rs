use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
};

use crate::state::{ Event, User };
use crate::util::validate_signer;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct UpdateEventMetadataArgs {
    pub title: String,
    pub description: String,
    pub location: String,
    pub host_name: String,
    pub date: String,
}

pub fn update_event_metadata(
    accounts: &[AccountInfo],
    args: UpdateEventMetadataArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let event = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;

    let mut event_inner_data = Event::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    let user_inner_data = User::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    validate_signer(payer)?;
    assert!(*authority.key == event_inner_data.authority);
    assert!(*payer.key == user_inner_data.wallet);

    event_inner_data.title = args.title;
    event_inner_data.description = args.description;
    event_inner_data.location = args.location;
    event_inner_data.host_name = args.host_name;
    event_inner_data.date = args.date;

    event_inner_data.serialize(
        &mut &mut event.data.borrow_mut()[..]
    )?;
    
    Ok(())
}