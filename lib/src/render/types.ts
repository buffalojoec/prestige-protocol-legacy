import { PublicKey } from "@solana/web3.js";
import { 
    Award, 
    AwardCounter, 
    Challenge, 
    ChallengeCounter, 
    ChallengeMetadata, 
    Event, 
    EventCounter, 
    EventMetadata 
} from "../state";

export type AwardWrapper = {
    address: PublicKey,
    award: Award,
}

export type AwardCounterWrapper = {
    address: PublicKey,
    counter: AwardCounter,
}

export type AwardFullDataWrapper = {
    address: PublicKey,
    award: Award,
    challenge: Challenge,
    challengeMetadata: ChallengeMetadata,
    event: Event,
    eventMetadata: EventMetadata,
}

export type ChallengeWrapper = {
    address: PublicKey,
    challenge: Challenge,
    metadata: ChallengeMetadata,
}

export type ChallengeCounterWrapper = {
    address: PublicKey,
    counter: ChallengeCounter,
}

export type EventWrapper = {
    address: PublicKey,
    event: Event,
    metadata: EventMetadata,
}

export type EventCounterWrapper = {
    address: PublicKey,
    counter: EventCounter,
}