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
    Challenge,
    ChallengeMetadata,
    Event,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct UpdateChallengeArgs {
    pub challenge_title: String,
    pub challenge_description: String,
    pub challenge_author: String,
    pub challenge_tags: String,
}


pub fn update_challenge(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: UpdateChallengeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let challenge = next_account_info(accounts_iter)?;
    let challenge_metadata = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (challenge_metadata_pubkey, challenge_metadata_bump) = Pubkey::find_program_address(
        &[
            ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
        ],
        program_id
    );
    assert!(&challenge_metadata_pubkey == challenge_metadata.key);

    assert!(
        Event::try_from_slice(&event.try_borrow_mut_data()?)?.authority == *payer.key
    );
    assert!(
        Challenge::try_from_slice(&challenge.try_borrow_mut_data()?)?.authority == *payer.key
    );

    let original_challenge_metadata_inner_data = ChallengeMetadata::try_from_slice(&challenge_metadata.try_borrow_mut_data()?)?;
    let original_account_span = (original_challenge_metadata_inner_data.try_to_vec()?).len();

    let new_challenge_metadata_inner_data = ChallengeMetadata::new(
        args.challenge_title,
        args.challenge_description,
        args.challenge_author,
        args.challenge_tags,
        challenge_metadata_bump,
    );
    let new_account_span = (new_challenge_metadata_inner_data.try_to_vec()?).len();

    if new_account_span > original_account_span {
        let diff = (Rent::get()?).minimum_balance(new_account_span) - challenge_metadata.lamports();
        invoke(
            &system_instruction::transfer(payer.key, challenge_metadata.key, diff),
            &[payer.clone(), challenge_metadata.clone(), system_program.clone()],
        )?;
    };
    challenge_metadata.realloc(new_account_span, true)?;

    new_challenge_metadata_inner_data.serialize(
        &mut &mut challenge_metadata.data.borrow_mut()[..]
    )?;
    
    Ok(())
}