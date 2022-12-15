use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    Event,
    EventMetadata,
    PrestigeDataAccount,
    User,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateEventArgs {
    pub title: String,
    pub description: String,
    pub host: String,
    pub tags: String,
    pub uri: String,
}

pub fn create_event(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateEventArgs,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let event = next_account_info(accounts_iter)?;
    let event_metadata = next_account_info(accounts_iter)?;
    let user = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut user_inner_data = User::try_from_slice(
        &user.try_borrow_mut_data()?
    )?;
    user_inner_data.events_hosted += 1;
    user_inner_data.serialize(
        &mut &mut user.data.borrow_mut()[..]
    )?;
    let event_id = user_inner_data.events_hosted;

    let (event_pubkey, event_bump) = Pubkey::find_program_address(
        &[
            Event::SEED_PREFIX.as_bytes().as_ref(),
            payer.key.as_ref(),
            event_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    msg!(" EVENT PDA : {}", event_pubkey);
    assert!(event_pubkey == *event.key);

    let (event_metadata_pubkey, event_metadata_bump) = Pubkey::find_program_address(
        &[
            EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
            event.key.as_ref(),
        ],
        program_id
    );
    assert!(event_metadata_pubkey == *event_metadata.key);

    let event_inner_data = Event {
        event_id,
        authority: *payer.key,
        bump: event_bump,
    };

    let event_metadata_inner_data = EventMetadata {
        title: args.title,
        description: args.description,
        host: args.host,
        tags: args.tags,
        uri: args.uri,
        bump: event_metadata_bump,
    };

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &event.key,
            event_inner_data.lamports_required()?,
            event_inner_data.size()?,
            program_id,
        ),
        &[
            payer.clone(), event.clone(), system_program.clone()
        ],
        &[&[
            Event::SEED_PREFIX.as_bytes().as_ref(),
            event_inner_data.authority.as_ref(),
            event_inner_data.event_id.to_le_bytes().as_ref(),
            event_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &event_metadata.key,
            event_metadata_inner_data.lamports_required()?,
            event_metadata_inner_data.size()?,
            program_id,
        ),
        &[
            payer.clone(), event_metadata.clone(), system_program.clone()
        ],
        &[&[
            EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
            event.key.as_ref(),
            event_metadata_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    event_inner_data.serialize(
        &mut &mut event.data.borrow_mut()[..]
    )?;

    event_metadata_inner_data.serialize(
        &mut &mut event_metadata.data.borrow_mut()[..]
    )?;
    
    Ok(())
}