import * as borsh from "borsh";
import BN from 'bn.js';
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";
import { COption } from '.';

export type FixedPrizeList = [
    COption,
    COption,
    COption,
    COption,
    COption,
];

export class FixedPrize {
    
    mint: PublicKey;
    quantity: BN;

    constructor(props: {
        mint: PublicKey,
        quantity: BN,
    }) {
        this.mint = props.mint;
        this.quantity = props.quantity;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(FixedPrizeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const fixedPrize = borsh.deserialize(FixedPrizeSchema, FixedPrize, buffer);
        return new FixedPrize({
            mint: new PublicKey(fixedPrize.mint),
            quantity: fixedPrize.quantity,
        });
    }
}

export const FixedPrizeSchema = new Map([
    [ FixedPrize, { 
        kind: 'struct', 
        fields: [ 
            ['mint', [32]],
            ['quantity', 'u64'],
        ],
    }]
]);

export class Challenge {

    challenge_id: number;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        challenge_id: number,
        authority: PublicKey,
        bump: number,
    }) {
        this.challenge_id = props.challenge_id;
        this.authority = props.authority;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const challenge = borsh.deserialize(ChallengeSchema, Challenge, buffer);
        return new Challenge({
            challenge_id: challenge.challenge_id,
            authority: new PublicKey(challenge.authority),
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
            ['challenge_id', 'u32'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);

export class ChallengeMetadata {

    title: string;
    description: string;
    author: string;
    tags: string;
    uri: string;
    bump: number;
    fixed_prizes: FixedPrizeList;

    constructor(props: {
        title: string,
        description: string,
        author: string,
        tags: string,
        uri: string,
        bump: number,
        fixedPrizes?: FixedPrizeList,
    }) {
        this.title = props.title;
        this.description = props.description;
        this.author = props.author;
        this.tags = props.tags;
        this.uri = props.uri;
        this.bump = props.bump;
        this.fixed_prizes = props.fixedPrizes ?
            props.fixedPrizes
            :
            [
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
            ];
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const challengeMetadata = borsh.deserialize(ChallengeMetadataSchema, ChallengeMetadata, buffer);
        return new ChallengeMetadata({
            title: challengeMetadata.title,
            description: challengeMetadata.description,
            author: challengeMetadata.author,
            tags: challengeMetadata.tags,
            uri: challengeMetadata.uri,
            bump: challengeMetadata.bump,
        });
    }
}

export const ChallengeMetadataSchema = new Map([
    [ ChallengeMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['title', 'string'],
            ['description', 'string'],
            ['author', 'string'],
            ['tags', 'string'],
            ['uri', 'string'],
            ['bump', 'u8'],
            ['fixed_prizes', [36 * 5]],
        ],
    }]
]);