use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{ 
    Award, 
    AwardCounter, 
    Event,
    PrestigeDataAccount,
    PrestigeRoleAccount,
};

pub fn create_award(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let award = next_account_info(accounts_iter)?;
    let award_counter = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let challenge = next_account_info(accounts_iter)?;
    let earner = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut award_counter_inner_data = match AwardCounter::is_not_initialized(award_counter) {
        true => {
            let inner = AwardCounter {
                earner: *earner.key,
                count: 0,
            };
            invoke_signed(
                &system_instruction::create_account(
                    &payer.key,
                    &award_counter.key,
                    inner.lamports_required()?,
                    inner.size()?,
                    program_id
                ),
                &[
                    payer.clone(),
                    award_counter.clone(),
                    system_program.clone(),
                ],
                &[&[
                    AwardCounter::SEED_PREFIX.as_bytes().as_ref(),
                    inner.earner.as_ref(),
                    inner.bump(program_id).to_le_bytes().as_ref(),
                ]],
            )?;
            inner.serialize(
                &mut &mut award_counter.data.borrow_mut()[..]
            )?;
            inner
        },
        false => {
            let inner = AwardCounter::try_from_slice(
                &award_counter.try_borrow_mut_data()?
            )?;
            inner.is_valid_pda(program_id, award_counter.key);
            inner
        },
    };

    award_counter_inner_data.count += 1;
    award_counter_inner_data.serialize(
        &mut &mut award_counter.data.borrow_mut()[..]
    )?;
    let award_id = award_counter_inner_data.count;

    let event_inner_data = Event::try_from_slice(
        &event.try_borrow_mut_data()?
    )?;
    event_inner_data.is_correct_authority(payer.key);

    let award_inner_data = Award {
        id: award_id,
        authority: *payer.key,
        earner: *earner.key,
        event: *event.key,
        challenge: *challenge.key,
    };
    award_inner_data.is_valid_pda(program_id, award.key);

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &award.key,
            award_inner_data.lamports_required()?,
            award_inner_data.size()?,
            program_id
        ),
        &[
            payer.clone(),
            award.clone(),
            system_program.clone(),
        ],
        &[&[
            Award::SEED_PREFIX.as_bytes().as_ref(),
            award_inner_data.earner.as_ref(),
            award_inner_data.id.to_le_bytes().as_ref(),
            award_inner_data.bump(program_id).to_le_bytes().as_ref(),
        ]],
    )?;

    award_inner_data.serialize(
        &mut &mut award.data.borrow_mut()[..]
    )?;

    Ok(())
}