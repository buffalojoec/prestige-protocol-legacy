import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";


export class PrestigeMintAuthority {

    bump: number;

    constructor(props: {
        bump: number,
    }) {
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(PrestigeMintAuthoritySchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(PrestigeMintAuthoritySchema, PrestigeMintAuthority, buffer);
    }
}

export const PrestigeMintAuthoritySchema = new Map([
    [ PrestigeMintAuthority, { 
        kind: 'struct', 
        fields: [ 
            ['bump', 'u8'],
        ],
    }]
]);