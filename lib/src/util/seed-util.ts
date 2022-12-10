import { 
    PublicKey 
} from '@solana/web3.js';
import {
    PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { PRESTIGE_PROGRAM_ID } from './const';


export const USER_SEED_PREFIX = "user";
export const EVENT_SEED_PREFIX = "event";
export const EVENT_METADATA_SEED_PREFIX = "event_metadata";
export const EVENT_COUNTER_SEED_PREFIX = "event_counter";
export const PRIZE_POT_SEED_PREFIX = "prize_pot";
export const CHALLENGE_SEED_PREFIX = "challenge";
export const CHALLENGE_METADATA_SEED_PREFIX = "challenge_metadata";
export const CHALLENGE_COUNTER_SEED_PREFIX = "challenge_counter";
export const PRIZE_SEED_PREFIX = "prize";
export const PAYOUT_SEED_PREFIX = "payout";
export const REWARD_SEED_PREFIX = "reward";
export const PRESTIGE_MINT_AUTHORITY_SEED_PREFIX = "mint_authority";


export async function getUserPubkey(
    authority: PublicKey,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(USER_SEED_PREFIX),
            authority.toBuffer(),
        ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getEventPubkey(
    authority: PublicKey,
    eventId: number,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(EVENT_SEED_PREFIX),
            authority.toBuffer(),
            Buffer.from(Uint8Array.of(eventId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getEventMetadataPubkey(
    eventPubkey: PublicKey,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(EVENT_METADATA_SEED_PREFIX),
            eventPubkey.toBuffer(),
        ],
        PRESTIGE_PROGRAM_ID
    );
}

export async function getEventCounterPubkey(): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [ Buffer.from(EVENT_COUNTER_SEED_PREFIX) ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getPotPubkey(
    eventPubkey: PublicKey,
    potId: number,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(PRIZE_POT_SEED_PREFIX),
            eventPubkey.toBuffer(),
            Buffer.from(Uint8Array.of(potId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getChallengePubkey(
    authority: PublicKey,
    challengeId: number,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(CHALLENGE_SEED_PREFIX),
            authority.toBuffer(),
            Buffer.from(Uint8Array.of(challengeId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getChallengeMetadataPubkey(
    challengePubkey: PublicKey,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(CHALLENGE_METADATA_SEED_PREFIX),
            challengePubkey.toBuffer(),
        ],
        PRESTIGE_PROGRAM_ID
    );
}

export async function getChallengeCounterPubkey(): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [ Buffer.from(CHALLENGE_COUNTER_SEED_PREFIX) ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getPrizePubkey(
    challengePubkey: PublicKey,
    prizeId: number,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(PRIZE_SEED_PREFIX),
            challengePubkey.toBuffer(),
            Buffer.from(Uint8Array.of(prizeId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}

export async function getPayoutPubkey(
    potPubkey: PublicKey,
    payoutId: number,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(PAYOUT_SEED_PREFIX),
            potPubkey.toBuffer(),
            Buffer.from(Uint8Array.of(payoutId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}

export async function getRewardPubkey(
    prizePubkey: PublicKey,
    rewardId: number,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(REWARD_SEED_PREFIX),
            prizePubkey.toBuffer(),
            Buffer.from(Uint8Array.of(rewardId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}

export async function getPrestigeMintAuthorityPubkey(
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from(PRESTIGE_MINT_AUTHORITY_SEED_PREFIX),
        ],
        PRESTIGE_PROGRAM_ID
    );
}


export async function getMetadataPubkey(
    mintPubkey: PublicKey,
): Promise<[PublicKey, number]> {

    return await PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mintPubkey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
    );
}