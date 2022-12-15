use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    Challenge,
    ChallengeCounter,
    ChallengeMetadata,
    PrestigeDataAccount,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateChallengeArgs {
    pub title: String,
    pub description: String,
    pub tags: String,
    pub author: String,
    pub uri: String,
}

pub fn create_challenge(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateChallengeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let challenge = next_account_info(accounts_iter)?;
    let challenge_counter = next_account_info(accounts_iter)?;
    let challenge_metadata = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut challenge_counter_inner_data = match ChallengeCounter::is_not_initialized(challenge_counter) {
        true => {
            let inner = ChallengeCounter {
                authority: *payer.key,
                count: 0,
            };
            invoke_signed(
                &system_instruction::create_account(
                    &payer.key,
                    &challenge_counter.key,
                    inner.lamports_required()?,
                    inner.size()?,
                    program_id
                ),
                &[
                    payer.clone(),
                    challenge_counter.clone(),
                    system_program.clone(),
                ],
                &[&[
                    ChallengeCounter::SEED_PREFIX.as_bytes().as_ref(),
                    inner.authority.as_ref(),
                    inner.bump(program_id).to_le_bytes().as_ref(),
                ]],
            )?;
            inner.serialize(
                &mut &mut challenge_counter.data.borrow_mut()[..]
            )?;
            inner
        },
        false => {
            let inner = ChallengeCounter::try_from_slice(
                &challenge_counter.try_borrow_mut_data()?
            )?;
            inner.is_valid_pda(program_id, challenge_counter.key);
            inner
        },
    };

    challenge_counter_inner_data.count += 1;
    challenge_counter_inner_data.serialize(
        &mut &mut challenge_counter.data.borrow_mut()[..]
    )?;
    let challenge_id = challenge_counter_inner_data.count;

    let challenge_inner_data = Challenge {
        id: challenge_id,
        authority: *payer.key,
    };
    challenge_inner_data.is_valid_pda(program_id, challenge.key);

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &challenge.key,
            challenge_inner_data.lamports_required()?,
            challenge_inner_data.size()?,
            program_id
        ),
        &[
            payer.clone(),
            challenge.clone(),
            system_program.clone(),
        ],
        &[&[
            Challenge::SEED_PREFIX.as_bytes().as_ref(),
            challenge_inner_data.authority.as_ref(),
            challenge_inner_data.id.to_le_bytes().as_ref(),
            challenge_inner_data.bump(program_id).to_le_bytes().as_ref(),
        ]],
    )?;

    challenge_inner_data.serialize(
        &mut &mut challenge.data.borrow_mut()[..]
    )?;

    let challenge_metadata_inner_data = ChallengeMetadata {
        authority: *payer.key,
        challenge: *challenge.key,
        title: args.title,
        description: args.description,
        tags: args.tags,
        author: args.author,
        uri: args.uri,
    };
    challenge_metadata_inner_data.is_valid_pda(program_id, challenge_metadata.key);

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &challenge_metadata.key,
            challenge_metadata_inner_data.lamports_required()?,
            challenge_metadata_inner_data.size()?,
            program_id
        ),
        &[
            payer.clone(),
            challenge_metadata.clone(),
            system_program.clone(),
        ],
        &[&[
            ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            challenge_metadata_inner_data.challenge.as_ref(),
            challenge_metadata_inner_data.bump(program_id).to_le_bytes().as_ref(),
        ]],
    )?;

    challenge_metadata_inner_data.serialize(
        &mut &mut challenge_metadata.data.borrow_mut()[..]
    )?;

    Ok(())
}