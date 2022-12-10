use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::AccountInfo, 
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use crate::instructions::{ 
    create_challenge::{ CreateChallengeArgs, create_challenge },
    create_custom_mint::{ CreateCustomMintArgs, create_custom_mint },
    create_event::{ CreateEventArgs, create_event },
    create_pot::{ CreatePotArgs, create_pot },
    create_prize::{ CreatePrizeArgs, create_prize },
    create_user::{ CreateUserArgs, create_user },
    issue_payout::{ IssuePayoutArgs, issue_payout },
    issue_reward::{ IssueRewardArgs, issue_reward },
    update_challenge::{ UpdateChallengeArgs, update_challenge },
    update_event::{ UpdateEventArgs, update_event },
    update_pot::{ UpdatePotArgs, update_pot },
    update_prize::{ UpdatePrizeArgs, update_prize },
};


#[derive(BorshDeserialize, BorshSerialize)]
pub enum PrestigeProtocolInstruction {
    CreateChallenge(CreateChallengeArgs),
    CreateCustomMint(CreateCustomMintArgs),
    CreateEvent(CreateEventArgs),
    CreatePot(CreatePotArgs),
    CreatePrize(CreatePrizeArgs),
    CreateUser(CreateUserArgs),
    IssuePayout(IssuePayoutArgs),
    IssueReward(IssueRewardArgs),
    UpdateChallenge(UpdateChallengeArgs),
    UpdateEvent(UpdateEventArgs),
    UpdatePot(UpdatePotArgs),
    UpdatePrize(UpdatePrizeArgs),
}


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let instruction = PrestigeProtocolInstruction::try_from_slice(&instruction_data)?;
    
    match instruction {

        PrestigeProtocolInstruction::CreateChallenge(args) => {
            msg!("Prestige Protocol Instruction: CreateChallenge");
            return create_challenge(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::CreateCustomMint(args) => {
            msg!("Prestige Protocol Instruction: CreateCustomMint");
            return create_custom_mint(accounts, args);
        }

        PrestigeProtocolInstruction::CreateEvent(args) => {
            msg!("Prestige Protocol Instruction: CreateEvent");
            return create_event(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::CreatePot(args) => {
            msg!("Prestige Protocol Instruction: CreatePot");
            return create_pot(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::CreatePrize(args) => {
            msg!("Prestige Protocol Instruction: CreatePrize");
            return create_prize(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::CreateUser(args) => {
            msg!("Prestige Protocol Instruction: CreateUser");
            return create_user(program_id, accounts, args);
        }
        
        PrestigeProtocolInstruction::IssuePayout(args) => {
            msg!("Prestige Protocol Instruction: IssuePayout");
            return issue_payout(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::IssueReward(args) => {
            msg!("Prestige Protocol Instruction: IssueReward");
            return issue_reward(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::UpdateChallenge(args) => {
            msg!("Prestige Protocol Instruction: UpdateChallenge");
            return update_challenge(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::UpdateEvent(args) => {
            msg!("Prestige Protocol Instruction: UpdateEvent");
            return update_event(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::UpdatePot(args) => {
            msg!("Prestige Protocol Instruction: UpdatePot");
            return update_pot(program_id, accounts, args);
        }

        PrestigeProtocolInstruction::UpdatePrize(args) => {
            msg!("Prestige Protocol Instruction: UpdatePrize");
            return update_prize(program_id, accounts, args);
        }
    }
}