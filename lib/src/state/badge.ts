import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";

export class BadgeMetadata {

    challenge: PublicKey;
    event: PublicKey;
    bump: number;

    constructor(props: {
        challenge: PublicKey,
        event: PublicKey,
        bump: number,
    }) {
        this.challenge = props.challenge;
        this.event = props.event;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(BadgeMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const reward = borsh.deserialize(BadgeMetadataSchema, BadgeMetadata, buffer);
        return new BadgeMetadata({
            challenge: new PublicKey(reward.challenge),
            event: new PublicKey(reward.event),
            bump: reward.bump,
        });
    }

    static getProgramAccountsFilter(challenge: PublicKey) {
        return {
            filters: [
                {
                    dataSize: 65,
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: challenge.toBase58(),
                    }
                }
            ]
        };
    }
}

export const BadgeMetadataSchema = new Map([
    [ BadgeMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['challenge', [32]],
            ['event', [32]],
            ['bump', 'u8'],
        ],
    }]
]);