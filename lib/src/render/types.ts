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
    Challenge, 
    ChallengeMetadata, 
    Event, 
    EventMetadata, 
    Payout, 
    Pot, 
    Prize, 
    Reward, 
    User
} from "../state"


// Wrappers

export type UserWrapper = {
    address: PublicKey,
    user: User,
}

export type EventWrapper = {
    address: PublicKey,
    event: Event,
    metadata: EventMetadata,
}

export type PotWrapper = {
    address: PublicKey,
    pot: Pot,
}

export type ChallengeWrapper = {
    address: PublicKey,
    challenge: Challenge,
    metadata: ChallengeMetadata,
}

export type PrizeWrapper = {
    address: PublicKey,
    prize: Prize,
}

export type MintMetadataWrapper = {
    address: PublicKey,
    mint: Mint,
    metadata: Metadata,
}

export type PrizeMintMetadataWrapper = {
    address: PublicKey,
    prize: Prize,
    mint: Mint,
    metadata: Metadata,
}

export type PayoutWrapper = {
    address: PublicKey,
    payout: Payout,
}

export type RewardWrapper = {
    address: PublicKey,
    reward: Reward,
}

// Renders

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

// Renders

export type SolanaResume = {
    rarestBadges: PrestigeReward[],
    topXptokens: PrestigeReward[],
    achievements: PrestigeEvent[],
}

export type ManagerPanel = {
    mostPopularEvents: PrestigeEvent[],
    managedEvents: PrestigeEvent[];
}