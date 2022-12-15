use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    Event,
    EventCounter,
    EventMetadata,
    PrestigeDataAccount,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateEventArgs {
    pub title: String,
    pub description: String,
    pub location: String,
    pub date: String,
    pub host: String,
    pub uri: String,
}

pub fn create_event(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateEventArgs,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let event = next_account_info(accounts_iter)?;
    let event_counter = next_account_info(accounts_iter)?;
    let event_metadata = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut event_counter_inner_data = match EventCounter::is_not_initialized(event_counter) {
        true => {
            let inner = EventCounter {
                authority: *payer.key,
                count: 0,
            };
            invoke_signed(
                &system_instruction::create_account(
                    &payer.key,
                    &event_counter.key,
                    inner.lamports_required()?,
                    inner.size()?,
                    program_id
                ),
                &[
                    payer.clone(),
                    event_counter.clone(),
                    system_program.clone(),
                ],
                &[&[
                    EventCounter::SEED_PREFIX.as_bytes().as_ref(),
                    inner.authority.as_ref(),
                    inner.bump(program_id).to_le_bytes().as_ref(),
                ]],
            )?;
            inner.serialize(
                &mut &mut event_counter.data.borrow_mut()[..]
            )?;
            inner
        },
        false => {
            let inner = EventCounter::try_from_slice(
                &event_counter.try_borrow_mut_data()?
            )?;
            inner.is_valid_pda(program_id, event_counter.key);
            inner
        },
    };

    event_counter_inner_data.count += 1;
    event_counter_inner_data.serialize(
        &mut &mut event_counter.data.borrow_mut()[..]
    )?;
    let event_id = event_counter_inner_data.count;

    let event_inner_data = Event {
        id: event_id,
        authority: *payer.key,
    };
    event_inner_data.is_valid_pda(program_id, event.key);

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &event.key,
            event_inner_data.lamports_required()?,
            event_inner_data.size()?,
            program_id
        ),
        &[
            payer.clone(),
            event.clone(),
            system_program.clone(),
        ],
        &[&[
            Event::SEED_PREFIX.as_bytes().as_ref(),
            event_inner_data.authority.as_ref(),
            event_inner_data.id.to_le_bytes().as_ref(),
            event_inner_data.bump(program_id).to_le_bytes().as_ref(),
        ]],
    )?;

    event_inner_data.serialize(
        &mut &mut event.data.borrow_mut()[..]
    )?;

    let event_metadata_inner_data = EventMetadata {
        authority: *payer.key,
        event: *event.key,
        title: args.title,
        description: args.description,
        location: args.location,
        date: args.date,
        host: args.host,
        uri: args.uri,
    };
    event_metadata_inner_data.is_valid_pda(program_id, event_metadata.key);

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &event_metadata.key,
            event_metadata_inner_data.lamports_required()?,
            event_metadata_inner_data.size()?,
            program_id
        ),
        &[
            payer.clone(),
            event_metadata.clone(),
            system_program.clone(),
        ],
        &[&[
            EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
            event_metadata_inner_data.event.as_ref(),
            event_metadata_inner_data.bump(program_id).to_le_bytes().as_ref(),
        ]],
    )?;

    event_metadata_inner_data.serialize(
        &mut &mut event_metadata.data.borrow_mut()[..]
    )?;

    Ok(())
}