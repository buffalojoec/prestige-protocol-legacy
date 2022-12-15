import fs from "fs";
import { 
    describe, 
    it,
} from 'mocha';
import os from "os";
import {
    Connection, 
    Keypair, 
    PublicKey,
} from '@solana/web3.js';
import {
    BadgeWrapper,
    ChallengeWrapper,
    EventWrapper,
    UserWrapper,
    createBadge,
    createChallenge,
    createEvent,
    createUser,
    fetchBadge,
    fetchChallenge,
    fetchEvent,
    fetchUser,
    getMintBalance,
    mintBadge,
    userPda,
} from '../src';

export function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(path, "utf-8")))
    )
}

// export function printSolanaResume(solanaResume: SolanaResume, earner: PublicKey): void {
//     console.log("====================================================");
//     console.log("Solana Resume:");
//     console.log(`Earner: ${earner.toString()}`);
//     console.log("- Achievements:");
//     for (const achievement of solanaResume.achievements) {
//         console.log(`   - ${achievement.eventTitle}`);
//         for (const challenge of achievement.challengesCompleted) {
//             console.log(`       - ${challenge.challengeTitle}`);
//             for (const reward of challenge.rewards) {
//                 console.log(`           - ${reward.title}   ${reward.quantity}`);
//             }
//         }
//     }
//     console.log("====================================================");
// }

// export function printManagerPanel(managerPanel: ManagerPanel, authority: PublicKey): void {
//     console.log("====================================================");
//     console.log("Manager Panel:");
//     console.log(`Authority: ${authority.toString()}`);
//     console.log("- Events:");
//     for (const event of managerPanel.managedEvents) {
//         console.log(`   - ${event.eventTitle}`);
//         for (const challenge of event.challengesCompleted) {
//             console.log(`       - ${challenge.challengeTitle}`);
//             for (const reward of challenge.rewards) {
//                 console.log(`           - ${reward.title}   ${reward.quantity}`);
//             }
//         }
//     }
//     console.log("====================================================");
// }

