import os from "os";
import dotenv from "dotenv";
import { 
    describe, 
    it 
} from 'mocha';
import {
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    PublicKey,
} from '@solana/web3.js';
import { 
    createMint, 
    getOrCreateAssociatedTokenAccount, 
    mintTo 
} from '@solana/spl-token';
import {
    createCustomMint,
    createChallenge,
    createEvent,
    createPot,
    createPrize,
    fetchChallenge,
    fetchEvent,
    fetchPrize,
    fetchPrizeAndMintMetadata,
    issueAllRewardsForChallenge,
    renderManagerPanel,
    renderSolanaResume,
    updateChallenge,
    updateEvent,
    updatePrize,
    MintControl,
    issuePayout,
    issueRewardsBatch,
    createUser,
    fetchUser,
    Challenge,
    getChallengeCounterPubkey,
    ChallengeCounter,
    ChallengeMetadata,
    getChallengeMetadataPubkey,
} from '../src';
import {
    createKeypairFromFile, 
    printManagerPanel, 
    printSolanaResume,
} from './util/util';
import { 
    getTestChallengeConfigsAA, 
    getTestChallengeConfigsAB, 
    getTestChallengeConfigsBA, 
    getTestChallengeConfigsBB, 
    getTestEventConfigsA, 
    getTestEventConfigsB, 
    getTestNftBadgeConfigsSolanaBountyShippooor, 
    getTestNftBadgeConfigsSolanaBountySuperShippooor, 
    getTestPrizeConfigsAA1, 
    getTestPrizeConfigsAB1, 
    getTestPrizeConfigsAB2, 
    getTestPrizeConfigsBA1, 
    getTestPrizeConfigsBA2, 
    getTestPrizeConfigsBB1, 
    getTestPrizeConfigsBB2, 
    getTestPrizeConfigsUsdc,
    getTestXpMintConfigsSolanaBounty 
} from './vars/prestige';
import assert from "assert";


