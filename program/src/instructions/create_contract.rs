use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{ Contract, Challenge };
use crate::util::{
    calc_lamports_required,
    calc_size,
    validate_challenge_account_exists,
    validate_contract_address
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateContractArgs {
    pub expiration: String,
}

pub fn create_contract(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateContractArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let contract = next_account_info(accounts_iter)?;
    let challenge = next_account_info(accounts_iter)?;
    let earner = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    validate_challenge_account_exists(&challenge)?;
    
    let mut challenge_inner_data = Challenge::try_from_slice(
        &challenge.try_borrow_mut_data()?
    )?;

    let contract_id = challenge_inner_data.contracts_created + 1;

    let bump = validate_contract_address(
        &contract.key, 
        &challenge.key, 
        contract_id,
        &program_id,
    )?;

    let contract_inner_data = Contract::new(
        *authority.key,
        *challenge.key,
        *earner.key,
        *event.key,
        args.expiration,
        bump,
    );
    
    let span = (contract_inner_data.try_to_vec()?).len();
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            contract.key,
            calc_lamports_required(span),
            calc_size(span),
            program_id,
        ),
        &[
            payer.clone(), contract.clone(), system_program.clone()
        ],
        &[&[
            Contract::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
            contract_id.to_le_bytes().as_ref(),
            bump.to_le_bytes().as_ref(),
        ]],
    )?;

    challenge_inner_data.contracts_created += 1;

    contract_inner_data.serialize(
        &mut &mut contract.data.borrow_mut()[..]
    )?;
    challenge_inner_data.serialize(
        &mut &mut challenge.data.borrow_mut()[..]
    )?;
    
    Ok(())
}