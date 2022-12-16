import { PublicKey } from '@solana/web3.js';
import { toBufferLE } from 'bigint-buffer';

export const PRESTIGE_PROGRAM_ID: PublicKey = new PublicKey(
    "A8XLGi6dVtGWWRiFybHS1hqyqcBvSggkyamgk5cwMwf9"
);

export const AWARD_SEED_PREFIX = "award";
export const AWARD_COUNTER_SEED_PREFIX = "award_counter";
export const CHALLENGE_SEED_PREFIX = "challenge";
export const CHALLENGE_COUNTER_SEED_PREFIX = "challenge_counter";
export const CHALLENGE_METADATA_SEED_PREFIX = "challenge_metadata";
export const EVENT_SEED_PREFIX = "event";
export const EVENT_COUNTER_SEED_PREFIX = "event_counter";
export const EVENT_METADATA_SEED_PREFIX = "event_metadata";

export const pda = (seeds: Buffer[]) => PublicKey.findProgramAddressSync(
    seeds,
    PRESTIGE_PROGRAM_ID,
);

export const awardPda = (
    earner: PublicKey,
    awardId: number,
) => pda(
    [
        Buffer.from(AWARD_SEED_PREFIX),
        earner.toBuffer(),
        toBufferLE(BigInt(awardId), 2),
    ]
);
export const awardCounterPda = (
    earner: PublicKey,
) => pda(
    [
        Buffer.from(AWARD_COUNTER_SEED_PREFIX),
        earner.toBuffer(),
    ]
);
export const challengePda = (
    authority: PublicKey,
    challengeId: number,
) => pda(
    [
        Buffer.from(CHALLENGE_SEED_PREFIX),
        authority.toBuffer(),
        toBufferLE(BigInt(challengeId), 2),
    ]
);
export const challengeCounterPda = (
    authority: PublicKey,
) => pda(
    [
        Buffer.from(CHALLENGE_COUNTER_SEED_PREFIX),
        authority.toBuffer(),
    ]
);
export const challengeMetadataPda = (
    challenge: PublicKey,
) => pda(
    [
        Buffer.from(CHALLENGE_METADATA_SEED_PREFIX),
        challenge.toBuffer(),
    ]
);
export const eventPda = (
    authority: PublicKey,
    eventId: number,
) => pda(
    [
        Buffer.from(EVENT_SEED_PREFIX),
        authority.toBuffer(),
        toBufferLE(BigInt(eventId), 2),
    ]
);
export const eventCounterPda = (
    authority: PublicKey,
) => pda(
    [
        Buffer.from(EVENT_COUNTER_SEED_PREFIX),
        authority.toBuffer(),
    ]
);
export const eventMetadataPda = (
    event: PublicKey,
) => pda(
    [
        Buffer.from(EVENT_METADATA_SEED_PREFIX),
        event.toBuffer(),
    ]
);