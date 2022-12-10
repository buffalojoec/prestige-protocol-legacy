import * as borsh from "borsh";
import * as BN from 'bn.js';
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";
import { 
    MintControl 
} from "./mint";


export class Prize {

    mint_control: MintControl;
    quantity: BN;
    mint: PublicKey;
    escrow_or_mint_authority: PublicKey;
    
    rewards_count: number;

    challenge: PublicKey;
    event: PublicKey;
    bump: number;

    constructor(props: {
        mint_control: MintControl,
        quantity: BN,
        mint: PublicKey,
        escrow_or_mint_authority: PublicKey,
        rewards_count: number,
        challenge: PublicKey,
        event: PublicKey,
        bump: number,
    }) {
        this.mint_control = props.mint_control;
        this.quantity = props.quantity;
        this.mint = props.mint;
        this.escrow_or_mint_authority = props.escrow_or_mint_authority;
        this.rewards_count = props.rewards_count;
        this.challenge = props.challenge;
        this.event = props.event;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(PrizeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const prize = borsh.deserialize(PrizeSchema, Prize, buffer);
        return new Prize({
            mint_control: <MintControl> prize.mint_control,
            quantity: prize.quantity,
            mint: new PublicKey(prize.mint),
            escrow_or_mint_authority: new PublicKey(prize.escrow_or_mint_authority),
            rewards_count: prize.rewards_count,
            challenge: new PublicKey(prize.challenge),
            event: new PublicKey(prize.event),
            bump: prize.bump,
        });
    }

    static getProgramAccountsFilterByEvent(eventPubkey: PublicKey) {
        return {
            filters: [
                {
                    dataSize: 139,
                },
                {
                    memcmp: {
                        offset: 106,
                        bytes: eventPubkey.toBase58(),
                    }
                }
            ]
        };
    }
}

export const PrizeSchema = new Map([
    [ Prize, { 
        kind: 'struct', 
        fields: [ 
            ['mint_control', 'u8'],
            ['quantity', 'u64'],
            ['mint', [32]],
            ['escrow_or_mint_authority', [32]],
            ['rewards_count', 'u8'],
            ['challenge', [32]],
            ['event', [32]],
            ['bump', 'u8'],
        ],
    }]
]);