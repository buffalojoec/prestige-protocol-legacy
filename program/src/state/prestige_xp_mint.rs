use borsh::{ BorshDeserialize, BorshSerialize };


/**
* Metadata for Prestige Protocol's native Prestige XP Mint.
*/


#[derive(BorshDeserialize, BorshSerialize)]
pub struct PrestigeXpMint {}

impl PrestigeXpMint {
    
    pub const SEED_PREFIX: &'static str = "prestige_xp_mint";
    
    pub const DECIMALS: u8 = 9;

    pub const TITLE: &'static str = "Prestige DAO XP Token";
    pub const SYMBOL: &'static str = "XP";
    pub const URI: &'static str = "https://raw.githubusercontent.com/PrestigeDAO/prestige-program/assets/xp.json";
}