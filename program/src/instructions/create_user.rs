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
    calc_lamports_required,
    calc_size,
    validate_user_address,
    validate_wallet_exists,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateUserArgs {
    pub name: String,
}

pub fn create_user(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateUserArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let user = next_account_info(accounts_iter)?;
    let wallet = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    validate_wallet_exists(&wallet)?;

    let bump = validate_user_address(
        &user.key, 
        &wallet.key,
        &program_id,
    )?;

    let user_inner_data = User::new(
        *wallet.key,
        args.name,
        bump,
    );
    
    let span = (user_inner_data.try_to_vec()?).len();
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            user.key,
            calc_lamports_required(span),
            calc_size(span),
            program_id,
        ),
        &[
            payer.clone(), user.clone(), system_program.clone()
        ],
        &[&[
            User::SEED_PREFIX.as_bytes().as_ref(),
            wallet.key.as_ref(),
            bump.to_le_bytes().as_ref(),
        ]],
    )?;

    user_inner_data.serialize(
        &mut &mut user.data.borrow_mut()[..]
    )?;
    
    Ok(())
}