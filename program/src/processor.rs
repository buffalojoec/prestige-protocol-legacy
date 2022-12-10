use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::AccountInfo, 
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use crate::instructions::{ 
    close_challenge::{ close_challenge },
    close_contract::{ close_contract },
    create_challenge::{ CreateChallengeArgs, create_challenge },
    create_contract::{ CreateContractArgs, create_contract },
    create_escrow::{ CreateEscrowArgs, create_escrow },
    create_event::{ CreateEventArgs, create_event },
    create_user::{ CreateUserArgs, create_user },
    fulfill_contract::{ fulfill_contract },
    update_challenge_metadata::{ UpdateChallengeMetadataArgs, update_challenge_metadata },
    update_event_metadata::{ UpdateEventMetadataArgs, update_event_metadata },
    update_user_metadata::{ UpdateUserMetadataArgs, update_user_metadata },
};

#[derive(BorshDeserialize, BorshSerialize)]
pub enum PrestigeProtocolInstruction {
    CloseChallenge,
    CloseContract,
    CreateChallenge(CreateChallengeArgs),
    CreateContract(CreateContractArgs),
    CreateEscrow(CreateEscrowArgs),
    CreateEvent(CreateEventArgs),
    CreateUser(CreateUserArgs),
    FulfillContract,
    UpdateChallengeMetadata(UpdateChallengeMetadataArgs),
    UpdateEventMetadata(UpdateEventMetadataArgs),
    UpdateUserMetadata(UpdateUserMetadataArgs),
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let instruction = PrestigeProtocolInstruction::try_from_slice(&instruction_data)?;
    match instruction {
        PrestigeProtocolInstruction::CloseChallenge => {
            msg!("Prestige Protocol Instruction: CloseChallenge");
            return close_challenge(accounts);
        }
        PrestigeProtocolInstruction::CloseContract => {
            msg!("Prestige Protocol Instruction: CloseContract");
            return close_contract(accounts);
        }
        PrestigeProtocolInstruction::CreateChallenge(args) => {
            msg!("Prestige Protocol Instruction: CreateChallenge");
            return create_challenge(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateContract(args) => {
            msg!("Prestige Protocol Instruction: CreateContract");
            return create_contract(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateEscrow(args) => {
            msg!("Prestige Protocol Instruction: CreateEscrow");
            return create_escrow(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateEvent(args) => {
            msg!("Prestige Protocol Instruction: CreateEvent");
            return create_event(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::CreateUser(args) => {
            msg!("Prestige Protocol Instruction: CreateUser");
            return create_user(program_id, accounts, args);
        }
        PrestigeProtocolInstruction::FulfillContract => {
            msg!("Prestige Protocol Instruction: FulfillContract");
            return fulfill_contract(accounts);
        }
        PrestigeProtocolInstruction::UpdateChallengeMetadata(args) => {
            msg!("Prestige Protocol Instruction: UpdateChallengeMetadata");
            return update_challenge_metadata(accounts, args);
        }
        PrestigeProtocolInstruction::UpdateEventMetadata(args) => {
            msg!("Prestige Protocol Instruction: UpdateEventMetadata");
            return update_event_metadata(accounts, args);
        }
        PrestigeProtocolInstruction::UpdateUserMetadata(args) => {
            msg!("Prestige Protocol Instruction: UpdateUserMetadata");
            return update_user_metadata(accounts, args);
        }
    }
}