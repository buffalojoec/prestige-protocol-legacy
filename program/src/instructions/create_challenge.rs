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
};
use crate::util::{
    lamports_required,
    size,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateChallengeArgs {
    pub challenge_title: String,
    pub challenge_description: String,
    pub challenge_author: String,
    pub challenge_tags: String,
}


pub fn create_challenge(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateChallengeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let challenge = next_account_info(accounts_iter)?;
    let challenge_metadata = next_account_info(accounts_iter)?;
    let challenge_counter = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // First evaluate the Challenge Counter to get the Challenge ID

    let (challenge_counter_pubkey, challenge_counter_bump) = Pubkey::find_program_address(
        &[ ChallengeCounter::SEED_PREFIX.as_bytes().as_ref() ],
        program_id
    );
    assert!(challenge_counter_pubkey == *challenge_counter.key);

    let challenge_id: u8;

    if challenge_counter.lamports() == 0 {
        let challenge_counter_inner_data = ChallengeCounter::new(
            *payer.key,
            challenge_counter_bump,
        );
        let challenge_counter_account_span = (challenge_counter_inner_data.try_to_vec()?).len();
        invoke_signed(
            &system_instruction::create_account(
                &payer.key,
                &challenge_counter.key,
                lamports_required(challenge_counter_account_span),
                size(challenge_counter_account_span),
                program_id,
            ),
            &[
                payer.clone(), challenge_counter.clone(), system_program.clone()
            ],
            &[&[
                ChallengeCounter::SEED_PREFIX.as_bytes().as_ref(),
                challenge_counter_inner_data.bump.to_le_bytes().as_ref(),
            ]],
        )?;
        challenge_counter_inner_data.serialize(
            &mut &mut challenge_counter.data.borrow_mut()[..]
        )?;
        challenge_id = challenge_counter_inner_data.challenges_count;
    } else {
        let mut challenge_counter_inner_data = ChallengeCounter::try_from_slice(&challenge_counter.try_borrow_mut_data()?)?;
        challenge_counter_inner_data.challenges_count += 1;
        challenge_counter_inner_data.serialize(
            &mut &mut challenge_counter.data.borrow_mut()[..]
        )?;
        challenge_id = challenge_counter_inner_data.challenges_count;
    }

    // Now create the Challenge and ChallengeMetadata

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

    let challenge_inner_data = Challenge::new(
        challenge_id,
        *payer.key,
        challenge_bump,
    );

    let challenge_metadata_inner_data = ChallengeMetadata::new(
        args.challenge_title,
        args.challenge_description,
        args.challenge_author,
        args.challenge_tags,
        challenge_metadata_bump,
    );

    let challenge_account_span = (challenge_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &challenge.key,
            lamports_required(challenge_account_span),
            size(challenge_account_span),
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

    let challenge_metadata_account_span = (challenge_metadata_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &challenge_metadata.key,
            lamports_required(challenge_metadata_account_span),
            size(challenge_metadata_account_span),
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