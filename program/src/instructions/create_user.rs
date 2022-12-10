use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::User;
use crate::util::{
    lamports_required,
    size,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateUserArgs {
    username: String,
}


pub fn create_user(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateUserArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let user = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (user_pubkey, user_bump) = Pubkey::find_program_address(
        &[
            User::SEED_PREFIX.as_bytes().as_ref(),
            authority.key.as_ref(),
        ],
        program_id
    );
    assert!(&user_pubkey == user.key);

    let user_inner_data = User::new(
        args.username,
        *authority.key,
        user_bump,
    );

    let account_span = (user_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &authority.key,
            &user.key,
            lamports_required(account_span),
            size(account_span),
            program_id,
        ),
        &[
            authority.clone(), user.clone(), system_program.clone()
        ],
        &[&[
            User::SEED_PREFIX.as_bytes().as_ref(),
            authority.key.as_ref(),
            user_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    user_inner_data.serialize(
        &mut &mut user.data.borrow_mut()[..]
    )?;
    
    Ok(())
}