describe("Prestige Protocol: Unit Tests", async () => {

    dotenv.config();
    const endpointInput = process.env.RPC_ENDPOINT;
    const endpoint = endpointInput ? endpointInput : 'https://api.devnet.solana.com/'
    const connection = new Connection(endpoint, 'confirmed');
    // const connection = new Connection(`http://localhost:8899`, 'confirmed');
    
    const eventAuthority = createKeypairFromFile(os.homedir() + '/.config/solana/id-prestige-auth.json');
    const testEarner = createKeypairFromFile(os.homedir() + '/.config/solana/id-prestige1.json'); // Prestige DAO Wallet #1
    // const testEarner = createKeypairFromFile(os.homedir() + '/.config/solana/id-prestige2.json'); // Prestige DAO Wallet #2

    // Assets for both Events
    let usdcTestMintAddress: PublicKey;
    let usdcEscrowAccountPubkey: PublicKey;
    let XpTokenSolanaBountyPubkey: PublicKey;
    let XpTokenSolanaBountyMintAuthorityPubkey: PublicKey;
    let XpTokenSolanaBountyMetadataPubkey: PublicKey;
    let nftBadgeShippooorPubkey: PublicKey;
    let nftBadgeShippooorMintAuthorityPubkey: PublicKey;
    let nftBadgeShippooorMetadataPubkey: PublicKey;
    let nftBadgeSuperShippooorPubkey: PublicKey;
    let nftBadgeSuperShippooorMintAuthorityPubkey: PublicKey;
    let nftBadgeSuperShippooorMetadataPubkey: PublicKey;

    // Users
    let testEarnerUser: PublicKey;
    
    // Event A: Two Challenges
    let eventPubkeyA: PublicKey;
    let eventIdA: number;
    // Challenge A: One Prize (XP)
    let challengePubkeyAA: PublicKey;
    let challengeIdAA: number;
    let PrizePubkeyAA1: PublicKey;
    let PrizeIdAA1: number;
    let PrizePubkeyAA2: PublicKey;
    let PrizeIdAA2: number;
    let rewardsPubkeysChallengeAA: PublicKey[];
    // Challenge B: Two Prizes (XP + Shippooor NFT)
    let challengePubkeyAB: PublicKey;
    let challengeIdAB: number;
    let PrizePubkeyAB1: PublicKey;
    let PrizeIdAB1: number;
    let PrizePubkeyAB2: PublicKey;
    let PrizeIdAB2: number;
    let rewardsPubkeysChallengeAB: PublicKey[];

    // Event B: Two Challenges
    let eventPubkeyB: PublicKey;
    let eventIdB: number;
    // PrizePot for Event B
    let prizePotPubkeyB: PublicKey;
    let prizePotIdB: number;
    let payoutPubkeyEventB: PublicKey;
    // Challenge A: Two Prizes (XP + Shippooor NFT)
    let challengePubkeyBA: PublicKey;
    let challengeIdBA: number;
    let PrizePubkeyBA1: PublicKey;
    let PrizeIdBA1: number;
    let PrizePubkeyBA2: PublicKey;
    let PrizeIdBA2: number;
    let rewardsPubkeysChallengeBA: PublicKey[];
    // Challenge B: Two Prizes (XP + Super Shippooor NFT)
    let challengePubkeyBB: PublicKey;
    let challengeIdBB: number;
    let PrizePubkeyBB1: PublicKey;
    let PrizeIdBB1: number;
    let PrizePubkeyBB2: PublicKey;
    let PrizeIdBB2: number;
    let rewardsPubkeysChallengeBB: PublicKey[];

    // --- Wallet Prep

    // it("Airdrop our test earner", async () => {
    //     // await connection.requestAirdrop(testEarner.publicKey, LAMPORTS_PER_SOL);
    //     console.log(`Payer pubkey: ${eventAuthority.publicKey}`);
    //     console.log(`Test Earner pubkey: ${testEarner.publicKey}`);
    // });


    // --- Testing creation USDC escrow for prize pots


    // it("Create a test USDC mint and escrow", async () => {
    //     usdcTestMintAddress = await createMint(
    //         connection,
    //         eventAuthority,
    //         eventAuthority.publicKey,
    //         null,
    //         6,
    //     );
    //     const escrowTokenAccount = await getOrCreateAssociatedTokenAccount(
    //         connection,
    //         eventAuthority,
    //         usdcTestMintAddress,
    //         eventAuthority.publicKey,
    //     );
    //     usdcEscrowAccountPubkey = escrowTokenAccount.address;
    //     console.log(`USDC test mint: ${usdcTestMintAddress}`);
    //     console.log(`USDC escrow token address: ${usdcEscrowAccountPubkey}`);
    // });

    // it("Fund the test USDC escrow", async () => {
    //     await mintTo(
    //         connection,
    //         eventAuthority,
    //         usdcTestMintAddress,
    //         usdcEscrowAccountPubkey,
    //         eventAuthority.publicKey,
    //         10000,
    //     );
    //     const escrowTokenAccount = await getOrCreateAssociatedTokenAccount(
    //         connection,
    //         eventAuthority,
    //         usdcTestMintAddress,
    //         eventAuthority.publicKey,
    //     );
    //     console.log(`Escrow test USDC balance: ${escrowTokenAccount.amount}`);
    // });


    // // --- Testing creation of custom mints


    // it("Create the Solana Bounty XP Token", async () => {
    //     const xpTokenConfigs = getTestXpMintConfigsSolanaBounty();
    //     [
    //         XpTokenSolanaBountyPubkey, 
    //         XpTokenSolanaBountyMintAuthorityPubkey, 
    //         XpTokenSolanaBountyMetadataPubkey
    //     ] = await createCustomMint(
    //         connection,
    //         eventAuthority,
    //         eventAuthority.publicKey,
    //         xpTokenConfigs.title,
    //         xpTokenConfigs.symbol,
    //         xpTokenConfigs.uri,
    //         xpTokenConfigs.decimals,
    //     );
    //     console.log(`XP Token pubkey: ${XpTokenSolanaBountyPubkey}`);
    // });

    // it("Create the Shippooor NFT Badge", async () => {
    //     const nftBadgeConfigs = getTestNftBadgeConfigsSolanaBountyShippooor();
    //     [
    //         nftBadgeShippooorPubkey, 
    //         nftBadgeShippooorMintAuthorityPubkey, 
    //         nftBadgeShippooorMetadataPubkey
    //     ] = await createCustomMint(
    //         connection,
    //         eventAuthority,
    //         eventAuthority.publicKey,
    //         nftBadgeConfigs.title,
    //         nftBadgeConfigs.symbol,
    //         nftBadgeConfigs.uri,
    //         nftBadgeConfigs.decimals,
    //     )
    //     console.log(`Shippooor NFT Badge pubkey: ${nftBadgeShippooorPubkey}`);
    // });

    // it("Create the Super Shippooor NFT Badge", async () => {
    //     const nftBadgeConfigs = getTestNftBadgeConfigsSolanaBountySuperShippooor();
    //     [
    //         nftBadgeSuperShippooorPubkey, 
    //         nftBadgeSuperShippooorMintAuthorityPubkey, 
    //         nftBadgeSuperShippooorMetadataPubkey
    //     ] = await createCustomMint(
    //         connection,
    //         eventAuthority,
    //         eventAuthority.publicKey,
    //         nftBadgeConfigs.title,
    //         nftBadgeConfigs.symbol,
    //         nftBadgeConfigs.uri,
    //         nftBadgeConfigs.decimals,
    //     )
    //     console.log(`Super Shippooor NFT Badge pubkey: ${nftBadgeSuperShippooorPubkey}`);
    // });

    // // --- User

    // it("Create a User for our test earner", async () => {
    //     testEarnerUser = await createUser(
    //         connection,
    //         testEarner,
    //         "test-username-3",
    //     )
    //     console.log(`User Account: ${testEarnerUser}`);
    // });

    // it("Fetch the test earner's user data", async () => {
    //     const userData = await fetchUser(
    //         connection,
    //         testEarnerUser,
    //     )
    //     console.log(`User Account: ${testEarnerUser}`);
    //     console.log(`Username: ${userData.user.username}`);
    // });


    // // --- Event A


    // it("Create Event A", async () => {
    //     const eventConfigs = getTestEventConfigsA();
    //     [eventPubkeyA, eventIdA] = await createEvent(
    //         connection,
    //         eventAuthority,
    //         "This is a placeholder title",
    //         eventConfigs.description,
    //         eventConfigs.location,
    //         eventConfigs.host,
    //         eventConfigs.date,
    //     );
    //     console.log(`Event pubkey: ${eventPubkeyA}`);
    // });

    // it("Update Event A", async () => {
    //     const eventConfigs = getTestEventConfigsA();
    //     await updateEvent(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyA,
    //         eventConfigs.title,
    //         eventConfigs.description,
    //         eventConfigs.location,
    //         eventConfigs.host,
    //         eventConfigs.date,
    //     );
    //     console.log(`Event pubkey: ${eventPubkeyA}`);
    // });

    it("Create Challenge A for Event A", async () => {
        // const keypair = Keypair.generate();
        // const sx = await connection.requestAirdrop(keypair.publicKey, 1 * LAMPORTS_PER_SOL);
        // await connection.confirmTransaction(sx);

        // const challengeConfigs = getTestChallengeConfigsAA();
        // [challengePubkeyAA, challengeIdAA] = await createChallenge(
        //     connection,
        //     eventAuthority,
        //     // keypair,
        //     'Social Photo Challenge',
        //     'Find and Meet Joe with Solana Foundation Developer Relations!',
        //     'donnysolana',
        //     'none',
        // );
        // console.log(`Challenge pubkey: ${challengePubkeyAA}`);
        // console.log(`Challenge ID: ${challengeIdAA}`);

        //
        console.log("== Counter: \n");
        const counterPubkey = (await getChallengeCounterPubkey())[0];
        const counter = await connection.getAccountInfo(counterPubkey);
        assert(counter);
        const parsedCounter = ChallengeCounter.fromBuffer(counter?.data);
        console.log(counterPubkey.toBase58());
        console.log(parsedCounter.challenges_count);
        console.log("== Challenge: \n");
        const chalPubkey = new PublicKey("F2a5e9qPG42NFkk3vP7JZCch5miT6TrrzfFkmwn9DLdc");
        // const chalPubkey = challengePubkeyAA;
        const chal = await connection.getAccountInfo(chalPubkey);
        assert(chal);
        const parsedChal = Challenge.fromBuffer(chal?.data);
        console.log(chalPubkey.toBase58());
        console.log(parsedChal.challenge_id);
        console.log("== Metadata: \n");
        const metadataPubkey = (await getChallengeMetadataPubkey(chalPubkey))[0];
        const metadata = await connection.getAccountInfo(metadataPubkey);
        assert(metadata);
        const parsedMetadata = ChallengeMetadata.fromBuffer(metadata?.data);
        console.log(metadataPubkey.toBase58());
        console.log(parsedMetadata.challenge_description);
        console.log(parsedMetadata.challenge_tags);
    });

    // it("Update Challenge A for Event A", async () => {
    //     const challengeConfigs = getTestChallengeConfigsAA();
    //     await updateChallenge(
    //         connection,
    //         eventAuthority,
    //         challengePubkeyAA,
    //         eventPubkeyA,
    //         challengeConfigs.title,
    //         challengeConfigs.description,
    //         challengeConfigs.author,
    //         challengeConfigs.tags,
    //     );
    //     console.log(`Challenge pubkey: ${challengePubkeyAA}`);
    // });

    // it("Create Prize #1 for Challenge A, Event A", async () => {
    //     const prizeConfigs = getTestPrizeConfigsAA1();
    //     [
    //         PrizePubkeyAA1, 
    //         PrizeIdAA1, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyA,
    //         challengePubkeyAA,
    //         XpTokenSolanaBountyPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         80,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyAA1}`);
    //     console.log(`Prize ID: ${PrizeIdAA1}`);
    // });

    // it("Update Prize #1 for Challenge A, Event A", async () => {
    //     const prizeConfigs = getTestPrizeConfigsAA1();
    //     await updatePrize(
    //         connection,
    //         eventAuthority,
    //         PrizePubkeyAA1,
    //         eventPubkeyA,
    //         challengePubkeyAA,
    //         XpTokenSolanaBountyPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyAA1}`);
    //     console.log(`Prize ID: ${PrizeIdAA1}`);
    // });

    // it("Create Challenge B for Event A, Event A", async () => {
    //     const challengeConfigs = getTestChallengeConfigsAB();
    //     [challengePubkeyAB, challengeIdAB] = await createChallenge(
    //         connection,
    //         eventAuthority,
    //         challengeConfigs.title,
    //         challengeConfigs.description,
    //         challengeConfigs.author,
    //         challengeConfigs.tags,
    //     );
    //     console.log(`Challenge pubkey: ${challengePubkeyAB}`);
    // });

    // it("Create Prize #1 for Challenge B, Event A", async () => {
    //     const prizeConfigs = getTestPrizeConfigsAB1();
    //     [
    //         PrizePubkeyAB1, 
    //         PrizeIdAB1, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyA,
    //         challengePubkeyAB,
    //         XpTokenSolanaBountyPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyAB1}`);
    //     console.log(`Prize ID: ${PrizeIdAB1}`);
    // });

    // it("Create Prize #2 for Challenge B, Event A", async () => {
    //     const prizeConfigs = getTestPrizeConfigsAB2();
    //     [
    //         PrizePubkeyAB2, 
    //         PrizeIdAB2, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyA,
    //         challengePubkeyAB,
    //         nftBadgeShippooorPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyAB2}`);
    //     console.log(`Prize ID: ${PrizeIdAB2}`);
    // });

    // it("Issue all Rewards for Event A: Challenge A", async () => {
    //     rewardsPubkeysChallengeAA = await issueAllRewardsForChallenge(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyA,
    //         challengePubkeyAA,
    //         testEarner.publicKey,
    //     );
    //     for (const reward of rewardsPubkeysChallengeAA) {
    //         console.log(`Reward pubkey: ${reward}`);
    //     }
    // });

    // it("Issue all Rewards for Event A: Challenge B", async () => {
    //     rewardsPubkeysChallengeAB = await issueAllRewardsForChallenge(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyA,
    //         challengePubkeyAB,
    //         testEarner.publicKey,
    //     );
    //     for (const reward of rewardsPubkeysChallengeAB) {
    //         console.log(`Reward pubkey: ${reward}`);
    //     }
    // });

    // // --- Event B

    // it("Create Event B", async () => {
    //     const eventConfigs = getTestEventConfigsB();
    //     [eventPubkeyB, eventIdB] = await createEvent(
    //         connection,
    //         eventAuthority,
    //         eventConfigs.title,
    //         eventConfigs.description,
    //         eventConfigs.location,
    //         eventConfigs.host,
    //         eventConfigs.date,
    //     );
    //     console.log(`Event pubkey: ${eventPubkeyB}`);
    // });

    // it("Create Prize Pot for Event B", async () => {
    //     [
    //         prizePotPubkeyB,
    //         prizePotIdB,
    //     ] = await createPot(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         usdcTestMintAddress,
    //         usdcEscrowAccountPubkey,
    //         MintControl.Escrow,
    //         1000,
    //     );
    //     console.log(`Prize Pot pubkey: ${prizePotPubkeyB}`);
    // });

    // it("Create Challenge A for Event B", async () => {
    //     const challengeConfigs = getTestChallengeConfigsBA();
    //     [challengePubkeyBA, challengeIdBA] = await createChallenge(
    //         connection,
    //         eventAuthority,
    //         challengeConfigs.title,
    //         challengeConfigs.description,
    //         challengeConfigs.author,
    //         challengeConfigs.tags,
    //     );
    //     console.log(`Challenge pubkey: ${challengePubkeyBA}`);
    // });

    // it("Create Prize #1 for Challenge B, Event B", async () => {
    //     const prizeConfigs = getTestPrizeConfigsBA1();
    //     [
    //         PrizePubkeyBA1, 
    //         PrizeIdBA1, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         challengePubkeyBA,
    //         XpTokenSolanaBountyPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyBA1}`);
    //     console.log(`Prize ID: ${PrizeIdBA1}`);
    // });

    // it("Create Prize #2 for Challenge B, Event B", async () => {
    //     const prizeConfigs = getTestPrizeConfigsBA2();
    //     [
    //         PrizePubkeyBA2, 
    //         PrizeIdBA2, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         challengePubkeyBA,
    //         nftBadgeShippooorPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyBA2}`);
    //     console.log(`Prize ID: ${PrizeIdBA2}`);
    // });

    // it("Create Challenge B for Event B", async () => {
    //     const challengeConfigs = getTestChallengeConfigsBB();
    //     [challengePubkeyBB, challengeIdBB] = await createChallenge(
    //         connection,
    //         eventAuthority,
    //         challengeConfigs.title,
    //         challengeConfigs.description,
    //         challengeConfigs.author,
    //         challengeConfigs.tags,
    //     );
    //     console.log(`Challenge pubkey: ${challengePubkeyBB}`);
    // });

    // it("Create Prize #1 for Challenge B, Event B", async () => {
    //     const prizeConfigs = getTestPrizeConfigsBB1();
    //     [
    //         PrizePubkeyBB1, 
    //         PrizeIdBB1, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         challengePubkeyBB,
    //         XpTokenSolanaBountyPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyBB1}`);
    //     console.log(`Prize ID: ${PrizeIdBB1}`);
    // });

    // it("Create Prize #2 for Challenge B, Event B", async () => {
    //     const prizeConfigs = getTestPrizeConfigsBB2();
    //     [
    //         PrizePubkeyBB2, 
    //         PrizeIdBB2, 
    //     ] = await createPrize(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         challengePubkeyBB,
    //         nftBadgeSuperShippooorPubkey,
    //         eventAuthority.publicKey,
    //         prizeConfigs.mint_control,
    //         prizeConfigs.quantity,
    //     );
    //     console.log(`Prize pubkey: ${PrizePubkeyBB2}`);
    //     console.log(`Prize ID: ${PrizeIdBB2}`);
    // });

    // it("Issue all Rewards for Event B: Challenge A", async () => {
    //     rewardsPubkeysChallengeBA = await issueAllRewardsForChallenge(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         challengePubkeyBA,
    //         testEarner.publicKey,
    //     );
    //     for (const reward of rewardsPubkeysChallengeBA) {
    //         console.log(`Reward pubkey: ${reward}`);
    //     }
    // });

    // it("Issue all Rewards for Event B: Challenge B", async () => {
    //     rewardsPubkeysChallengeBB = await issueAllRewardsForChallenge(
    //         connection,
    //         eventAuthority,
    //         eventPubkeyB,
    //         challengePubkeyBB,
    //         testEarner.publicKey,
    //     );
    //     for (const reward of rewardsPubkeysChallengeBB) {
    //         console.log(`Reward pubkey: ${reward}`);
    //     }
    // });

    // it("Issue a Payout for Event B Prize Pot", async () => {
    //     payoutPubkeyEventB = await issuePayout(
    //         connection,
    //         eventAuthority,
    //         prizePotPubkeyB,
    //         testEarner.publicKey,
    //         7,
    //     );
    //     console.log(`Payout pubkey: ${payoutPubkeyEventB}`);
    // });

    // it("Test Batch Rewarding for Event B", async () => {
    //     const batchTestEarnerPubkey1 = Keypair.generate().publicKey;
    //     const batchTestEarnerPubkey2 = Keypair.generate().publicKey;
    //     await issueRewardsBatch(
    //         connection,
    //         eventAuthority,
    //         batchTestEarnerPubkey1,
    //         [challengePubkeyBA, challengePubkeyBB],
    //     );
    //     await issueRewardsBatch(
    //         connection,
    //         eventAuthority,
    //         batchTestEarnerPubkey1,
    //         [
    //             challengePubkeyAA,
    //             challengePubkeyAB,
    //             challengePubkeyBA, 
    //             challengePubkeyBB
    //         ],
    //     );
    //     console.log(`batchTestEarnerPubkey1: ${batchTestEarnerPubkey1}`);
    //     console.log(`batchTestEarnerPubkey2: ${batchTestEarnerPubkey2}`);
    // });

    // // --- Renders

    // it("Fetch Event A", async () => {
    //     const event = await fetchEvent(connection,  eventPubkeyA);
    //     console.log(`Event A: ${event.metadata.event_title}`);
    // });
    
    // it("Fetch Challenge A for Event A", async () => {
    //     const challenge = await fetchChallenge(connection,  challengePubkeyAA);
    //     console.log(`Challenge A: ${challenge.metadata.challenge_title}`);
    // });

    // // it("Fetch all challenges by tag 'deploy'", async () => {
    // //     const challenges = await fetchAllChallengesByTag(connection, "deploy");
    // //     for (const chal of challenges) {
    // //         console.log(`Challenge pubkey: ${chal.address}`);
    // //     }
    // // });
    
    // it("Fetch Prize #1 for Challenge A, Event A", async () => {
    //     const prize = await fetchPrize(connection, PrizePubkeyAA1);
    //     console.log(`Prize: ${prize.prize.quantity.toNumber()}`);
    //     console.log(`Challenge: ${prize.prize.challenge.toBase58()}`);
    // });

    // it("Fetch Prize #1 for Challenge A, Event A (with Mint Metadata)", async () => {
    //     const prize = await fetchPrizeAndMintMetadata(connection, PrizePubkeyAA1);
    //     console.log(`Prize: ${prize.metadata.data.name}`);
    //     console.log(`Challenge: ${prize.prize.challenge.toBase58()}`);
    // });

    // it("Render the test Earner's Solana Resume!", async () => {
    //     printSolanaResume(
    //         await renderSolanaResume(
    //             connection, 
    //             testEarner.publicKey,
    //         ),
    //         testEarner.publicKey,
    //     );
    // });

    // it("Render the authority's Manager Panel!", async () => {
    //     printManagerPanel(
    //         await renderManagerPanel(
    //             connection,
    //             eventAuthority.publicKey,
    //         ),
    //         eventAuthority.publicKey,
    //     );
    // });

});
  