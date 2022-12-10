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
};
use crate::util::{
    lamports_required,
    size,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateEventArgs {
    pub event_title: String,
    pub event_description: String,
    pub event_location: String,
    pub event_host: String,
    pub event_date: String,
}


pub fn create_event(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateEventArgs,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let event = next_account_info(accounts_iter)?;
    let event_metadata = next_account_info(accounts_iter)?;
    let event_counter = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // First evaluate the Event Counter to get the Event ID

    let (event_counter_pubkey, event_counter_bump) = Pubkey::find_program_address(
        &[ EventCounter::SEED_PREFIX.as_bytes().as_ref() ],
        program_id
    );
    assert!(event_counter_pubkey == *event_counter.key);

    let event_id: u8;

    if event_counter.lamports() == 0 {
        let event_counter_inner_data = EventCounter::new(
            *payer.key,
            event_counter_bump,
        );
        let event_counter_account_span = (event_counter_inner_data.try_to_vec()?).len();
        invoke_signed(
            &system_instruction::create_account(
                &payer.key,
                &event_counter.key,
                lamports_required(event_counter_account_span),
                size(event_counter_account_span),
                program_id,
            ),
            &[
                payer.clone(), event_counter.clone(), system_program.clone()
            ],
            &[&[
                EventCounter::SEED_PREFIX.as_bytes().as_ref(),
                event_counter_inner_data.bump.to_le_bytes().as_ref(),
            ]],
        )?;
        event_counter_inner_data.serialize(
            &mut &mut event_counter.data.borrow_mut()[..]
        )?;
        event_id = event_counter_inner_data.events_count;
    } else {
        let mut event_counter_inner_data = EventCounter::try_from_slice(&event_counter.try_borrow_mut_data()?)?;
        event_counter_inner_data.events_count += 1;
        event_counter_inner_data.serialize(
            &mut &mut event_counter.data.borrow_mut()[..]
        )?;
        event_id = event_counter_inner_data.events_count;
    }

    // Now create the Event and EventMetadata

    let (event_pubkey, event_bump) = Pubkey::find_program_address(
        &[
            Event::SEED_PREFIX.as_bytes().as_ref(),
            payer.key.as_ref(),
            event_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    assert!(event_pubkey == *event.key);

    let (event_metadata_pubkey, event_metadata_bump) = Pubkey::find_program_address(
        &[
            EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
            event.key.as_ref(),
        ],
        program_id
    );
    assert!(event_metadata_pubkey == *event_metadata.key);

    let event_inner_data = Event::new(
        event_id,
        *payer.key,
        event_bump,
    );

    let event_metadata_inner_data = EventMetadata::new(
        args.event_title,
        args.event_description,
        args.event_location,
        args.event_host,
        args.event_date,
        event_metadata_bump,
    );

    let event_account_span = (event_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &event.key,
            lamports_required(event_account_span),
            size(event_account_span),
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

    let event_metadata_account_span = (event_metadata_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &event_metadata.key,
            lamports_required(event_metadata_account_span),
            size(event_metadata_account_span),
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