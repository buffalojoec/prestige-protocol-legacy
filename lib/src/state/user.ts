import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";

export class User {

    challenges_authored: number;
    events_hosted: number;
    username: string;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        challenges_authored: number,
        events_hosted: number,
        username: string,
        authority: PublicKey,
        bump: number,
    }) {
        this.challenges_authored = props.challenges_authored;
        this.events_hosted = props.events_hosted;
        this.username = props.username;
        this.authority = props.authority;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(UserSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const user = borsh.deserialize(UserSchema, User, buffer);
        return new User({
            challenges_authored: user.challenges_authored,
            events_hosted: user.events_hosted,
            username: user.username,
            authority: new PublicKey(user.authority),
            bump: user.bump,
        });
    }
}

export const UserSchema = new Map([
    [ User, { 
        kind: 'struct', 
        fields: [ 
            ['challenges_authored', 'u32'],
            ['events_hosted', 'u32'],
            ['username', 'string'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);