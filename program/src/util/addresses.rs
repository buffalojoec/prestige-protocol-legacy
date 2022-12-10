use solana_program::{
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::state::{ 
    Challenge,
    Contract,
    Escrow,
    Event,
    User,
};

pub fn validate_challenge_address<'a>(
    challenge: &Pubkey,
    authority: &'a Pubkey,
    challenge_id: u32,
    program_id: &Pubkey,
) -> Result<u8, ProgramError> {

    let (derived_pubkey, derived_bump) = Pubkey::find_program_address(
        &[
            Challenge::SEED_PREFIX.as_bytes().as_ref(),
            authority.as_ref(),
            challenge_id.to_le_bytes().as_ref(),
        ],
        program_id,
    );
    if &derived_pubkey != challenge {
        msg!("[Err]: Challenge pubkey provided is invalid.");
        return Err(ProgramError::InvalidSeeds)
    };
    Ok(derived_bump)
}

pub fn validate_contract_address<'a>(
    contract: &Pubkey,
    challenge: &'a Pubkey,
    contract_id: u32,
    program_id: &Pubkey,
) -> Result<u8, ProgramError> {

    let (derived_pubkey, derived_bump) = Pubkey::find_program_address(
        &[
            Contract::SEED_PREFIX.as_bytes().as_ref(),
            challenge.as_ref(),
            contract_id.to_le_bytes().as_ref(),
        ],
        program_id,
    );
    if &derived_pubkey != contract {
        msg!("[Err]: Contract pubkey provided is invalid.");
        return Err(ProgramError::InvalidSeeds)
    };
    Ok(derived_bump)
}

pub fn validate_escrow_address<'a>(
    escrow: &Pubkey,
    contract: &'a Pubkey,
    escrow_id: u32,
    program_id: &Pubkey,
) -> Result<u8, ProgramError> {

    let (derived_pubkey, derived_bump) = Pubkey::find_program_address(
        &[
            Escrow::SEED_PREFIX.as_bytes().as_ref(),
            contract.as_ref(),
            escrow_id.to_le_bytes().as_ref(),
        ],
        program_id,
    );
    if &derived_pubkey != escrow {
        msg!("[Err]: Escrow pubkey provided is invalid.");
        return Err(ProgramError::InvalidSeeds)
    };
    Ok(derived_bump)
}

pub fn validate_event_address<'a>(
    event: &Pubkey,
    authority: &'a Pubkey,
    event_id: u32,
    program_id: &Pubkey,
) -> Result<u8, ProgramError> {

    let (derived_pubkey, derived_bump) = Pubkey::find_program_address(
        &[
            Event::SEED_PREFIX.as_bytes().as_ref(),
            authority.as_ref(),
            event_id.to_le_bytes().as_ref(),
        ],
        program_id,
    );
    if &derived_pubkey != event {
        msg!("[Err]: Escrow pubkey provided is invalid.");
        return Err(ProgramError::InvalidSeeds)
    };
    Ok(derived_bump)
}

pub fn validate_user_address<'a>(
    user: &Pubkey,
    wallet: &'a Pubkey,
    program_id: &Pubkey,
) -> Result<u8, ProgramError> {

    let (derived_pubkey, derived_bump) = Pubkey::find_program_address(
        &[
            User::SEED_PREFIX.as_bytes().as_ref(),
            wallet.as_ref(),
        ],
        program_id,
    );
    if &derived_pubkey != user {
        msg!("[Err]: User pubkey provided is invalid.");
        return Err(ProgramError::InvalidSeeds)
    };
    Ok(derived_bump)
}