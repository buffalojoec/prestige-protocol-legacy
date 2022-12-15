import * as borsh from "borsh";
import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";

export class Award {

    id: number;
    authority: PublicKey;
    earner: PublicKey;
    event: PublicKey;
    challenge: PublicKey;

    constructor(props: {
        id: number,
        authority: PublicKey,
        earner: PublicKey,
        event: PublicKey,
        challenge: PublicKey,
    }) {
        this.id = props.id;
        this.authority = props.authority;
        this.earner = props.earner;
        this.event = props.event;
        this.challenge = props.challenge;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(AwardSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(AwardSchema, Award, buffer);
        return new Award({
            id: data.id,
            authority: new PublicKey(data.authority),
            earner: new PublicKey(data.earner),
            event: new PublicKey(data.event),
            challenge: new PublicKey(data.challenge),
        });
    }
}

export const AwardSchema = new Map([
    [ Award, { 
        kind: 'struct', 
        fields: [ 
            ['id', 'u16'],
            ['authority', [32]],
            ['earner', [32]],
            ['event', [32]],
            ['challenge', [32]],
        ],
    }]
]);

export class AwardCounter {

    earner: PublicKey;
    count: number;

    constructor(props: {
        earner: PublicKey,
        count: number,
    }) {
        this.earner = props.earner;
        this.count = props.count;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(AwardCounterSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(AwardCounterSchema, AwardCounter, buffer);
        return new AwardCounter({
            earner: new PublicKey(data.earner),
            count: data.count,
        });
    }
}

export const AwardCounterSchema = new Map([
    [ AwardCounter, { 
        kind: 'struct', 
        fields: [ 
            ['earner', [32]],
            ['count', 'u16'],
        ],
    }]
]);