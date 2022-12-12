pub mod create_badge;
pub mod create_challenge;
pub mod create_event;
pub mod create_user;
pub mod mint_badge;

pub use create_badge::*;
pub use create_challenge::*;
pub use create_event::*;
pub use create_user::*;
pub use mint_badge::*;

use borsh::BorshSerialize;
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    MintAuthorityPda,
    PrestigeDataAccount,
};

pub fn initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let (mint_authority_pubkey, mint_authority_bump) = Pubkey::find_program_address(
        &[
            MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(),
        ],
        program_id
    );
    assert!(&mint_authority_pubkey == mint_authority.key);

    let mint_authority_inner_data = MintAuthorityPda {
        bump: mint_authority_bump,
    };

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &mint_authority.key,
            mint_authority_inner_data.lamports_required()?,
            mint_authority_inner_data.size()?,
            program_id,
        ),
        &[
            payer.clone(), mint_authority.clone(), system_program.clone()
        ],
        &[&[
            MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(),
            mint_authority_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    mint_authority_inner_data.serialize(
        &mut &mut mint_authority.data.borrow_mut()[..]
    )?;
    
    Ok(())
}