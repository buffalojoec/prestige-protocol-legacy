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
    Prize,
    Reward,
};
use crate::util::{
    lamports_required,
    mint_custom_mint,
    size,
    transfer_from_escrow,
};


#[derive(BorshDeserialize, BorshSerialize)]
pub struct IssueRewardArgs {}


pub fn issue_reward(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _args: IssueRewardArgs,
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let reward = next_account_info(accounts_iter)?;
    let prize = next_account_info(accounts_iter)?;
    let earner = next_account_info(accounts_iter)?;
    let _earner_token_account = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let _escrow_or_mint_authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    let _token_program = next_account_info(accounts_iter)?;

    let mut prize_inner_data = Prize::try_from_slice(&prize.try_borrow_mut_data()?)?;
    let reward_id = prize_inner_data.rewards_count + 1;

    assert!(&prize_inner_data.mint == mint.key);

    let (reward_pubkey, reward_bump) = Pubkey::find_program_address(
        &[
            Reward::SEED_PREFIX.as_bytes().as_ref(),
            prize.key.as_ref(),
            reward_id.to_le_bytes().as_ref(),
        ],
        program_id
    );
    assert!(&reward_pubkey == reward.key);

    let reward_inner_data = Reward::new(
        *earner.key,
        *prize.key,
        reward_bump,
    );

    let account_span = (reward_inner_data.try_to_vec()?).len();

    invoke_signed(
        &system_instruction::create_account(
            &payer.key,
            &reward.key,
            lamports_required(account_span),
            size(account_span),
            program_id,
        ),
        &[
            payer.clone(), reward.clone(), system_program.clone()
        ],
        &[&[
            Reward::SEED_PREFIX.as_bytes().as_ref(),
            prize.key.as_ref(),
            reward_id.to_le_bytes().as_ref(),
            reward_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;

    reward_inner_data.serialize(
        &mut &mut reward.data.borrow_mut()[..]
    )?;

    prize_inner_data.rewards_count += 1;
    prize_inner_data.serialize(&mut *prize.data.borrow_mut())?;

    match prize_inner_data.mint_control {
        MintControl::Remintable => mint_custom_mint(
            program_id,
            accounts,
            prize_inner_data.quantity,
            false,
        )?,
        MintControl::OneToOne => mint_custom_mint(
            program_id,
            accounts,
            prize_inner_data.quantity,
            true,
        )?,
        MintControl::Escrow => transfer_from_escrow(
            program_id,
            accounts,
            prize_inner_data.quantity,
        )?,
    };
    
    Ok(())
}