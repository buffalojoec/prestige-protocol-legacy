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
import { 
    awardCounterPda, 
    awardPda, 
    challengeCounterPda, 
    challengeMetadataPda, 
    challengePda, 
    eventCounterPda, 
    eventMetadataPda, 
    eventPda 
} from "../util";
import { 
    AccountInfoDataWrapper,
    AwardFullDataWrapper, 
    ChallengeWrapper, 
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
): Promise<Award> {
    return Award.fromBuffer(
        await fetchAccount(
            connection, 
            awardPublicKey, 
            'Award'
        )
    )
}

export async function fetchAwardCounter(
    connection: Connection, 
    awardCounterPublicKey: PublicKey
): Promise<AwardCounter> {
    return AwardCounter.fromBuffer(
        await fetchAccount(
            connection, 
            awardCounterPublicKey, 
            'Award Counter'
        )
    )
}

export async function fetchChallenge(
    connection: Connection, 
    challengePublicKey: PublicKey
): Promise<ChallengeWrapper> {
    return {
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
): Promise<ChallengeCounter> {
    return ChallengeCounter.fromBuffer(
        await fetchAccount(
            connection, 
            challengeCounterPublicKey, 
            'Challenge Counter'
        )
    )
}

export async function fetchEvent(
    connection: Connection, 
    eventPublicKey: PublicKey
): Promise<EventWrapper> {
    return {
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
): Promise<EventCounter> {
    return EventCounter.fromBuffer(
        await fetchAccount(
            connection, 
            eventCounterPublicKey, 
            'Event Counter'
        )
    )
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
        award,
        challengeMetadata: ChallengeMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                challengeMetadataPda(award.challenge)[0], 
                'Challenge Metadata'
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

export async function fetchMultipleAccounts(
    connection: Connection,
    publicKeysList: PublicKey[],
): Promise<AccountInfoDataWrapper[]> {
    const accountInfosWrapperList: AccountInfoDataWrapper[] = [];
    const accountInfosList = await connection.getMultipleAccountsInfo(publicKeysList);
    for (let x = 0; x < publicKeysList.length; x++) {
        const accountInfo = accountInfosList[x];
        if (accountInfo && accountInfo.data) {
            accountInfosWrapperList.push({
                address: publicKeysList[x],
                data: accountInfo.data,
            });
        }
    }
    return accountInfosWrapperList;
}

export async function fetchAllAwards(
    connection: Connection, 
    earnerPublicKey: PublicKey
): Promise<Award[]> {
    const awardCounter = await fetchAwardCounter(connection, awardCounterPda(earnerPublicKey)[0]);
    const awardPublicKeysList: PublicKey[] = [];
    for (let x = 1; x <= awardCounter.count; x++) {
        awardPublicKeysList.push(awardPda(earnerPublicKey, x)[0]);
    }
    return (await fetchMultipleAccounts(connection, awardPublicKeysList))
        .filter((accountInfo) => accountInfo.data != undefined)
        .map((accountInfo) => Award.fromBuffer(accountInfo.data))
}

export async function fetchAllChallenges(
    connection: Connection, 
    authorityPublicKey: PublicKey
): Promise<Challenge[]> {
    const challengeCounter = await fetchAwardCounter(connection, challengeCounterPda(authorityPublicKey)[0]);
    const challengePublicKeysList: PublicKey[] = [];
    for (let x = 1; x <= challengeCounter.count; x++) {
        challengePublicKeysList.push(challengePda(authorityPublicKey, x)[0]);
    }
    return (await fetchMultipleAccounts(connection, challengePublicKeysList))
        .filter((accountInfo) => accountInfo.data != undefined)
        .map((accountInfo) => Challenge.fromBuffer(accountInfo.data))
}

export async function fetchAllEvents(
    connection: Connection, 
    authorityPublicKey: PublicKey
): Promise<Event[]> {
    const eventCounter = await fetchAwardCounter(connection, eventCounterPda(authorityPublicKey)[0]);
    const eventPublicKeysList: PublicKey[] = [];
    for (let x = 1; x <= eventCounter.count; x++) {
        eventPublicKeysList.push(eventPda(authorityPublicKey, x)[0]);
    }
    return (await fetchMultipleAccounts(connection, eventPublicKeysList))
        .filter((accountInfo) => accountInfo.data != undefined)
        .map((accountInfo) => Event.fromBuffer(accountInfo.data))
}

export async function fetchAllFullAwardDatas(
    connection: Connection, 
    earnerPublicKey: PublicKey
): Promise<AwardFullDataWrapper[]> {
    
    const awardCounter = await fetchAwardCounter(connection, awardCounterPda(earnerPublicKey)[0]);
    const awardPublicKeysList: PublicKey[] = [];
    for (let x = 1; x <= awardCounter.count; x++) {
        awardPublicKeysList.push(awardPda(earnerPublicKey, x)[0]);
    }
    
    const challengeMetadataSet = new Set<PublicKey>();
    const eventMetadataSet = new Set<PublicKey>();
    const awardDataList = (await fetchMultipleAccounts(connection, awardPublicKeysList))
        .map((accountInfo) => {
            const awardData = Award.fromBuffer(accountInfo.data);
            challengeMetadataSet.add(challengeMetadataPda(awardData.challenge)[0]);
            eventMetadataSet.add(eventMetadataPda(awardData.event)[0]);
            return awardData;
        });

    const challengeMetadataMap = (await fetchMultipleAccounts(connection, Array.from(challengeMetadataSet.values())))
        .map((a): [string, ChallengeMetadata] => [a.address.toBase58(), ChallengeMetadata.fromBuffer(a.data)])
        .reduce((obj, [key, val]) => {
            obj.set(key, val);
            return obj;
        }, new Map<string, ChallengeMetadata>());
    const eventMetadataMap = (await fetchMultipleAccounts(connection, Array.from(eventMetadataSet.values())))
        .map((a): [string, EventMetadata] => [a.address.toBase58(), EventMetadata.fromBuffer(a.data)])
        .reduce((obj, [key, val]) => {
            obj.set(key, val);
            return obj;
        }, new Map<string, EventMetadata>());

    return awardDataList.map((award) => {
        const challengeMetadata = challengeMetadataMap.get(challengeMetadataPda(award.challenge)[0].toBase58());
        const eventMetadata = eventMetadataMap.get(eventMetadataPda(award.event)[0].toBase58());
        return {
            award,
            challengeMetadata,
            eventMetadata,
        }
    })
}