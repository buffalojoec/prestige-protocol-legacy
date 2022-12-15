import * as borsh from "borsh";
import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";

export class Challenge {

    id: number;
    authority: PublicKey;

    constructor(props: {
        id: number,
        authority: PublicKey,
    }) {
        this.id = props.id;
        this.authority = props.authority;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(ChallengeSchema, Challenge, buffer);
        return new Challenge({
            id: data.id,
            authority: new PublicKey(data.authority),
        });
    }
}

export const ChallengeSchema = new Map([
    [ Challenge, { 
        kind: 'struct', 
        fields: [ 
            ['id', 'u16'],
            ['authority', [32]],
        ],
    }]
]);

export class ChallengeMetadata {

    authority: PublicKey;
    challenge: PublicKey;
    title: string;
    description: string;
    tags: string;
    author: string;
    uri: string;

    constructor(props: {
        authority: PublicKey,
        challenge: PublicKey,
        title: string,
        description: string,
        tags: string,
        author: string,
        uri: string,
    }) {
        this.authority = props.authority;
        this.challenge = props.challenge;
        this.title = props.title;
        this.description = props.description;
        this.tags = props.tags;
        this.author = props.author;
        this.uri = props.uri;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(ChallengeMetadataSchema, ChallengeMetadata, buffer);
        return new ChallengeMetadata({
            authority: new PublicKey(data.authority),
            challenge: new PublicKey(data.challenge),
            title: data.title,
            description: data.description,
            tags: data.tags,
            author: data.author,
            uri: data.uri,
        });
    }
}

export const ChallengeMetadataSchema = new Map([
    [ ChallengeMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['challenge', [32]],
            ['title', 'string'],
            ['description', 'string'],
            ['tags', 'string'],
            ['author', 'string'],
            ['uri', 'string'],
        ],
    }]
]);

export class ChallengeCounter {

    authority: PublicKey;
    count: number;

    constructor(props: {
        authority: PublicKey,
        count: number,
    }) {
        this.authority = props.authority;
        this.count = props.count;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeCounterSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(ChallengeCounterSchema, ChallengeCounter, buffer);
        return new ChallengeCounter({
            count: data.count,
            authority: new PublicKey(data.authority),
        })
    }
}

export const ChallengeCounterSchema = new Map([
    [ ChallengeCounter, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['count', 'u16'],
        ],
    }]
]);