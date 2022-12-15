use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

use crate::state::{ 
    PrestigeDataAccount,
    PrestigeRoleAccount,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Challenge {
    pub id: u16,
    pub authority: Pubkey,
}

impl PrestigeDataAccount for Challenge {

    const SEED_PREFIX: &'static str = "challenge";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                Challenge::SEED_PREFIX.as_bytes().as_ref(),
                self.authority.as_ref(),
                self.id.to_le_bytes().as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    Challenge::SEED_PREFIX.as_bytes().as_ref(),
                    self.authority.as_ref(),
                    self.id.to_le_bytes().as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}

impl PrestigeRoleAccount for Challenge {
    fn is_correct_authority(&self, address: &Pubkey) {
        assert!(&self.authority == address)
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ChallengeMetadata {
    pub authority: Pubkey,
    pub challenge: Pubkey,
    pub title: String,
    pub description: String,
    pub tags: String,
    pub author: String,
    pub uri: String,
}

impl PrestigeDataAccount for ChallengeMetadata {

    const SEED_PREFIX: &'static str = "challenge_metadata";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
                self.challenge.as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    ChallengeMetadata::SEED_PREFIX.as_bytes().as_ref(),
                    self.challenge.as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}

impl PrestigeRoleAccount for ChallengeMetadata {
    fn is_correct_authority(&self, address: &Pubkey) {
        assert!(&self.authority == address)
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ChallengeCounter {
    pub authority: Pubkey,
    pub count: u16,
}

impl PrestigeDataAccount for ChallengeCounter {

    const SEED_PREFIX: &'static str = "challenge_counter";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                ChallengeCounter::SEED_PREFIX.as_bytes().as_ref(),
                self.authority.as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    ChallengeCounter::SEED_PREFIX.as_bytes().as_ref(),
                    self.authority.as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}