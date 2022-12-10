import { 
    Connection, 
    PublicKey 
} from "@solana/web3.js";
import { 
    fetchAllEventsManaged,
    fetchAllPrizesForChallenge,
    fetchAllPrizesForEvent,
    fetchAllRewardsForPrize,
    fetchChallenge,
    fetchMintAndMetadata
} from "./fetch";
import { 
    ChallengeWrapper,
    EventWrapper, 
    ManagerPanel, 
    PrestigeChallenge, 
    PrestigeEvent,
    PrestigeReward,
} from "./types";
import { 
    Metadata 
} from "@metaplex-foundation/mpl-token-metadata";
import assert from "assert";



async function renderManagedEvents(
    connection: Connection,
    events: EventWrapper[],
): Promise<PrestigeEvent[]> {

    const allManagedEvents: PrestigeEvent[] = [];
    
    for (const event of events) {
        
        const eventPubkey = new PublicKey(event.address);
        const allPrizes = await fetchAllPrizesForEvent(connection, eventPubkey);
        
        const allIssuedRewardsForChallenge = new Map<string, PrestigeReward[]>();
        const allIssuedChallengesforEvent = new Map<string, PrestigeChallenge[]>();
        const seenChallenges = new Map<string, ChallengeWrapper>();

        for (const prize of allPrizes) {

            const challengePubkey = new PublicKey(prize.prize.challenge);

            const prizePubkey = new PublicKey(prize.address);
            const mintPubkey = new PublicKey(prize.prize.mint);
            const mint = await fetchMintAndMetadata(
                connection,
                mintPubkey,
            );

            let title: string;
            let symbol: string;
            let uri: string;
            if (mint.metadata === Metadata.prototype) {
                title = "Unknown Token";
                symbol = "-";
                uri = "";
            } else {
                title = mint.metadata.data.name;
                symbol = mint.metadata.data.symbol;
                uri = mint.metadata.data.uri;
            }

            const allRewards = await fetchAllRewardsForPrize(
                connection,
                prizePubkey,
            );

            allRewards
                .map((r) => {
                    return {
                        challengePubkey: challengePubkey,
                        rewardPubkey: r.address,
                        prizePubkey: prizePubkey,
                        mintPubkey: mintPubkey,
                        title,
                        symbol,
                        uri,
                        quantity: prize.prize.quantity.toNumber(),
                    }
                })
                .forEach((r) => {
                    const issuedRewardVal = allIssuedRewardsForChallenge.get(challengePubkey.toBase58());
                    if (issuedRewardVal) {
                        allIssuedRewardsForChallenge.get(challengePubkey.toBase58())?.push(r);
                    } else {
                        allIssuedRewardsForChallenge.set(challengePubkey.toBase58(), [r]);
                    }
                });

                if (!seenChallenges.get(challengePubkey.toBase58())) {
                    seenChallenges.set(
                        challengePubkey.toBase58(), 
                        await fetchChallenge(connection, challengePubkey)
                    );
                }

        }

        for (const challenge of seenChallenges.values()) {

            const allIssuedRewards = allIssuedRewardsForChallenge.get(challenge.address.toBase58());
            assert(allIssuedRewards);

            if (allIssuedChallengesforEvent.get(event.address.toBase58())) {
                allIssuedChallengesforEvent.get(event.address.toBase58())?.push({
                    eventPubkey: eventPubkey,
                    challengePubkey: challenge.address,
                    challengeTitle: challenge.metadata.challenge_title,
                    challengeDescription: challenge.metadata.challenge_description,
                    challengeAuthor: challenge.metadata.challenge_author,
                    challengeAuthorPubkey: challenge.challenge.author,
                    rewards: allIssuedRewards,
                });
            } else {
                allIssuedChallengesforEvent.set(event.address.toBase58(), [
                    {
                        eventPubkey: eventPubkey,
                        challengePubkey: challenge.address,
                        challengeTitle: challenge.metadata.challenge_title,
                        challengeDescription: challenge.metadata.challenge_description,
                        challengeAuthor: challenge.metadata.challenge_author,
                        challengeAuthorPubkey: challenge.challenge.author,
                        rewards: allIssuedRewards,
                    }
                ]);
            }
        }

        const allIssuedChallenges = allIssuedChallengesforEvent.get(event.address.toBase58());
        assert(allIssuedChallenges);

        allManagedEvents.push({
            eventPubkey: event.address,
            eventTitle: event.metadata.event_title,
            eventDescription: event.metadata.event_description,
            eventLocation: event.metadata.event_location,
            eventHost: event.metadata.event_host,
            eventDate: event.metadata.event_date,
            challengesCompleted: allIssuedChallenges,
        });
    }

    return allManagedEvents;
}


export async function renderManagerPanel(
    connection: Connection,
    pubkey: PublicKey,
): Promise<ManagerPanel> {

    const events = await fetchAllEventsManaged(
        connection,
        pubkey,
    );

    const managedEvents = await renderManagedEvents(
        connection,
        events,
    );

    return {
        mostPopularEvents: [], // TODO
        managedEvents,
    };
}