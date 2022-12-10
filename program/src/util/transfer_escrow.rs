use {
    solana_program::{
        account_info::{ AccountInfo, next_account_info }, 
        entrypoint::ProgramResult, 
        program::invoke,
        pubkey::Pubkey,
    },
    spl_token::{
        instruction as token_instruction,
    },
};


pub fn transfer_from_escrow(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let _reward = next_account_info(accounts_iter)?;
    let _prize = next_account_info(accounts_iter)?;
    let _earner = next_account_info(accounts_iter)?;
    let earner_token_account = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let escrow = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let _system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    invoke(
        &token_instruction::transfer(
            &token_program.key,
            &escrow.key,
            &earner_token_account.key,
            &payer.key,
            &[&payer.key],
            amount,
        )?,
        &[
            mint.clone(),
            escrow.clone(),
            earner_token_account.clone(),
            payer.clone(),
            token_program.clone(),
        ]
    )?;

    Ok(())
}