use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    Event,
    MintControl,
    PrizePot,
};
use crate::util::{
    lamports_required,
    size,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreatePotArgs {
    mint_control: MintControl,
    pot: u64,
}


pub fn create_pot(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreatePotArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let pot = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let escrow_or_mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut event_inner_data = Event::try_from_slice(&event.try_borrow_mut_data()?)?;
    let pot_id = event_inner_data.pots_count + 1;

    let (pot_pubkey, pot_bump) = Pubkey::find_program_address(
        &[
            PrizePot::SEED_PREFIX.as_bytes().as_ref(),
            event.key.as_ref(),
            pot_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    assert!(&pot_pubkey == pot.key);

    let pot_inner_data = PrizePot::new(
        args.mint_control,
        args.pot,
        *mint.key,
        *escrow_or_mint_authority.key,
        *event.key,
        pot_bump,
    );

    let account_span = (pot_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &pot.key,
            lamports_required(account_span),
            size(account_span),
            program_id,
        ),
        &[
            payer.clone(), pot.clone(), system_program.clone()
        ],
        &[&[
            PrizePot::SEED_PREFIX.as_bytes().as_ref(),
            event.key.as_ref(),
            pot_id.to_le_bytes().as_ref(),
            pot_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    pot_inner_data.serialize(
        &mut &mut pot.data.borrow_mut()[..]
    )?;

    event_inner_data.pots_count += 1;
    event_inner_data.serialize(&mut *event.data.borrow_mut())?;
    
    Ok(())
}