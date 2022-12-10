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


export class Pot {

    mint_control: MintControl;
    pot: BN;
    mint: PublicKey;
    escrow_or_mint_authority: PublicKey;
    
    payouts_count: number;

    event: PublicKey;
    bump: number;

    constructor(props: {
        mint_control: MintControl,
        pot: BN,
        mint: PublicKey,
        escrow_or_mint_authority: PublicKey,
        payouts_count: number,
        event: PublicKey,
        bump: number,
    }) {
        this.mint_control = props.mint_control;
        this.pot = props.pot;
        this.mint = props.mint;
        this.escrow_or_mint_authority = props.escrow_or_mint_authority;
        this.payouts_count = props.payouts_count;
        this.event = props.event;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(PotSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const prize = borsh.deserialize(PotSchema, Pot, buffer);
        return new Pot({
            mint_control: <MintControl> prize.mint_control,
            pot: prize.pot,
            mint: new PublicKey(prize.mint),
            escrow_or_mint_authority: new PublicKey(prize.escrow_or_mint_authority),
            payouts_count: prize.payouts_count,
            event: new PublicKey(prize.event),
            bump: prize.bump,
        });
    }
}

export const PotSchema = new Map([
    [ Pot, { 
        kind: 'struct', 
        fields: [ 
            ['mint_control', 'u8'],
            ['pot', 'u64'],
            ['mint', [32]],
            ['escrow_or_mint_authority', [32]],
            ['payouts_count', 'u8'],
            ['event', [32]],
            ['bump', 'u8'],
        ],
    }]
]);