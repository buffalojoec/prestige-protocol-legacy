use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ 
    pubkey::Pubkey,
};


/**
* A Challenge, such as a Bounty Challenge or Workshop Challenge.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct Challenge {

    pub challenge_id: u8,
    pub prizes_count: u8,
    pub authority: Pubkey,
    pub bump: u8,
}


impl Challenge {

    pub const SEED_PREFIX: &'static str = "challenge";

    pub fn new(
        challenge_id: u8,
        authority: Pubkey,
        bump: u8,
    ) -> Self {

        Challenge {
            challenge_id,
            prizes_count: 0,
            authority,
            bump,
        }
    }
}


#[derive(BorshDeserialize, BorshSerialize)]
pub struct ChallengeMetadata {
    
    pub challenge_title: String,
    pub challenge_description: String,
    pub challenge_author: String,
    pub challenge_tags: String,
    pub bump: u8,
}


impl ChallengeMetadata {

    pub const SEED_PREFIX: &'static str = "challenge_metadata";

    pub fn new(
        challenge_title: String,
        challenge_description: String,
        challenge_author: String,
        challenge_tags: String,
        bump: u8,
    ) -> Self {

        ChallengeMetadata {
            challenge_title,
            challenge_description,
            challenge_author,
            challenge_tags,
            bump,
        }
    }
}


#[derive(BorshDeserialize, BorshSerialize)]
pub struct ChallengeCounter {

    pub challenges_count: u8,
    pub bump: u8,
}


impl ChallengeCounter {

    pub const SEED_PREFIX: &'static str = "challenge_counter";
    
    pub fn new(
        authority: Pubkey,
        bump: u8,
    ) -> Self {

        ChallengeCounter {
            challenges_count: 1,
            authority,
            bump,
        }
    }
}