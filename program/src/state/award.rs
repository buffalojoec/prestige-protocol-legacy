use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

use crate::state::{ 
    PrestigeDataAccount,
    PrestigeRoleAccount,
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Award {
    pub id: u16,
    pub authority: Pubkey,
    pub earner: Pubkey,
    pub event: Pubkey,
    pub challenge: Pubkey,
}

impl PrestigeDataAccount for Award {
    
    const SEED_PREFIX: &'static str = "award";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                Award::SEED_PREFIX.as_bytes().as_ref(),
                self.earner.as_ref(),
                self.id.to_le_bytes().as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    Award::SEED_PREFIX.as_bytes().as_ref(),
                    self.earner.as_ref(),
                    self.id.to_le_bytes().as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}

impl PrestigeRoleAccount for Award {
    fn is_correct_authority(&self, address: &Pubkey) {
        assert!(&self.authority == address)
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AwardCounter {
    pub earner: Pubkey,
    pub count: u16,
}

impl PrestigeDataAccount for AwardCounter {

    const SEED_PREFIX: &'static str = "award_counter";

    fn bump(&self, program_id: &Pubkey) -> u8 {
        Pubkey::find_program_address(
            &[
                AwardCounter::SEED_PREFIX.as_bytes().as_ref(),
                self.earner.as_ref(),
            ],
            program_id
        ).1
    }

    fn is_valid_pda(&self, program_id: &Pubkey, address: &Pubkey) {
        assert!(
            &Pubkey::find_program_address(
                &[
                    AwardCounter::SEED_PREFIX.as_bytes().as_ref(),
                    self.earner.as_ref(),
                ],
                program_id
            ).0 == address
        )
    }
}