use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{ Contract, Escrow };
use crate::util::{
    calc_lamports_required,
    calc_size,
    validate_contract_account_exists,
    validate_escrow_address
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateEscrowArgs {
    pub quantity: u64,
}

pub fn create_escrow(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateEscrowArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let escrow = next_account_info(accounts_iter)?;
    let contract = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    validate_contract_account_exists(&contract)?;
    
    let mut contract_inner_data = Contract::try_from_slice(
        &contract.try_borrow_mut_data()?
    )?;

    let escrow_id = contract_inner_data.escrows_created + 1;

    let bump = validate_escrow_address(
        &escrow.key, 
        &contract.key, 
        escrow_id,
        &program_id,
    )?;

    let escrow_inner_data = Escrow::new(
        *authority.key,
        *mint.key,
        args.quantity,
        bump,
    );
    
    let span = (escrow_inner_data.try_to_vec()?).len();
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            escrow.key,
            calc_lamports_required(span),
            calc_size(span),
            program_id,
        ),
        &[
            payer.clone(), escrow.clone(), system_program.clone()
        ],
        &[&[
            Escrow::SEED_PREFIX.as_bytes().as_ref(),
            contract.key.as_ref(),
            escrow_id.to_le_bytes().as_ref(),
            bump.to_le_bytes().as_ref(),
        ]],
    )?;

    contract_inner_data.escrows_created += 1;

    escrow_inner_data.serialize(
        &mut &mut escrow.data.borrow_mut()[..]
    )?;
    contract_inner_data.serialize(
        &mut &mut contract.data.borrow_mut()[..]
    )?;
    
    Ok(())
}