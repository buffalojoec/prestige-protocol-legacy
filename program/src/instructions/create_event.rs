use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{ Event, User };
use crate::util::{
    calc_lamports_required,
    calc_size,
    validate_event_address,
    validate_user_account_exists,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateEventArgs {
    pub title: String,
    pub description: String,
    pub location: String,
    pub host_name: String,
    pub date: String,
}

pub fn create_event(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateEventArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let event = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    validate_user_account_exists(&authority)?;
    
    let mut user_inner_data = User::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    let event_id = user_inner_data.events_hosted + 1;

    let bump = validate_event_address(
        &event.key, 
        &authority.key, 
        event_id,
        &program_id,
    )?;

    let event_inner_data = Event::new(
        *authority.key,
        args.title,
        args.description,
        args.location,
        args.host_name,
        args.date,
        bump,
    );
    
    let span = (event_inner_data.try_to_vec()?).len();
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            event.key,
            calc_lamports_required(span),
            calc_size(span),
            program_id,
        ),
        &[
            payer.clone(), event.clone(), system_program.clone()
        ],
        &[&[
            Event::SEED_PREFIX.as_bytes().as_ref(),
            authority.key.as_ref(),
            event_id.to_le_bytes().as_ref(),
            bump.to_le_bytes().as_ref(),
        ]],
    )?;

    user_inner_data.events_hosted += 1;

    event_inner_data.serialize(
        &mut &mut event.data.borrow_mut()[..]
    )?;
    user_inner_data.serialize(
        &mut &mut authority.data.borrow_mut()[..]
    )?;
    
    Ok(())
}