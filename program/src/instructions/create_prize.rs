use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
};

use crate::state::{
    Challenge,
    MintControl,
    Prize,
};
use crate::util::{
    lamports_required,
    size,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreatePrizeArgs {
    mint_control: MintControl,
    quantity: u64,
}


pub fn create_prize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreatePrizeArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let prize = next_account_info(accounts_iter)?;
    let event = next_account_info(accounts_iter)?;
    let challenge = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let escrow_or_mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let mut challenge_inner_data = Challenge::try_from_slice(&challenge.try_borrow_mut_data()?)?;
    let prize_id = challenge_inner_data.prizes_count + 1;

    let (prize_pubkey, prize_bump) = Pubkey::find_program_address(
        &[
            Prize::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
            prize_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    assert!(&prize_pubkey == prize.key);

    let prize_inner_data = Prize::new(
        args.mint_control,
        args.quantity,
        *mint.key,
        *escrow_or_mint_authority.key,
        *challenge.key,
        *event.key,
        prize_bump,
    );

    let account_span = (prize_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &prize.key,
            lamports_required(account_span),
            size(account_span),
            program_id,
        ),
        &[
            payer.clone(), prize.clone(), system_program.clone()
        ],
        &[&[
            Prize::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
            prize_id.to_le_bytes().as_ref(),
            prize_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    prize_inner_data.serialize(
        &mut &mut prize.data.borrow_mut()[..]
    )?;

    challenge_inner_data.prizes_count += 1;
    challenge_inner_data.serialize(&mut *challenge.data.borrow_mut())?;
    
    Ok(())
}