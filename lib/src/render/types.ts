import { 
    PublicKey 
} from "@solana/web3.js"
import { 
    Challenge,
    Contract,
    Escrow,
    Event,
    User,
} from "../state"

export type ChallengeWrapper = {
    address: PublicKey,
    challenge: Challenge,
}

export type ContractWrapper = {
    address: PublicKey,
    contract: Contract,
}

export type EscrowWrapper = {
    address: PublicKey,
    escrow: Escrow,
}

export type EventWrapper = {
    address: PublicKey,
    event: Event,
}

export type UserWrapper = {
    address: PublicKey,
    user: User,
}