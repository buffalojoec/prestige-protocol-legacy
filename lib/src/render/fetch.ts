import { 
    Metadata 
} from "@metaplex-foundation/mpl-token-metadata";
import { 
    getMint 
} from "@solana/spl-token";
import { 
    Connection, 
    PublicKey 
} from "@solana/web3.js";
import assert from "assert";
import { 
    Challenge, 
    ChallengeCounter, 
    ChallengeMetadata, 
    Event, 
    EventMetadata, 
    Payout, 
    Pot, 
    Prize, 
    Reward, 
    User
} from "../state";
import { 
    getChallengeCounterPubkey,
    getChallengeMetadataPubkey,
    getChallengePubkey, 
    getEventMetadataPubkey, 
    getMetadataPubkey, 
    getPrizePubkey, 
    getRewardPubkey, 
    PRESTIGE_PROGRAM_ID
} from "../util";
import { 
    ChallengeWrapper, 
    EventWrapper, 
    MintMetadataWrapper, 
    PayoutWrapper, 
    PotWrapper, 
    PrizeMintMetadataWrapper, 
    PrizeWrapper, 
    RewardWrapper, 
    UserWrapper
} from "./types";


// --- Single Fetch


export async function fetchUser(
    connection: Connection, 
    pubkey: PublicKey
): Promise<UserWrapper> {

    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) throw(`User not found for ${pubkey}`);
    return {
        address: pubkey,
        user: User.fromBuffer(accountInfo.data),
    };
}

export async function fetchEvent(
    connection: Connection, 
    eventPubkey: PublicKey
): Promise<EventWrapper> {

    const eventAccountInfo = await connection.getAccountInfo(eventPubkey);
    if (!eventAccountInfo) throw(`Event not found for ${eventPubkey}`);

    const eventMetadataPubkey = (await getEventMetadataPubkey(
        eventPubkey,
    ))[0];

    const eventMetadataAccountInfo = await connection.getAccountInfo(eventMetadataPubkey);
    if (!eventMetadataAccountInfo) throw(`Event Metadata not found for ${eventMetadataPubkey}`);
    return {
        address: eventPubkey,
        event: Event.fromBuffer(eventAccountInfo.data),
        metadata: EventMetadata.fromBuffer(eventMetadataAccountInfo.data),
    };
}

export async function fetchPot(
    connection: Connection, 
    potPubkey: PublicKey
): Promise<PotWrapper> {

    const eventAccountInfo = await connection.getAccountInfo(potPubkey);
    if (!eventAccountInfo) throw(`Pot not found for ${potPubkey}`);

    return {
        address: potPubkey,
        pot: Pot.fromBuffer(eventAccountInfo.data),
    };
}

export async function fetchChallenge(
    connection: Connection, 
    challengePubkey: PublicKey
): Promise<ChallengeWrapper> {

    const challengeAccountInfo = await connection.getAccountInfo(challengePubkey);
    if (!challengeAccountInfo) throw(`Challenge not found for ${challengePubkey}`);

    const challengeMetadataPubkey = (await getChallengeMetadataPubkey(
        challengePubkey,
    ))[0];

    const challengeMetadataccountInfo = await connection.getAccountInfo(challengeMetadataPubkey);
    if (!challengeMetadataccountInfo) throw(`Challenge Metadata not found for ${challengeMetadataPubkey}`);
    return {
        address: challengePubkey,
        challenge: Challenge.fromBuffer(challengeAccountInfo.data),
        metadata: ChallengeMetadata.fromBuffer(challengeMetadataccountInfo.data),
    };
}

export async function fetchChallengeCounter(
    connection: Connection,
) {
    const accountInfo = await connection.getAccountInfo(
        (await getChallengeCounterPubkey())[0]
    );
    assert(accountInfo);
    return ChallengeCounter.fromBuffer(accountInfo.data);
}

export async function fetchPrize(
    connection: Connection, 
    pubkey: PublicKey
): Promise<PrizeWrapper> {

    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) throw(`Prize not found for ${pubkey}`);
    return {
        address: pubkey,
        prize: Prize.fromBuffer(accountInfo.data),
    };
}

export async function fetchMintAndMetadata(
    connection: Connection, 
    pubkey: PublicKey
): Promise<MintMetadataWrapper> {

    const mintAccountInfo = await getMint(connection, pubkey);
    const metadataPubkey = (await getMetadataPubkey(pubkey))[0];
    let metadata: Metadata;
    const metadataAccountInfo = await connection.getAccountInfo(metadataPubkey);
    if (!metadataAccountInfo) {
        metadata = Metadata.prototype;
    } else {
        metadata = Metadata.deserialize(metadataAccountInfo.data)[0];
    }
    return {
        address: pubkey,
        mint: mintAccountInfo,
        metadata,
    }
}

export async function fetchPrizeAndMintMetadata(
    connection: Connection, 
    pubkey: PublicKey
): Promise<PrizeMintMetadataWrapper> {

    const prize = await fetchPrize(connection, pubkey);
    const mintMetadata = await fetchMintAndMetadata(connection, prize.prize.mint);
    return {
        address: pubkey,
        prize: prize.prize,
        mint: mintMetadata.mint,
        metadata: mintMetadata.metadata,
    };
}

