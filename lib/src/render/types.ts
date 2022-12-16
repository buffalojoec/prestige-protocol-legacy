import { PublicKey } from "@solana/web3.js";
import { 
    Award, 
    Challenge, 
    ChallengeMetadata, 
    Event, 
    EventMetadata 
} from "../state";

export type AccountInfoDataWrapper = {
    address: PublicKey,
    data: Buffer,
}

export type AwardFullDataWrapper = {
    award: Award,
    challengeMetadata: ChallengeMetadata | undefined,
    eventMetadata: EventMetadata | undefined,
}

export type ChallengeWrapper = {
    challenge: Challenge,
    metadata: ChallengeMetadata,
}

export type EventWrapper = {
    event: Event,
    metadata: EventMetadata,
}