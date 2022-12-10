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
    MintControl,
    Prize,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct UpdatePrizeArgs {
    mint_control: MintControl,
    quantity: u64,
}


pub fn update_prize(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: UpdatePrizeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let prize = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let challenge = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let escrow_or_mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    assert!(
        Challenge::try_from_slice(&challenge.try_borrow_mut_data()?)?.authority == *payer.key
    );

    let original_prize_inner_data = Prize::try_from_slice(&prize.try_borrow_mut_data()?)?;
    let original_account_span = (original_prize_inner_data.try_to_vec()?).len();

    let new_prize_inner_data = Prize::new(
        args.mint_control,
        args.quantity,
        *mint.key,
        *escrow_or_mint_authority.key,
        *challenge.key,
        *event.key,
        original_prize_inner_data.bump,
    );
    let new_account_span = (new_prize_inner_data.try_to_vec()?).len();

    if new_account_span > original_account_span {
        let diff = (Rent::get()?).minimum_balance(new_account_span) - prize.lamports();
        invoke(
            &system_instruction::transfer(payer.key, prize.key, diff),
            &[payer.clone(), prize.clone(), system_program.clone()],
        )?;
    };
    prize.realloc(new_account_span, true)?;

    new_prize_inner_data.serialize(
        &mut &mut prize.data.borrow_mut()[..]
    )?;
    
    Ok(())
}