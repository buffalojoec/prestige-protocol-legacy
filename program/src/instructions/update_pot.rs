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
    Event,
    MintControl,
    PrizePot,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct UpdatePotArgs {
    mint_control: MintControl,
    pot: u64,
}


pub fn update_pot(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: UpdatePotArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let pot = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let escrow_or_mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    assert!(
        Event::try_from_slice(&event.try_borrow_mut_data()?)?.authority == *payer.key
    );

    let original_pot_inner_data = PrizePot::try_from_slice(&pot.try_borrow_mut_data()?)?;
    let original_account_span = (original_pot_inner_data.try_to_vec()?).len();

    let new_pot_inner_data = PrizePot::new(
        args.mint_control,
        args.pot,
        *mint.key,
        *escrow_or_mint_authority.key,
        *event.key,
        original_pot_inner_data.bump,
    );
    let new_account_span = (new_pot_inner_data.try_to_vec()?).len();

    if new_account_span > original_account_span {
        let diff = (Rent::get()?).minimum_balance(new_account_span) - pot.lamports();
        invoke(
            &system_instruction::transfer(payer.key, pot.key, diff),
            &[payer.clone(), pot.clone(), system_program.clone()],
        )?;
    };
    pot.realloc(new_account_span, true)?;

    new_pot_inner_data.serialize(
        &mut &mut pot.data.borrow_mut()[..]
    )?;
    
    Ok(())
}