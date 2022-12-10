import { 
    MintControl 
} from "../../src";
import { 
    TestConfigsCustomMint,
    TestConfigsChallenge, 
    TestConfigsEvent, 
    TestConfigsPrize, 
} from "../util/configs";


/**
 * Assets
 *      Solana Bounty XP Token
 *      Solana Bounty Shippooor NFT
 *      Solana Bounty Super Shippooor NFT
 */

 export function getTestXpMintConfigsSolanaBounty() {
    return new TestConfigsCustomMint(
        "Solana Bounty XP Token",
        "SBXP",
        "https://github.com/PrestigeDAO/prestige-protocol/tree/main/assets/solana-bounty-xp.json",
        9,
    );
}
export function getTestNftBadgeConfigsSolanaBountyShippooor() {
    return new TestConfigsCustomMint(
        "SB Shippooor NFT",
        "SBS",
        "https://github.com/PrestigeDAO/prestige-protocol/tree/main/assets/solana-bounty-nft.json",
        0,
    );
}
export function getTestNftBadgeConfigsSolanaBountySuperShippooor() {
    return new TestConfigsCustomMint(
        "SB Super Shippooor NFT",
        "SBSS",
        "https://github.com/PrestigeDAO/prestige-protocol/tree/main/assets/solana-bounty-nft.json",
        0,
    );
}

/**
 * Event A - Hacker House Lisbon
 * Two Challenges
 *      Challenge A: One Prize  (XP)
 *      Challenge B: Two Prizes (XP + Shippooor NFT)
 */

export function getTestEventConfigsA(): TestConfigsEvent {
    return new TestConfigsEvent(
        "Solana Hacker House Lisbon",
        "Solana Hacker House Lisbon, Portugal",
        "Lisbon, Portugal",
        "Solana Foundation",
        "11-1-2022",
    );
}

export function getTestChallengeConfigsAA() {
    return new TestConfigsChallenge(
        "Photobomb",
        "Snap a photo with Colin!",
        "Donny",
        "social",
    );
}
export function getTestPrizeConfigsAA1() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        100,
    );
}
export function getTestPrizeConfigsUsdc() {
    return new TestConfigsPrize(
        MintControl.Escrow,
        8,
    );
}

export function getTestChallengeConfigsAB() {
    return new TestConfigsChallenge(
        "Deploy HelloWorld",
        "Deploy your first HelloWorld program on Solana!",
        "Joe C",
        "deploy;program",
    );
}
export function getTestPrizeConfigsAB1() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        300,
    );
}
export function getTestPrizeConfigsAB2() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        1,
    );
}


/**
 * Event B - Breakpoint
 * Two Challenges
 *      Challenge A: Two Prizes (XP + Shippooor NFT)
 *      Challenge B: Two Prizes (XP + Super Shippooor NFT)
 */

 export function getTestEventConfigsB(): TestConfigsEvent {
    return new TestConfigsEvent(
        "Solana Breakpoint",
        "Solana Breakpoint Lisbon, Portugal",
        "Lisbon, Portugal",
        "Solana Foundation",
        "11-4-2022",
    );
}

export function getTestChallengeConfigsBA() {
    return new TestConfigsChallenge(
        "Deploy a Transfer SOL Program",
        "Deploy a Solana program that can transfer SOL",
        "Joe C",
        "deploy;program",
    );
}
export function getTestPrizeConfigsBA1() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        100,
    );
}
export function getTestPrizeConfigsBA2() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        1,
    );
}

export function getTestChallengeConfigsBB() {
    return new TestConfigsChallenge(
        "Deploy Counter Program",
        "Deploy a counter program on Solana!",
        "Donny",
        "deploy;program",
    );
}
export function getTestPrizeConfigsBB1() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        300,
    );
}
export function getTestPrizeConfigsBB2() {
    return new TestConfigsPrize(
        MintControl.Remintable,
        1,
    );
}





