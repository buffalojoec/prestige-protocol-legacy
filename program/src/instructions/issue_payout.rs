use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    MintControl,
    PrizePot,
    Payout,
};
use crate::util::{
    lamports_required,
    mint_custom_mint,
    size,
    transfer_from_escrow,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct IssuePayoutArgs {
    amount: u64,
}


pub fn issue_payout(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: IssuePayoutArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let payout = next_account_info(accounts_iter)?;
    let pot = next_account_info(accounts_iter)?;
    let earner = next_account_info(accounts_iter)?;
    let _earner_token_account = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let _escrow_or_mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    let _token_program = next_account_info(accounts_iter)?;

    let mut pot_inner_data = PrizePot::try_from_slice(&pot.try_borrow_mut_data()?)?;
    let payout_id = pot_inner_data.payouts_count + 1;

    assert!(&pot_inner_data.mint == mint.key);

    let (payout_pubkey, payout_bump) = Pubkey::find_program_address(
        &[
            Payout::SEED_PREFIX.as_bytes().as_ref(),
            pot.key.as_ref(),
            payout_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    assert!(&payout_pubkey == payout.key);

    let payout_inner_data = Payout::new(
        *earner.key,
        *pot.key,
        args.amount,
        payout_bump,
    );

    let account_span = (payout_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &payout.key,
            lamports_required(account_span),
            size(account_span),
            program_id,
        ),
        &[
            payer.clone(), payout.clone(), system_program.clone()
        ],
        &[&[
            Payout::SEED_PREFIX.as_bytes().as_ref(),
            pot.key.as_ref(),
            payout_id.to_le_bytes().as_ref(),
            payout_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    payout_inner_data.serialize(
        &mut &mut payout.data.borrow_mut()[..]
    )?;

    pot_inner_data.payouts_count += 1;
    pot_inner_data.serialize(&mut *pot.data.borrow_mut())?;

    match pot_inner_data.mint_control {
        MintControl::Remintable => mint_custom_mint(
            program_id,
            accounts,
            args.amount,
            false,
        )?,
        MintControl::OneToOne => mint_custom_mint(
            program_id,
            accounts,
            args.amount,
            true,
        )?,
        MintControl::Escrow => transfer_from_escrow(
            program_id,
            accounts,
            args.amount,
        )?,
    };
    
    Ok(())
}