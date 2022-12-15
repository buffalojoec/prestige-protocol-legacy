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
    create_award::create_award,
    create_challenge::{ CreateChallengeArgs, create_challenge },
    create_event::{ CreateEventArgs, create_event },
};

#[derive(BorshDeserialize, BorshSerialize)]
pub enum PrestigeProtocolInstruction {
    CreateAward,
    CreateChallenge(CreateChallengeArgs),
    CreateEvent(CreateEventArgs),
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let instruction = PrestigeProtocolInstruction::try_from_slice(&instruction_data)?;
    
    match instruction {

        PrestigeProtocolInstruction::CreateAward => {
            msg!("Prestige Protocol Instruction: CreateAward");
            return create_award(program_id, accounts);
        },
        PrestigeProtocolInstruction::CreateChallenge(args) => {
            msg!("Prestige Protocol Instruction: CreateChallenge");
            return create_challenge(program_id, accounts, args);
        },
        PrestigeProtocolInstruction::CreateEvent(args) => {
            msg!("Prestige Protocol Instruction: CreateEvent");
            return create_event(program_id, accounts, args);
        },
    }
}