import fs from "fs";
import { describe, it } from 'mocha';
import os from "os";
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
    createAward,
    createChallenge,
    createEvent,
    fetchAllFullAwardDatas,
    fetchChallenge,
    fetchEvent,
    fetchFullAwardData,
} from '../src';

export function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(path, "utf-8")))
    )
}

describe("Prestige Protocol: Unit Tests", async () => {

    const connection = new Connection('https://api.devnet.solana.com/', 'confirmed');
    // const connection = new Connection('http://localhost:8899', 'confirmed');
    
    const challengeAuthority = createKeypairFromFile(os.homedir() + '/.config/solana/prestige/testing/test-id-1.json');
    const eventAuthority = createKeypairFromFile(os.homedir() + '/.config/solana/prestige/testing/test-id-2.json');
    const testEarner = createKeypairFromFile(os.homedir() + '/.config/solana/prestige/testing/test-id-3.json');

    let eventPublicKeyA: PublicKey;
    let challengePublicKeyAA: PublicKey;
    let challengePublicKeyAB: PublicKey;

    let eventPublicKeyB: PublicKey;
    let challengePublicKeyBA: PublicKey;
    let challengePublicKeyBB: PublicKey;

    async function testCreateReadEvent(
        authority: Keypair,
        title: string,
        description: string,
        location: string,
        date: string,
        host: string,
        uri: string,
    ): Promise<PublicKey> {
        const eventPublicKey = (await createEvent(
            connection,
            authority,
            title,
            description,
            location,
            date,
            host,
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
            'Buffalo, NY',
            '12-12-2022',
            'Joe C',
            '',
        ),
    );
    it(
        "Create Event #2", 
        async () => eventPublicKeyB = await testCreateReadEvent(
            eventAuthority,
            "Chuck's Event",
            'An event hosted by Chuck',
            'London, UK',
            '12-12-2022',
            'Chuck N',
            '',
        ),
    );

    async function testCreateReadChallenge(
        authority: Keypair,
        title: string,
        description: string,
        tags: string,
        author: string,
        uri: string,
    ): Promise<PublicKey> {
        const challengePublicKey = (await createChallenge(
            connection,
            authority,
            title,
            description,
            tags,
            author,
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
            'development,NTFs',
            'Joe C',
            '',
        ),
    );
    it(
        "Create Challenge #2 for Event A", 
        async () => challengePublicKeyAB = await testCreateReadChallenge(
            challengeAuthority,
            "Chuck's Challenge",
            'A challenge hosted by Chuck',
            'business,marketing',
            'Chuck N',
            '',
        ),
    );
    it(
        "Create Challenge #1 for Event B", 
        async () => challengePublicKeyBA = await testCreateReadChallenge(
            challengeAuthority,
            "Bob's Challenge",
            'A challenge hosted by Bob',
            'business,NFTs,gaming',
            'Bob V',
            '',
        ),
    );
    it(
        "Create Challenge #2 for Event B", 
        async () => challengePublicKeyBB = await testCreateReadChallenge(
            challengeAuthority,
            "Steve's Challenge",
            'A challenge hosted by Steve',
            'DeFi,gambling',
            'Steve N',
            '',
        ),
    );

    async function testCreateReadAward(
        authority: Keypair,
        event: PublicKey,
        challenge: PublicKey,
        earner: PublicKey,
    ): Promise<PublicKey> {
        const awardPublicKey = (await createAward(
            connection,
            authority,
            event,
            challenge,
            earner,
            { skipPreflight: true }
        ))[0];
        const fullAwardData = await fetchFullAwardData(
            connection,
            awardPublicKey,
        );
        console.log(`Authority Public Key   :  ${authority.publicKey.toBase58()}`);
        console.log(`Award Public Key       :  ${awardPublicKey}`);
        console.log(`Event Title            :  ${
            fullAwardData.eventMetadata ? fullAwardData.eventMetadata.title : "No event metadata found"
        }`);
        console.log(`Challenge Title        :  ${
            fullAwardData.challengeMetadata ? fullAwardData.challengeMetadata.title : "No challenge metadata found"
        }`);
        return awardPublicKey
    }

    it(
        "Create Award for Event A, Challenge A", 
        async () => await testCreateReadAward(
            eventAuthority,
            eventPublicKeyA,
            challengePublicKeyAA,
            testEarner.publicKey,
        ),
    );
    it(
        "Create Award for Event A, Challenge B", 
        async () => await testCreateReadAward(
            eventAuthority,
            eventPublicKeyA,
            challengePublicKeyAB,
            testEarner.publicKey,
        ),
    );
    it(
        "Create Award for Event B, Challenge A", 
        async () => await testCreateReadAward(
            eventAuthority,
            eventPublicKeyB,
            challengePublicKeyBA,
            testEarner.publicKey,
        ),
    );
    it(
        "Create Award for Event B, Challenge B", 
        async () => await testCreateReadAward(
            eventAuthority,
            eventPublicKeyB,
            challengePublicKeyBB,
            testEarner.publicKey,
        ),
    );

    async function printAllAwards() {
        (await fetchAllFullAwardDatas(connection, testEarner.publicKey))
            .forEach((fullAwardData) => {
                console.log(`Event Title            :  ${
                    fullAwardData.eventMetadata ? fullAwardData.eventMetadata.title : "No event metadata found"
                }`);
                console.log(`Challenge Title        :  ${
                    fullAwardData.challengeMetadata ? fullAwardData.challengeMetadata.title : "No challenge metadata found"
                }`);
            })
    }

    it(
        "Print all awards earned by the Test Earner", 
        async () => await printAllAwards(),
    );
});
  