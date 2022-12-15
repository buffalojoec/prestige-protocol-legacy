use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

use crate::state::{ 
    PrestigeDataAccount,
    PrestigeRoleAccount,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Event {
    pub id: u16,
    pub authority: Pubkey,
}

impl PrestigeDataAccount for Event {

    const SEED_PREFIX: &'static str = "event";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                Event::SEED_PREFIX.as_bytes().as_ref(),
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
                    Event::SEED_PREFIX.as_bytes().as_ref(),
                    self.authority.as_ref(),
                    self.id.to_le_bytes().as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}

impl PrestigeRoleAccount for Event {
    fn is_correct_authority(&self, address: &Pubkey) {
        assert!(&self.authority == address)
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct EventMetadata {
    pub authority: Pubkey,
    pub event: Pubkey,
    pub title: String,
    pub description: String,
    pub location: String,
    pub date: String,
    pub host: String,
    pub uri: String,
}

impl PrestigeDataAccount for EventMetadata {

    const SEED_PREFIX: &'static str = "event_metadata";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
                self.event.as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    EventMetadata::SEED_PREFIX.as_bytes().as_ref(),
                    self.event.as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}

impl PrestigeRoleAccount for EventMetadata {
    fn is_correct_authority(&self, address: &Pubkey) {
        assert!(&self.authority == address)
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct EventCounter {
    pub authority: Pubkey,
    pub count: u16,
}

impl PrestigeDataAccount for EventCounter {

    const SEED_PREFIX: &'static str = "event_counter";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                EventCounter::SEED_PREFIX.as_bytes().as_ref(),
                self.authority.as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    EventCounter::SEED_PREFIX.as_bytes().as_ref(),
                    self.authority.as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}