use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;


/**
* An Event, such as a Bounty Battle or Workshop.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct Event {

    pub event_id: u8,
    pub pots_count: u8,
    pub authority: Pubkey,
    pub bump: u8,
}


impl Event {

    pub const SEED_PREFIX: &'static str = "event";
    
    pub fn new(
        event_id: u8,
        authority: Pubkey,
        bump: u8,
    ) -> Self {

        Event {
            event_id,
            pots_count: 0,
            authority,
            bump,
        }
    }
}


#[derive(BorshDeserialize, BorshSerialize)]
pub struct EventMetadata {
    
    pub event_title: String,
    pub event_description: String,
    pub event_location: String,
    pub event_host: String,
    pub event_date: String,
    pub bump: u8,
}


impl EventMetadata {

    pub const SEED_PREFIX: &'static str = "event_metadata";
    
    pub fn new(
        event_title: String,
        event_description: String,
        event_location: String,
        event_host: String,
        event_date: String,
        bump: u8,
    ) -> Self {

        EventMetadata {
            event_title,
            event_description,
            event_location,
            event_host,
            event_date,
            bump,
        }
    }
}


#[derive(BorshDeserialize, BorshSerialize)]
pub struct EventCounter {

    pub events_count: u8,
    pub bump: u8,
}


impl EventCounter {

    pub const SEED_PREFIX: &'static str = "event_counter";
    
    pub fn new(
        bump: u8,
    ) -> Self {

        EventCounter {
            events_count: 1,
            bump,
        }
    }
}