describe("Prestige Protocol: Unit Tests", async () => {

    const connection = new Connection('https://api.devnet.solana.com/', 'confirmed');
    // const connection = new Connection('http://localhost:8899', 'confirmed');
    
    const challengeAuthority = createKeypairFromFile(os.homedir() + '/.config/solana/id-prestige-auth-1.json');
    const eventAuthority = createKeypairFromFile(os.homedir() + '/.config/solana/id-prestige-auth-2.json');
    const testEarner = createKeypairFromFile(os.homedir() + '/.config/solana/id-prestige-earner-1.json');

    // let usdcTestMintAddress: PublicKey;
    // let usdcEscrowAccountPublicKey: PublicKey;

    let userPublicKey: PublicKey;

    let eventPublicKeyA: PublicKey;
    let challengePublicKeyAA: PublicKey;
    let challengePublicKeyAB: PublicKey;

    let badgeMintPublicKeyAA: PublicKey;
    let badgeMintPublicKeyAB: PublicKey;

    let eventPublicKeyB: PublicKey;
    let challengePublicKeyBA: PublicKey;
    let challengePublicKeyBB: PublicKey;
    let badgeMintPublicKeyBA: PublicKey;
    let badgeMintPublicKeyBB: PublicKey;

    // --- Testing creation USDC escrow for fixed prizes

    // it("Create a test Protocol Token mint and escrow", async () => {
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
    //     usdcEscrowAccountPublicKey = escrowTokenAccount.address;
    //     console.log(`USDC test mint:  ${usdcTestMintAddress}`);
    //     console.log(`USDC escrow token address:  ${usdcEscrowAccountPublicKey}`);
    // });

    // it("Fund the test USDC escrow", async () => {
    //     await mintTo(
    //         connection,
    //         eventAuthority,
    //         usdcTestMintAddress,
    //         usdcEscrowAccountPublicKey,
    //         eventAuthority.publicKey,
    //         10000,
    //     );
    //     const escrowTokenAccount = await getOrCreateAssociatedTokenAccount(
    //         connection,
    //         eventAuthority,
    //         usdcTestMintAddress,
    //         eventAuthority.publicKey,
    //     );
    //     console.log(`Escrow test USDC balance:  ${escrowTokenAccount.amount}`);
    // });

    async function testCreateReadUser(wallet: Keypair): Promise<PublicKey> {
        let userPublicKey = userPda(wallet.publicKey)[0];
        let userData: UserWrapper;
        try {
            userData = await fetchUser(
                connection,
                userPublicKey,
            );
            userPublicKey = userData.address;
            console.log(`*> User exists`);
        } catch (_) {
            userPublicKey = await createUser(
                connection,
                wallet,
                "test-username",
                { skipPreflight: true }
            );
            userData = await fetchUser(
                connection,
                userPublicKey,
            );
        }
        console.log(`Wallet Public Key      :  ${wallet.publicKey.toBase58()}`);
        console.log(`User Public Key        :  ${userPublicKey}`);
        console.log(`Username               :  ${userData.user.username}`);
        return userPublicKey
    }

    it(
        "Create a User for our test Challenge Authority", 
        async () => userPublicKey = await testCreateReadUser(challengeAuthority),
    );
    it(
        "Create a User for our test Event Authority", 
        async () => userPublicKey = await testCreateReadUser(eventAuthority),
    );

    async function testCreateReadEvent(
        authority: Keypair,
        title: string,
        description: string,
        host: string,
        tags: string,
        uri: string,
    ): Promise<PublicKey> {
        const eventPublicKey = (await createEvent(
            connection,
            authority,
            title,
            description,
            host,
            tags,
            uri,
            { skipPreflight: true }
        ))[0];
        const eventData = await fetchEvent(
            connection,
            eventPublicKey,
        );
        console.log(`Authority Public Key   :  ${authority.publicKey.toBase58()}`);
        console.log(`Event Public Key       :  ${eventPublicKey}`);
        console.log(`Event Title            :  ${eventData.metadata.title}`);
        return eventPublicKey
    }

    it(
        "Create Event #1", 
        async () => eventPublicKeyA = await testCreateReadEvent(
            eventAuthority,
            "Joe's Event",
            'An event hosted by Joe',
            'Joe C',
            'development,NTFs',
            '',
        ),
    );
    it(
        "Create Event #2", 
        async () => eventPublicKeyB = await testCreateReadEvent(
            eventAuthority,
            "Chuck's Event",
            'An event hosted by Chuck',
            'Chuck N',
            'business,marketing',
            '',
        ),
    );

    async function testCreateReadChallenge(
        authority: Keypair,
        title: string,
        description: string,
        author: string,
        tags: string,
        uri: string,
    ): Promise<PublicKey> {
        const challengePublicKey = (await createChallenge(
            connection,
            authority,
            title,
            description,
            author,
            tags,
            uri,
            { skipPreflight: true }
        ))[0];
        const challengeData = await fetchChallenge(
            connection,
            challengePublicKey,
        );
        console.log(`Authority Public Key   :  ${authority.publicKey.toBase58()}`);
        console.log(`Challenge Public Key   :  ${challengePublicKey}`);
        console.log(`Challenge Title        :  ${challengeData.metadata.title}`);
        return challengePublicKey
    }

    it(
        "Create Challenge #1 for Event A", 
        async () => challengePublicKeyAA = await testCreateReadChallenge(
            challengeAuthority,
            "Joe's Challenge",
            'A event hosted by Joe',
            'Joe C',
            'development,NTFs',
            '',
        ),
    );
    it(
        "Create Challenge #2 for Event A", 
        async () => challengePublicKeyAB = await testCreateReadChallenge(
            challengeAuthority,
            "Chuck's Challenge",
            'A challenge hosted by Chuck',
            'Chuck N',
            'business,marketing',
            '',
        ),
    );
    it(
        "Create Challenge #1 for Event B", 
        async () => challengePublicKeyAB = await testCreateReadChallenge(
            challengeAuthority,
            "Bob's Challenge",
            'A challenge hosted by Bob',
            'Bob V',
            'business,NFTs,gaming',
            '',
        ),
    );
    it(
        "Create Challenge #2 for Event B", 
        async () => challengePublicKeyBB = await testCreateReadChallenge(
            challengeAuthority,
            "Steve's Challenge",
            'A challenge hosted by Steve',
            'Steve N',
            'DeFi,gambling',
            '',
        ),
    );

    async function testCreateReadBadge(
        authority: Keypair,
        challenge: PublicKey,
        event: PublicKey,
        title: string,
        symbol: string,
        uri: string,
    ): Promise<PublicKey> {
        const badgePublicKey = (await createBadge(
            connection,
            authority,
            challenge,
            event,
            title,
            symbol,
            uri,
            { skipPreflight: true }
        ))[0];
        const badgeData = await fetchBadge(
            connection,
            badgePublicKey,
        );
        console.log(`Authority Public Key   :  ${authority.publicKey.toBase58()}`);
        console.log(`Badge Public Key   :  ${badgePublicKey}`);
        console.log(`Badge Title        :  ${badgeData.mintMetadata.data.name}`);
        return badgePublicKey
    }

    it(
        "Create Badge for Event A, Challenge A", 
        async () => badgeMintPublicKeyAA = await testCreateReadBadge(
            eventAuthority,
            challengePublicKeyAA,
            eventPublicKeyA,
            "Joe's Badge #AA",
            'AABDG',
            '',
        ),
    );
    it(
        "Create Badge for Event A, Challenge B", 
        async () => badgeMintPublicKeyAB = await testCreateReadBadge(
            eventAuthority,
            challengePublicKeyAB,
            eventPublicKeyA,
            "Joe's Badge #AB",
            'ABBDG',
            '',
        ),
    );
    it(
        "Create Badge for Event B, Challenge A", 
        async () => badgeMintPublicKeyBA = await testCreateReadBadge(
            eventAuthority,
            challengePublicKeyBA,
            eventPublicKeyB,
            "Joe's Badge #BA",
            'BABDG',
            '',
        ),
    );
    it(
        "Create Badge for Event B, Challenge B", 
        async () => badgeMintPublicKeyAB = await testCreateReadBadge(
            eventAuthority,
            challengePublicKeyAB,
            eventPublicKeyB,
            "Joe's Badge #AB",
            'ABBDG',
            '',
        ),
    );

    async function testMintBadge(
        authority: Keypair,
        badgeMint: PublicKey,
        earnerPublicKey: PublicKey,
    ) {
        await mintBadge(connection, authority, badgeMint, earnerPublicKey);
        const initialBalance = await getMintBalance(connection, badgeMint, earnerPublicKey);
        const resultingBalance = await getMintBalance(connection, badgeMint, earnerPublicKey);
        console.log(`Wallet Public Key  :  ${earnerPublicKey.toBase58()}`);
        console.log(`Badge Mint         :  ${badgeMint}`);
        console.log(`- Initial Balance  :  ${initialBalance}`);
        console.log(`- Resulting Balance:  ${resultingBalance}`);
    }

    it(
        "Mint Badge #AA to our earner", 
        async () => await testMintBadge(
            eventAuthority,
            badgeMintPublicKeyAA,
            testEarner.publicKey,
        ),
    );
    it(
        "Mint Badge #AB to our earner", 
        async () => await testMintBadge(
            eventAuthority,
            badgeMintPublicKeyAB,
            testEarner.publicKey,
        ),
    );
    it(
        "Mint Badge #BA to our earner", 
        async () => await testMintBadge(
            eventAuthority,
            badgeMintPublicKeyBA,
            testEarner.publicKey,
        ),
    );
    it(
        "Mint Badge #BB to our earner", 
        async () => await testMintBadge(
            eventAuthority,
            badgeMintPublicKeyBB,
            testEarner.publicKey,
        ),
    );
});
  