use borsh::{ BorshDeserialize, BorshSerialize };
use {
    solana_program::{
        account_info::{next_account_info, AccountInfo}, 
        entrypoint::ProgramResult,
        program::invoke,
        program_pack::Pack,
        rent::Rent,
        system_instruction,
        sysvar::Sysvar,
    },
    spl_token::{
        instruction as token_instruction,
        state::Mint,
    },
    mpl_token_metadata::{
        instruction as mpl_instruction,
    },
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateCustomMintArgs {
    token_title: String,
    token_symbol: String,
    token_uri: String,
    decimals: u8,
}


pub fn create_custom_mint(
    accounts: &[AccountInfo],
    args: CreateCustomMintArgs,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let mint = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let metadata = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let token_metadata_program = next_account_info(accounts_iter)?;

    invoke(
        &system_instruction::create_account(
            &payer.key,
            &mint.key,
            (Rent::get()?).minimum_balance(Mint::LEN),
            Mint::LEN as u64,
            &token_program.key,
        ),
        &[
            payer.clone(),
            mint.clone(),
            system_program.clone(),
        ],
    )?;

    invoke(
        &token_instruction::initialize_mint(
            &token_program.key,
            &mint.key,
            &mint_authority.key,
            Some(&mint_authority.key),
            args.decimals,
        )?,
        &[
            mint.clone(),
            mint_authority.clone(),
            token_program.clone(),
            rent.clone(),
        ]
    )?;

    invoke(
        &mpl_instruction::create_metadata_accounts_v2(
            *token_metadata_program.key,
            *metadata.key,
            *mint.key,
            *mint_authority.key,
            *payer.key,
            *mint_authority.key,
            args.token_title,
            args.token_symbol,
            args.token_uri,
            None,
            0,
            true,
            false,
            None,
            None,
        ),
        &[
            metadata.clone(),
            mint.clone(),
            mint_authority.clone(),
            payer.clone(),
            token_metadata_program.clone(),
            rent.clone(),
        ]
    )?;

    Ok(())
}