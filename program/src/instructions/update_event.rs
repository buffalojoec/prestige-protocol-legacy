use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::state::{
    Event,
    EventMetadata,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct UpdateEventArgs {
    pub event_title: String,
    pub event_description: String,
    pub event_location: String,
    pub event_host: String,
    pub event_date: String,
}


pub fn update_event(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: UpdateEventArgs,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let event = next_account_info(accounts_iter)?;
    let event_metadata = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (event_metadata_pubkey, event_metadata_bump) = Pubkey::find_program_address(
        &[
            EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
            event.key.as_ref(),
        ],
        program_id
    );
    assert!(event_metadata_pubkey == *event_metadata.key);

    assert!(
        Event::try_from_slice(&event.try_borrow_mut_data()?)?.authority == *payer.key
    );

    let original_event_metadata_inner_data = EventMetadata::try_from_slice(&event_metadata.try_borrow_mut_data()?)?;
    let original_account_span = (original_event_metadata_inner_data.try_to_vec()?).len();

    let new_event_metadata_inner_data = EventMetadata::new(
        args.event_title,
        args.event_description,
        args.event_location,
        args.event_host,
        args.event_date,
        event_metadata_bump,
    );
    let new_account_span = (new_event_metadata_inner_data.try_to_vec()?).len();

    if new_account_span > original_account_span {
        let diff = (Rent::get()?).minimum_balance(new_account_span) - event_metadata.lamports();
        invoke(
            &system_instruction::transfer(payer.key, event_metadata.key, diff),
            &[payer.clone(), event_metadata.clone(), system_program.clone()],
        )?;
    };
    event_metadata.realloc(new_account_span, true)?;

    new_event_metadata_inner_data.serialize(
        &mut &mut event_metadata.data.borrow_mut()[..]
    )?;
    
    Ok(())
}