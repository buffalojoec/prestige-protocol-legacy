// import { 
//     Connection, 
//     PublicKey 
// } from "@solana/web3.js";
// import { 
//     fetchAllEarnedRewards,
//     fetchChallenge, 
//     fetchEvent, 
//     fetchMintAndMetadata, 
//     fetchPrize 
// } from "./fetch";
// import { 
//     ChallengeWrapper, 
//     EventWrapper, 
//     MintMetadataWrapper, 
//     PrizeWrapper, 
//     RewardWrapper, 
//     PrestigeEvent, 
//     PrestigeChallenge, 
//     PrestigeReward, 
//     SolanaResume, 
// } from "./types";
// import { 
//     Metadata 
// } from "@metaplex-foundation/mpl-token-metadata";



// export async function renderAchievements(
//     connection: Connection,
//     rewards: RewardWrapper[],
// ): Promise<PrestigeEvent[]> {

//     const eventMap = new Map<string, EventWrapper>();
//     const challengeMap = new Map<string, ChallengeWrapper>();
//     const prizeMap = new Map<string, PrizeWrapper>();
//     const mintMap = new Map<string, MintMetadataWrapper>();

//     const rewardsGroupedByChallenge = new Map<string, PrestigeReward[]>();
//     const challengesGroupedByEvent = new Map<string, PrestigeChallenge[]>();

//     for (const reward of rewards) {

//         let prize: PrizeWrapper;
//         const prizePubkey = new PublicKey(reward.reward.prize);
//         const prizeMapKey = prizePubkey.toBase58();
//         const prizeVal = prizeMap.get(prizeMapKey);
//         if (prizeVal) {
//             prize = prizeVal;
//         } else {
//             prize = await fetchPrize(
//                 connection, 
//                 prizePubkey,
//             );
//             prizeMap.set(prizePubkey.toBase58(), prize);
//         }
        
//         let mint: MintMetadataWrapper;
//         const mintPubkey = new PublicKey(prize.prize.mint);
//         const mintMapKey = mintPubkey.toBase58();
//         const mintVal = mintMap.get(mintMapKey);
//         if (mintVal) {
//             mint = mintVal;
//         } else {
//             mint = await fetchMintAndMetadata(
//                 connection, 
//                 mintPubkey,
//             );
//             mintMap.set(mintPubkey.toBase58(), mint);
//         }

//         let title: string;
//         let symbol: string;
//         let uri: string;
//         if (mint.metadata === Metadata.prototype) {
//             title = "Unknown Token";
//             symbol = "-";
//             uri = "";
//         } else {
//             title = mint.metadata.data.name;
//             symbol = mint.metadata.data.symbol;
//             uri = mint.metadata.data.uri;
//         }

//         const challengePubkey = new PublicKey(prize.prize.challenge);
//         const challengeMapKey = challengePubkey.toBase58();

//         const thisPrestigeReward = {
//             challengePubkey: challengePubkey,
//             rewardPubkey: reward.address,
//             prizePubkey: prizePubkey,
//             mintPubkey: mintPubkey,
//             title,
//             symbol,
//             uri,
//             quantity: prize.prize.quantity.toNumber(),
//         };

//         const challengeListVal = rewardsGroupedByChallenge.get(challengeMapKey);

//         if (challengeListVal) {
//             challengeListVal.push(thisPrestigeReward);
//         } else {
//             rewardsGroupedByChallenge.set(challengeMapKey, [thisPrestigeReward]);
//         }

//         let challenge: ChallengeWrapper;
//         const challengeVal = challengeMap.get(challengeMapKey);
//         if (challengeVal) {
//             challenge = challengeVal;
//         } else {
//             challenge = await fetchChallenge(
//                 connection, 
//                 new PublicKey(challengeMapKey),
//             );
//             challengeMap.set(challengeMapKey, challenge);
//         }

//         const eventPubkey = new PublicKey(prize.prize.event);
//         const eventMapKey = eventPubkey.toBase58();

//         const rewardsListVal = rewardsGroupedByChallenge.get(challengeMapKey);
//         if (!rewardsListVal) throw ("Error loading resume: Rewards");

//         const thisPrestigeChallenge = {
//             eventPubkey: eventPubkey,
//             challengePubkey: challenge.address,
//             challengeTitle: challenge.metadata.challenge_title,
//             challengeDescription: challenge.metadata.challenge_description,
//             challengeAuthor: challenge.metadata.challenge_author,
//             challengeAuthorPubkey: challenge.challenge.author,
//             rewards: rewardsListVal,
//         };

//         const eventListVal = challengesGroupedByEvent.get(eventMapKey);

//         if (eventListVal) {
//             eventListVal.push(thisPrestigeChallenge);
//         } else {
//             challengesGroupedByEvent.set(eventMapKey, [thisPrestigeChallenge]);
//         }
//     }

//     const achievements: PrestigeEvent[] = [];

//     for (const key of challengesGroupedByEvent.keys()) {

//         let event: EventWrapper;
//         const eventVal = eventMap.get(key);
//         if (eventVal) {
//             event = eventVal;
//         } else {
//             event = await fetchEvent(
//                 connection, 
//                 new PublicKey(key),
//             );
//             eventMap.set(key, event);
//         }

//         const challengesListVal = challengesGroupedByEvent.get(key);
//         if (!challengesListVal) throw ("Error loading resume: Challenges");

//         const thisAchievement = {
//             eventPubkey: event.address,
//             eventTitle: event.metadata.event_title,
//             eventDescription: event.metadata.event_description,
//             eventLocation: event.metadata.event_location,
//             eventHost: event.metadata.event_host,
//             eventDate: event.metadata.event_date,
//             challengesCompleted: challengesListVal,
//         };

//         achievements.push(thisAchievement);
//     }

//     return achievements;
// }


// export async function renderSolanaResume(
//     connection: Connection,
//     pubkey: PublicKey,
// ): Promise<SolanaResume> {

//     const rewards = await fetchAllEarnedRewards(
//         connection,
//         pubkey,
//     );
    
//     const achievements = await renderAchievements(
//         connection,
//         rewards
//     );

//     return {
//         rarestBadges: [], // TODO
//         topXptokens: [], // TODO
//         achievements,
//     };
// }