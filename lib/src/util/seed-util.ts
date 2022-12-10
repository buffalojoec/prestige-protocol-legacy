import { 
    PublicKey 
} from '@solana/web3.js';
import { PRESTIGE_PROGRAM_ID } from './const';

const CHALLENGE_SEED_PREFIX = 'challenge';
const CONTRACT_SEED_PREFIX = 'contract';
const ESCROW_SEED_PREFIX = 'escrow';
const EVENT_SEED_PREFIX = 'event';
const USER_SEED_PREFIX = 'user';

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

export async function getContractPubkey(
    challenge: PublicKey,
    contractId: number,
): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from(CONTRACT_SEED_PREFIX),
            challenge.toBuffer(),
            Buffer.from(Uint8Array.of(contractId)),
        ],
        PRESTIGE_PROGRAM_ID
    );
}

export async function getEscrowPubkey(
    contract: PublicKey,
    escrowId: number,
): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from(ESCROW_SEED_PREFIX),
            contract.toBuffer(),
            Buffer.from(Uint8Array.of(escrowId)),
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

export async function getUserPubkey(
    walletPubkey: PublicKey
): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
        [
            Buffer.from(USER_SEED_PREFIX),
            walletPubkey.toBuffer(),
        ],
        PRESTIGE_PROGRAM_ID
    );
}