use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult,
    program::{ invoke, invoke_signed },
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use spl_token::{
    instruction as token_instruction,
    state::Mint,
};
use mpl_token_metadata::{
    instruction as mpl_instruction,
};

use crate::state::{
    BadgeMetadata,
    PrestigeDataAccount,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateBadgeArgs {
    title: String,
    symbol: String,
    uri: String,
}

pub fn create_badge(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateBadgeArgs,
) -> ProgramResult {

    let accounts_iter = &mut accounts.iter();
    
    let event = next_account_info(accounts_iter)?;
    let challenge = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let mint_metadata = next_account_info(accounts_iter)?;
    let badge_metadata = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let token_metadata_program = next_account_info(accounts_iter)?;

    let (badge_metadata_pubkey, badge_metadata_bump) = Pubkey::find_program_address(
        &[
            BadgeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            mint.key.as_ref(),
        ],
        program_id
    );
    assert!(&badge_metadata_pubkey == badge_metadata.key);

    let badge_metadata_inner_data = BadgeMetadata {
        challenge: *challenge.key,
        event: *event.key,
        bump: badge_metadata_bump,
    };

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &badge_metadata.key,
            badge_metadata_inner_data.lamports_required()?,
            badge_metadata_inner_data.size()?,
            program_id,
        ),
        &[
            payer.clone(), badge_metadata.clone(), system_program.clone()
        ],
        &[&[
            BadgeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            mint.key.as_ref(),
            badge_metadata_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    badge_metadata_inner_data.serialize(
        &mut &mut badge_metadata.data.borrow_mut()[..]
    )?;

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
            0,
        )?,
        &[
            mint.clone(),
            mint_authority.clone(),
            token_program.clone(),
            rent.clone(),
        ]
    )?;

    invoke(
        &mpl_instruction::create_metadata_accounts_v3(
            *token_metadata_program.key,
            *mint_metadata.key,
            *mint.key,
            *mint_authority.key,
            *payer.key,
            *mint_authority.key,
            args.title,
            args.symbol,
            args.uri,
            None,
            0,
            true,
            false,
            None,
            None,
            None,
        ),
        &[
            mint_metadata.clone(),
            mint.clone(),
            mint_authority.clone(),
            payer.clone(),
            token_metadata_program.clone(),
            rent.clone(),
        ]
    )?;

    Ok(())
}