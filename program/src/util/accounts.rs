use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    sysvar::{ rent::Rent, Sysvar },
};

pub fn calc_lamports_required(span: usize) -> u64 {
    (Rent::get().unwrap()).minimum_balance(span)
}

pub fn calc_size(span: usize) -> u64 {
    span.try_into().unwrap()
}

pub fn validate_account_exists(
    account: &AccountInfo,
    error_message: &str,
) -> ProgramResult {
    
    if account.lamports() == 0 {
        msg!(error_message);
        return Err(ProgramError::UninitializedAccount)
    };
    Ok(())
}

pub fn validate_challenge_account_exists(account: &AccountInfo) -> ProgramResult {
    validate_account_exists(
        account,
        "[Err]: The provided challenge does not exist.",
    )
}

pub fn validate_contract_account_exists(account: &AccountInfo) -> ProgramResult {
    validate_account_exists(
        account,
        "[Err]: The provided contract does not exist.",
    )
}

pub fn validate_user_account_exists(account: &AccountInfo) -> ProgramResult {
    validate_account_exists(
        account,
        "[Err]: The provided authority has no associated User account.",
    )
}

pub fn validate_wallet_exists(account: &AccountInfo) -> ProgramResult {
    validate_account_exists(
        account,
        "[Err]: The provided wallet has not been initialized with a deposit.",
    )
}

pub fn validate_signer(account: &AccountInfo) -> ProgramResult {
    if !account.is_signer {
        msg!("The proper authority has not signed this instruction.");
        return Err(ProgramError::MissingRequiredSignature)
    }
    Ok(())
}