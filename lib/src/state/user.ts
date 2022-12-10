import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class User {

    username: string;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        username: string,
        authority: PublicKey,
        bump: number,
    }) {
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
            ['username', 'string'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);