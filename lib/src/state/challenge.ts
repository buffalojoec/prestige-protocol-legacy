import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Challenge {

    authority: PublicKey;
    title: string;
    description: string;
    author_name: string;
    tags: string;
    endorsements: number;
    contracts_completed: number;
    contracts_created: number;
    status: number;
    bump: number;

    constructor(props: {
        authority: PublicKey,
        title: string,
        description: string,
        author_name: string,
        tags: string,
        endorsements: number,
        contracts_completed: number,
        contracts_created: number,
        status: number,
        bump: number,
    }) {
        this.authority = props.authority;
        this.title = props.title;
        this.description = props.description;
        this.author_name = props.author_name;
        this.tags = props.tags;
        this.endorsements = props.endorsements;
        this.contracts_completed = props.contracts_completed;
        this.contracts_created = props.contracts_created;
        this.status = props.status;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const challenge = borsh.deserialize(ChallengeSchema, Challenge, buffer);
        return new Challenge({
            authority: new PublicKey(challenge.authority),
            title: challenge.title,
            description: challenge.description,
            author_name: challenge.author_name,
            tags: challenge.tags,
            endorsements: challenge.endorsements,
            contracts_completed: challenge.contracts_completed,
            contracts_created: challenge.contracts_created,
            status: challenge.status,
            bump: challenge.bump,
        });
    }
}

export const ChallengeSchema = new Map([
    [ Challenge, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['title', 'string'],
            ['description', 'string'],
            ['author_name', 'string'],
            ['tags', 'string'],
            ['endorsements', 'u32'],
            ['contracts_completed', 'u32'],
            ['contracts_created', 'u32'],
            ['status', 'u8'],
            ['bump', 'u8'],
        ],
    }]
]);