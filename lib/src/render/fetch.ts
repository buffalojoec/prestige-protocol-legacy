import { Connection, PublicKey } from "@solana/web3.js";
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
import { challengeMetadataPda, eventMetadataPda } from "../util";
import { 
    AwardCounterWrapper, 
    AwardFullDataWrapper, 
    AwardWrapper, 
    ChallengeCounterWrapper, 
    ChallengeWrapper, 
    EventCounterWrapper, 
    EventWrapper 
} from "./types";

export async function fetchAccount(
    connection: Connection,
    publicKey: PublicKey,
    accountType: string,
): Promise<Buffer> {
    const accountInfo = await connection.getAccountInfo(publicKey);
    if (!accountInfo || accountInfo.lamports === 0) throw(`${accountType} not found for ${publicKey}`);
    return accountInfo.data
}

export async function fetchAward(
    connection: Connection, 
    awardPublicKey: PublicKey
): Promise<AwardWrapper> {
    return {
        address: awardPublicKey,
        award: Award.fromBuffer(
            await fetchAccount(
                connection, 
                awardPublicKey, 
                'Award'
            )
        ),
    }
}

export async function fetchAwardCounter(
    connection: Connection, 
    awardCounterPublicKey: PublicKey
): Promise<AwardCounterWrapper> {
    return {
        address: awardCounterPublicKey,
        counter: AwardCounter.fromBuffer(
            await fetchAccount(
                connection, 
                awardCounterPublicKey, 
                'Award Counter'
            )
        ),
    }
}

export async function fetchChallenge(
    connection: Connection, 
    challengePublicKey: PublicKey
): Promise<ChallengeWrapper> {
    return {
        address: challengePublicKey,
        challenge: Challenge.fromBuffer(
            await fetchAccount(
                connection, 
                challengePublicKey, 
                'Challenge'
            )
        ),
        metadata: ChallengeMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                challengeMetadataPda(challengePublicKey)[0], 
                'Challenge Metadata'
            )
        ),
    }
}

export async function fetchChallengeCounter(
    connection: Connection, 
    challengeCounterPublicKey: PublicKey
): Promise<ChallengeCounterWrapper> {
    return {
        address: challengeCounterPublicKey,
        counter: ChallengeCounter.fromBuffer(
            await fetchAccount(
                connection, 
                challengeCounterPublicKey, 
                'Challenge Counter'
            )
        ),
    }
}

export async function fetchEvent(
    connection: Connection, 
    eventPublicKey: PublicKey
): Promise<EventWrapper> {
    return {
        address: eventPublicKey,
        event: Event.fromBuffer(
            await fetchAccount(
                connection, 
                eventPublicKey, 
                'Event'
            )
        ),
        metadata: EventMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                eventMetadataPda(eventPublicKey)[0], 
                'Event Metadata'
            )
        ),
    }
}

export async function fetchEventCounter(
    connection: Connection, 
    eventCounterPublicKey: PublicKey
): Promise<EventCounterWrapper> {
    return {
        address: eventCounterPublicKey,
        counter: EventCounter.fromBuffer(
            await fetchAccount(
                connection, 
                eventCounterPublicKey, 
                'Event Counter'
            )
        ),
    }
}

export async function fetchFullAwardData(
    connection: Connection, 
    awardPublicKey: PublicKey
): Promise<AwardFullDataWrapper> {
    const award = Award.fromBuffer(
        await fetchAccount(
            connection, 
            awardPublicKey, 
            'Award'
        )
    );
    return {
        address: awardPublicKey,
        award,
        challenge: Challenge.fromBuffer(
            await fetchAccount(
                connection, 
                award.challenge, 
                'Challenge'
            )
        ),
        challengeMetadata: ChallengeMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                challengeMetadataPda(award.challenge)[0], 
                'Challenge Metadata'
            )
        ),
        event: Event.fromBuffer(
            await fetchAccount(
                connection, 
                award.event, 
                'Event'
            )
        ),
        eventMetadata: EventMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                eventMetadataPda(award.event)[0], 
                'Event Metadata'
            )
        ),
    }
}