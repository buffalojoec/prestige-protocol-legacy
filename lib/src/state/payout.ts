import * as borsh from "borsh";
import BN from "bn.js";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Payout {

    earner: PublicKey;
    pot: PublicKey;
    amount: BN;
    bump: number;

    constructor(props: {
        earner: PublicKey,
        pot: PublicKey,
        amount: BN,
        bump: number,
    }) {
        this.earner = props.earner;
        this.pot = props.pot;
        this.amount = props.amount;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(PayoutSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const reward = borsh.deserialize(PayoutSchema, Payout, buffer);
        return new Payout({
            earner: new PublicKey(reward.earner),
            pot: new PublicKey(reward.pot),
            amount: reward.amount,
            bump: reward.bump,
        });
    }

    static getProgramAccountsFilter(earner: PublicKey) {
        return {
            filters: [
                {
                    dataSize: 73,
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: earner.toBase58(),
                    }
                }
            ]
        };
    }
}

export const PayoutSchema = new Map([
    [ Payout, { 
        kind: 'struct', 
        fields: [ 
            ['earner', [32]],
            ['pot', [32]],
            ['amount', 'u64'],
            ['bump', 'u8'],
        ],
    }]
]);