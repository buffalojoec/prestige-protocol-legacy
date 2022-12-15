import {
    getAccount,
    getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { 
    Connection,
    PublicKey,
} from '@solana/web3.js';
import {
    PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import {
    toBufferLE,
} from 'bigint-buffer';

export const PRESTIGE_PROGRAM_ID: PublicKey = new PublicKey(
    "C7JUkUuf6yKg9bjmVcpa76Pb4usHA6m9JokqM6Y2XD5z"
);

export const BADGE_METADATA_SEED_PREFIX = "badge_metadata";
export const CHALLENGE_SEED_PREFIX = "challenge";
export const CHALLENGE_METADATA_SEED_PREFIX = "challenge_metadata";
export const EVENT_SEED_PREFIX = "event";
export const EVENT_METADATA_SEED_PREFIX = "event_metadata";
export const PRESTIGE_MINT_AUTHORITY_SEED_PREFIX = "mint_authority";
export const USER_SEED_PREFIX = "user";

export const mintMetadataMplPda = (mintPublicKey: PublicKey) => PublicKey.findProgramAddressSync(
    [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
);

export const prestigePda = (seeds: Buffer[]) => PublicKey.findProgramAddressSync(
    seeds,
    PRESTIGE_PROGRAM_ID
);

export const badgeMetadataPda = (badgeMint: PublicKey) => prestigePda([
    Buffer.from(BADGE_METADATA_SEED_PREFIX),
    badgeMint.toBuffer(),
]);
export const challengePda = (authority: PublicKey, challengeId: number) => prestigePda([
    Buffer.from(CHALLENGE_SEED_PREFIX),
    authority.toBuffer(),
    Buffer.from(Uint8Array.of(challengeId)),
]);
export const challengeMetadataPda = (challengePublicKey: PublicKey) => prestigePda([
    Buffer.from(CHALLENGE_METADATA_SEED_PREFIX),
    challengePublicKey.toBuffer(),
]);
export const eventPda = (authority: PublicKey, eventId: number) => prestigePda([
    Buffer.from(EVENT_SEED_PREFIX),
    authority.toBuffer(),
    toBufferLE(BigInt(eventId), 4)
]);
export const eventMetadataPda = (eventPublicKey: PublicKey) => prestigePda([
    Buffer.from(EVENT_METADATA_SEED_PREFIX),
    eventPublicKey.toBuffer(),
]);
export const prestigeMintAuthorityPda = () => prestigePda([
    Buffer.from(PRESTIGE_MINT_AUTHORITY_SEED_PREFIX),
]);
export const userPda = (walletPublicKey: PublicKey) => prestigePda([
    Buffer.from(USER_SEED_PREFIX),
    walletPublicKey.toBuffer(),
]);

export async function getMintBalance(
    connection: Connection, 
    mint: PublicKey, 
    wallet: PublicKey
): Promise<number> {
    const associatedTokenAddress = getAssociatedTokenAddressSync(mint, wallet);
    try {
        const data = await getAccount(connection, associatedTokenAddress);
        return Number(data.amount)
    } catch(_) { 
        throw("Token Account not found.");
    }
}