export async function fetchPayout(
    connection: Connection, 
    pubkey: PublicKey
): Promise<PayoutWrapper> {

    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) throw(`Payout not found for ${pubkey}`);
    return {
        address: pubkey,
        payout: Payout.fromBuffer(accountInfo.data),
    };
}

export async function fetchReward(
    connection: Connection, 
    pubkey: PublicKey
): Promise<RewardWrapper> {

    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) throw(`Reward not found for ${pubkey}`);
    return {
        address: pubkey,
        reward: Reward.fromBuffer(accountInfo.data),
    };
}


// --- All Fetch


// export async function fetchAllChallenges(
//     connection: Connection
// ) {

//     const allChallenges: ChallengeWrapper[] = [];
//     const challengeCounter = await fetchChallengeCounter(connection);
//     for (let x = 1; x <= challengeCounter.challenges_count; x++) {
//         const chal = await fetchChallenge(
//             connection,
//             await getChallengePubkey()
//         );
//         allChallenges.push()
//     }
// }


// --- Complex Fetch


export async function fetchAllEventsManaged(
    connection: Connection,
    authority: PublicKey, 
): Promise<EventWrapper[]> {

    const accounts = await connection.getProgramAccounts(
        PRESTIGE_PROGRAM_ID,
        Event.getProgramAccountsFilter(authority),
    );

    const eventsManaged: EventWrapper[] = [];

    for (const acc of accounts) {
        try {
            eventsManaged.push(
                await fetchEvent(connection, acc.pubkey)
            );
        } catch (_) {
            continue
        }
    }

    return eventsManaged;
}

export async function fetchAllChallengesForEvent(
    connection: Connection, 
    eventPubkey: PublicKey,
): Promise<ChallengeWrapper[]> {

    const allPrizes = await fetchAllPrizesForEvent(connection, eventPubkey);
    
    const challengesMap = new Map<string, ChallengeWrapper>();

    for (const prize of allPrizes) {

        const challengeVal = challengesMap.get(prize.prize.challenge.toBase58());
        if (!challengeVal) {
            const challenge = await fetchChallenge(connection, prize.prize.challenge);
            challengesMap.set(challenge.address.toBase58(), challenge);
        }
    }

    return Array.from(challengesMap.values());
}

// export async function fetchAllChallengesByTag(
//     connection: Connection,
//     tag: string,
// ): Promise<ChallengeWrapper[]> {

//     const allChallenges = await fetchAllChallenges(connection);
// }

export async function fetchAllPrizesForEvent(
    connection: Connection, 
    eventPubkey: PublicKey,
): Promise<PrizeWrapper[]> {

    return (await connection.getProgramAccounts(
        PRESTIGE_PROGRAM_ID,
        Prize.getProgramAccountsFilterByEvent(eventPubkey),
    )).map((p) => {
        return {
            address: p.pubkey,
            prize: Prize.fromBuffer(p.account.data),
        }
    });
}

export async function fetchAllPrizesForChallenge(
    connection: Connection, 
    challengePubkey: PublicKey,
): Promise<PrizeWrapper[]> {

    const challenge = await fetchChallenge(connection, challengePubkey);
    const prizes: PrizeWrapper[] = [];

    for (let x = 1; x <= challenge.challenge.prizes_count; x++) {

        const prizePubkey = (await getPrizePubkey(
            challenge.address,
            x,
        ))[0];
        prizes.push(await fetchPrize(
            connection,
            prizePubkey,
        ));
    }

    return prizes;
}

export async function fetchAllPrizeAndMintMetadatasForChallenge(
    connection: Connection, 
    challengePubkey: PublicKey,
): Promise<PrizeMintMetadataWrapper[]> {

    const challenge = await fetchChallenge(connection, challengePubkey);
    const prizesWithMintMetadata: PrizeMintMetadataWrapper[] = [];

    for (let x = 1; x <= challenge.challenge.prizes_count; x++) {

        const prizePubkey = (await getPrizePubkey(
            challenge.address,
            x,
        ))[0];
        prizesWithMintMetadata.push(await fetchPrizeAndMintMetadata(
            connection,
            prizePubkey,
        ));
    }

    return prizesWithMintMetadata;
}

export async function fetchAllRewardsForPrize(
    connection: Connection, 
    prizePubkey: PublicKey,
): Promise<RewardWrapper[]> {

    const prize = await fetchPrize(connection, prizePubkey);
    const rewards: RewardWrapper[] = [];

    for (let x = 1; x <= prize.prize.rewards_count; x++) {

        const prizePubkey = (await getRewardPubkey(
            prize.address,
            x,
        ))[0];
        rewards.push(await fetchReward(
            connection,
            prizePubkey,
        ));
    }

    return rewards;
}

export async function fetchAllEarnedRewards(
    connection: Connection,
    pubkey: PublicKey, 
): Promise<RewardWrapper[]> {

    const accounts = await connection.getProgramAccounts(
        PRESTIGE_PROGRAM_ID,
        Reward.getProgramAccountsFilter(pubkey),
    );

    const rewardsEarned: RewardWrapper[] = [];

    for (const acc of accounts) {
        rewardsEarned.push({
            address: acc.pubkey,
            reward: Reward.fromBuffer(acc.account.data)
        });
    }

    return rewardsEarned;
}