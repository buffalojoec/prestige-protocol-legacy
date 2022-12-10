use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{ Challenge, User };
use crate::util::{
    calc_lamports_required,
    calc_size,
    validate_user_account_exists,
    validate_challenge_address
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateChallengeArgs {
    pub title: String,
    pub description: String,
    pub author_name: String,
    pub tags: String,
}

pub fn create_challenge(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateChallengeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let challenge = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    validate_user_account_exists(&authority)?;
    
    let mut user_inner_data = User::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    let challenge_id = user_inner_data.challenges_authored + 1;

    let bump = validate_challenge_address(
        &challenge.key, 
        &authority.key, 
        challenge_id,
        &program_id,
    )?;

    let challenge_inner_data = Challenge::new(
        *authority.key,
        args.title,
        args.description,
        args.author_name,
        args.tags,
        bump,
    );

    let span = (challenge_inner_data.try_to_vec()?).len();
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            challenge.key,
            calc_lamports_required(span),
            calc_size(span),
            program_id,
        ),
        &[
            payer.clone(), challenge.clone(), system_program.clone()
        ],
        &[&[
            Challenge::SEED_PREFIX.as_bytes().as_ref(),
            authority.key.as_ref(),
            challenge_id.to_le_bytes().as_ref(),
            bump.to_le_bytes().as_ref(),
        ]],
    )?;

    user_inner_data.challenges_authored += 1;

    challenge_inner_data.serialize(
        &mut &mut challenge.data.borrow_mut()[..]
    )?;
    user_inner_data.serialize(
        &mut &mut authority.data.borrow_mut()[..]
    )?;
    
    Ok(())
}