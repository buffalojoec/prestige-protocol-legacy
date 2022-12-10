import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";



export enum MintControl {
    Remintable,
    OneToOne,
    Escrow,
}


export class CustomMint {

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    toBuffer() { 
        return Buffer.from(borsh.serialize(CustomMintSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CustomMintSchema, CustomMint, buffer);
    }
}

export const CustomMintSchema = new Map([
    [ CustomMint, { 
        kind: 'struct', 
        fields: [],
    }]
]);