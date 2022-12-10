use borsh::BorshDeserialize;
use {
    solana_program::{
        account_info::{AccountInfo, next_account_info},
        entrypoint::ProgramResult, 
        program::{invoke, invoke_signed},
        pubkey::Pubkey,
    },
    spl_token::{
        instruction as token_instruction,
    },
};

use crate::state::MintAuthorityPda;


pub fn mint_custom_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    quantity: u64,
    close_minting: bool,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();

    let _reward = next_account_info(accounts_iter)?;
    let _prize = next_account_info(accounts_iter)?;
    let _earner = next_account_info(accounts_iter)?;
    let earner_token_account = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let _payer = next_account_info(accounts_iter)?;
    let _system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;

    let ix_mint_to = &token_instruction::mint_to(
        &token_program.key,
        &mint.key,
        &earner_token_account.key,
        &mint_authority.key,
        &[&mint_authority.key],
        quantity,
    )?;
    let accts_mint_to = &[
        mint.clone(),
        mint_authority.clone(),
        earner_token_account.clone(),
        token_program.clone(),
    ];

    let ix_set_authority = &token_instruction::set_authority(
        &token_program.key,
        &mint.key,
        None,
        token_instruction::AuthorityType::MintTokens,
        &mint_authority.key,
        &[&mint_authority.key],
    )?;
    let accts_set_authority = &[
        mint.clone(),
        mint_authority.clone(),
        token_program.clone(),
    ];

    if MintAuthorityPda::get_prestige_mint_authority_address(program_id).0 == *mint_authority.key {

        let mint_authority_inner_data = MintAuthorityPda::try_from_slice(
            &mint_authority.try_borrow_data()?
        )?;
        let mint_authority_bump = mint_authority_inner_data.bump;

        invoke_signed(
            ix_mint_to,
            accts_mint_to,
            &[&[
                MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                &[mint_authority_bump],
            ]]
        )?;

        if close_minting {
            invoke_signed(
                ix_set_authority,
                accts_set_authority,
                &[&[
                    MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(), 
                    &[mint_authority_bump],
                ]]
            )?;
        };

    } else {

        invoke(
            ix_mint_to,
            accts_mint_to,
        )?;

        if close_minting {
            invoke(
                ix_set_authority,
                accts_set_authority,
            )?;
        };
    }

    Ok(())
}
