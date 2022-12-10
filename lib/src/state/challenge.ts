import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Challenge {

    challenge_id: number;
    prizes_count: number;
    author: PublicKey;
    bump: number;

    constructor(props: {
        challenge_id: number,
        prizes_count: number,
        author: PublicKey,
        bump: number,
    }) {
        this.challenge_id = props.challenge_id;
        this.prizes_count = props.prizes_count;
        this.author = props.author;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const challenge = borsh.deserialize(ChallengeSchema, Challenge, buffer);
        return new Challenge({
            challenge_id: challenge.challenge_id,
            prizes_count: challenge.prizes_count,
            author: new PublicKey(challenge.author),
            bump: challenge.bump,
        });
    }

    static getProgramAccountsFilter(authority: PublicKey) {
        return {
            filters: [
                {
                    dataSize: 35,
                },
                {
                    memcmp: {
                        offset: 2,
                        bytes: authority.toBase58(),
                    }
                }
            ]
        };
    }
}

export const ChallengeSchema = new Map([
    [ Challenge, { 
        kind: 'struct', 
        fields: [ 
            ['challenge_id', 'u8'],
            ['prizes_count', 'u8'],
            ['author', [32]],
            ['bump', 'u8'],
        ],
    }]
]);


export class ChallengeMetadata {

    challenge_title: string;
    challenge_description: string;
    challenge_author: string;
    challenge_tags: string;
    bump: number;

    constructor(props: {
        challenge_title: string,
        challenge_description: string,
        challenge_author: string,
        challenge_tags: string,
        bump: number,
    }) {
        this.challenge_title = props.challenge_title;
        this.challenge_description = props.challenge_description;
        this.challenge_author = props.challenge_author;
        this.challenge_tags = props.challenge_tags;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const challengeMetadata = borsh.deserialize(ChallengeMetadataSchema, ChallengeMetadata, buffer);
        return new ChallengeMetadata({
            challenge_title: challengeMetadata.challenge_title,
            challenge_description: challengeMetadata.challenge_description,
            challenge_author: challengeMetadata.challenge_author,
            challenge_tags: challengeMetadata.challenge_tags,
            bump: challengeMetadata.bump,
        });
    }
}

export const ChallengeMetadataSchema = new Map([
    [ ChallengeMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['challenge_title', 'string'],
            ['challenge_description', 'string'],
            ['challenge_author', 'string'],
            ['challenge_tags', 'string'],
            ['bump', 'u8'],
        ],
    }]
]);


export class ChallengeCounter {

    challenges_count: number;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        challenges_count: number,
        authority: PublicKey,
        bump: number,
    }) {
        this.challenges_count = props.challenges_count;
        this.authority = props.authority;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeCounterSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const challengeCounter = borsh.deserialize(ChallengeCounterSchema, ChallengeCounter, buffer);
        return new ChallengeCounter({
            challenges_count: challengeCounter.challenges_count,
            authority: challengeCounter.authority,
            bump: challengeCounter.bump,
        })
    }
}

export const ChallengeCounterSchema = new Map([
    [ ChallengeCounter, { 
        kind: 'struct', 
        fields: [ 
            ['challenges_count', 'u8'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);