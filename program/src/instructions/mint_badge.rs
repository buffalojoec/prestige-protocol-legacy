use borsh::BorshDeserialize;
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
    program::{ invoke, invoke_signed },
    pubkey::Pubkey,
};
use spl_token::instruction as token_instruction;

use crate::state::{
    ChallengeMetadata,
    MintAuthorityPda,
    PrestigeDataAccount,
};

#[derive(Clone)]
struct FixedPrizeEscrowTicket<'a> {
    fp_escrow: &'a AccountInfo<'a>,
    fp_earner: &'a AccountInfo<'a>,
}

const ESCROWS_ERROR: &'static str = "Not enough escrows provided.";

pub fn mint_badge<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();
    
    let challenge = next_account_info(accounts_iter)?;
    let challenge_metadata = next_account_info(accounts_iter)?;
    let mint = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let earner_token_account = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let mut try_next_account = || {
        match next_account_info(accounts_iter) {
            Ok(acc) => Some(acc),
            Err(_) => None,
        }
    };
    let mut try_next_fpet = || {
        match try_next_account() {
            Some (fp_escrow) => {
                match try_next_account() {
                    Some(fp_earner) => Some(FixedPrizeEscrowTicket {
                        fp_escrow: &fp_escrow,
                        fp_earner: &fp_earner,
                    }),
                    None => None,
                }
            },
            None => None,
        }
    };
    let fixed_prize_escrows: [Option<FixedPrizeEscrowTicket>; 5] = [
        try_next_fpet(),
        try_next_fpet(),
        try_next_fpet(),
        try_next_fpet(),
        try_next_fpet(),
    ];

    let mint_authority_pubkey = Pubkey::find_program_address(
        &[
            MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(),
        ],
        program_id
    ).0;
    assert!(&mint_authority_pubkey == mint_authority.key);
    let mint_authority_metadata_inner_data = MintAuthorityPda::try_from_slice(
        &mint_authority.try_borrow_mut_data()?
    )?;

    let challenge_metadata_pubkey = Pubkey::find_program_address(
        &[
            ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
            challenge.key.as_ref(),
        ],
        program_id
    ).0;
    assert!(&challenge_metadata_pubkey == challenge_metadata.key);
    let challenge_metadata_inner_data = ChallengeMetadata::try_from_slice(
        &challenge_metadata.try_borrow_data()?
    )?;

    let mut fixed_prize_escrows_iter = fixed_prize_escrows.into_iter();
    let fixed_prizes_iter = challenge_metadata_inner_data.fixed_prizes.into_iter();

    for fixed_prize in fixed_prizes_iter {
        match fixed_prize {
            Some(fixed_prize) => {
                match fixed_prize_escrows_iter.next() {
                    Some(fpet) => {
                        let fpet = fpet.unwrap();
                        invoke(
                            &token_instruction::transfer(
                                &token_program.key,
                                fpet.fp_escrow.key,
                                fpet.fp_earner.key,
                                &payer.key,
                                &[&payer.key],
                                fixed_prize.quantity,
                            )?,
                            &[
                                mint.clone(),
                                fpet.fp_escrow.clone(),
                                fpet.fp_earner.clone(),
                                payer.clone(),
                                token_program.clone(),
                            ]
                        )?;
                        Ok(())
                    },
                    None => Err(ESCROWS_ERROR),
                }
            },
            None => Ok(()),
        }.expect(ESCROWS_ERROR);
    };

    invoke_signed(
        &token_instruction::mint_to(
            &token_program.key,
            &mint.key,
            &earner_token_account.key,
            &mint_authority.key,
            &[&mint_authority.key],
            1,
        )?,
        &[
            mint.clone(),
            mint_authority.clone(),
            earner_token_account.clone(),
            token_program.clone(),
        ],
        &[&[
            MintAuthorityPda::SEED_PREFIX.as_bytes().as_ref(),
            mint_authority_metadata_inner_data.bump.to_le_bytes().as_ref(),
        ]],
    )?;
    
    Ok(())
}