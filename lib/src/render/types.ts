import { 
    Metadata 
} from "@metaplex-foundation/mpl-token-metadata"
import { 
    Mint 
} from "@solana/spl-token"
import { 
    PublicKey 
} from "@solana/web3.js"
import { 
    BadgeMetadata,
    Challenge, 
    ChallengeMetadata, 
    Event, 
    EventMetadata, 
    User
} from "../state"

export type BadgeWrapper = {
    address: PublicKey,
    mint: Mint,
    mintMetadata: Metadata,
    badgeMetadata: BadgeMetadata,
}

export type ChallengeWrapper = {
    address: PublicKey,
    challenge: Challenge,
    metadata: ChallengeMetadata,
}

export type EventWrapper = {
    address: PublicKey,
    event: Event,
    metadata: EventMetadata,
}

export type UserWrapper = {
    address: PublicKey,
    user: User,
}

export type PrestigeEvent = {
    eventPubkey: PublicKey,
    eventTitle: string,
    eventDescription: string,
    eventLocation: string,
    eventHost: string,
    eventDate: string,
    challengesCompleted: PrestigeChallenge[],
}

export type PrestigeChallenge = {
    eventPubkey: PublicKey,
    challengePubkey: PublicKey,
    challengeTitle: string,
    challengeDescription: string,
    challengeAuthor: string,
    challengeAuthorPubkey: PublicKey,
    rewards: PrestigeReward[],
}

export type PrestigeReward = {
    challengePubkey: PublicKey,
    rewardPubkey: PublicKey,
    prizePubkey: PublicKey,
    mintPubkey: PublicKey,
    title: string,
    symbol: string,
    uri: string,
    quantity: number,
}

export type SolanaResume = {
    rarestBadges: PrestigeReward[],
    topXptokens: PrestigeReward[],
    achievements: PrestigeEvent[],
}

export type ManagerPanel = {
    mostPopularEvents: PrestigeEvent[],
    managedEvents: PrestigeEvent[];
}