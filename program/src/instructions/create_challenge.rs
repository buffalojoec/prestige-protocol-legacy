use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    // program_option::COption,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    Challenge,
    ChallengeMetadata,
    FixedPrize,
    PrestigeDataAccount,
    User,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateChallengeArgs {
    pub title: String,
    pub description: String,
    pub author: String,
    pub tags: String,
    pub uri: String,
    pub fixed_prizes: [Option<FixedPrize>; 5],
}

pub fn create_challenge(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateChallengeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let challenge = next_account_info(accounts_iter)?;
    let challenge_metadata = next_account_info(accounts_iter)?;
    let user = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut user_inner_data = User::try_from_slice(
        &user.try_borrow_mut_data()?
    )?;
    user_inner_data.challenges_authored += 1;
    user_inner_data.serialize(
        &mut &mut user.data.borrow_mut()[..]
    )?;
    let challenge_id = user_inner_data.challenges_authored;

    let (challenge_pubkey, challenge_bump) = Pubkey::find_program_address(
        &[
            Challenge::SEED_PREFIX.as_bytes().as_ref(),
            payer.key.as_ref(),
            challenge_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    assert!(&challenge_pubkey == challenge.key);

    let (challenge_metadata_pubkey, challenge_metadata_bump) = Pubkey::find_program_address(
        &[
            ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
        ],
        program_id
    );
    assert!(&challenge_metadata_pubkey == challenge_metadata.key);

    let challenge_inner_data = Challenge {
        challenge_id,
        authority: *payer.key,
        bump: challenge_bump,
    };

    let challenge_metadata_inner_data = ChallengeMetadata {
        title: args.title,
        description: args.description,
        author: args.author,
        tags: args.tags,
        uri: args.uri,
        fixed_prizes: args.fixed_prizes,
        bump: challenge_metadata_bump,
    };

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &challenge.key,
            challenge_inner_data.lamports_required()?,
            challenge_inner_data.size()?,
            program_id,
        ),
        &[
            payer.clone(), challenge.clone(), system_program.clone()
        ],
        &[&[
            Challenge::SEED_PREFIX.as_bytes().as_ref(),
            challenge_inner_data.authority.as_ref(),
            challenge_inner_data.challenge_id.to_le_bytes().as_ref(),
            challenge_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &challenge_metadata.key,
            challenge_metadata_inner_data.lamports_required()?,
            challenge_metadata_inner_data.size()?,
            program_id,
        ),
        &[
            payer.clone(), challenge_metadata.clone(), system_program.clone()
        ],
        &[&[
            ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
            challenge_metadata_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    challenge_inner_data.serialize(
        &mut &mut challenge.data.borrow_mut()[..]
    )?;

    challenge_metadata_inner_data.serialize(
        &mut &mut challenge_metadata.data.borrow_mut()[..]
    )?;
    
    Ok(())
}