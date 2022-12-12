/**
*
* Prestige Protocol
*
*/
pub mod instructions;
pub mod state;

use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::AccountInfo, 
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use crate::instructions::{ 
    create_badge::{ CreateBadgeArgs, create_badge },
    create_challenge::{ CreateChallengeArgs, create_challenge },
    create_event::{ CreateEventArgs, create_event },
    create_user::{ CreateUserArgs, create_user },
    mint_badge::mint_badge,
    initialize,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub enum PrestigeProtocolInstruction {
    CreateBadge(CreateBadgeArgs),
    CreateChallenge(CreateChallengeArgs),
    CreateEvent(CreateEventArgs),
    CreateUser(CreateUserArgs),
    MintBadge,
    Initialize,
}

entrypoint!(process_instruction);

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {

    let instruction = PrestigeProtocolInstruction::try_from_slice(&instruction_data)?;
    
    match instruction {
        PrestigeProtocolInstruction::CreateBadge(args) => {
            msg!("Prestige Protocol Instruction: CreateBadge");
            return create_badge(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateChallenge(args) => {
            msg!("Prestige Protocol Instruction: CreateChallenge");
            return create_challenge(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateEvent(args) => {
            msg!("Prestige Protocol Instruction: CreateEvent");
            return create_event(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateUser(args) => {
            msg!("Prestige Protocol Instruction: CreateUser");
            return create_user(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::MintBadge => {
            msg!("Prestige Protocol Instruction: MintBadge");
            return mint_badge(program_id, accounts);
        }
        PrestigeProtocolInstruction::Initialize => {
            msg!("Prestige Protocol Instruction: Initialize");
            return initialize(program_id, accounts);
        }
    }
}