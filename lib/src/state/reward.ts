import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Reward {

    earner: PublicKey;
    prize: PublicKey;
    bump: number;

    constructor(props: {
        earner: PublicKey,
        prize: PublicKey,
        bump: number,
    }) {
        this.earner = props.earner;
        this.prize = props.prize;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(RewardSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const reward = borsh.deserialize(RewardSchema, Reward, buffer);
        return new Reward({
            earner: new PublicKey(reward.earner),
            prize: new PublicKey(reward.prize),
            bump: reward.bump,
        });
    }

    static getProgramAccountsFilter(earner: PublicKey) {
        return {
            filters: [
                {
                    dataSize: 65,
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

export const RewardSchema = new Map([
    [ Reward, { 
        kind: 'struct', 
        fields: [ 
            ['earner', [32]],
            ['prize', [32]],
            ['bump', 'u8'],
        ],
    }]
]);