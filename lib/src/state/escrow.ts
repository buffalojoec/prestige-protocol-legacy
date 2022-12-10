import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Escrow {

    authority: PublicKey;
    mint: PublicKey;
    quantity: number;
    bump: number;

    constructor(props: {
        authority: PublicKey,
        mint: PublicKey,
        quantity: number,
        bump: number,
    }) {
        this.authority = props.authority;
        this.mint = props.mint;
        this.quantity = props.quantity;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EscrowSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const escrow = borsh.deserialize(EscrowSchema, Escrow, buffer);
        return new Escrow({
            authority: escrow.authority,
            mint: escrow.mint,
            quantity: escrow.quantity,
            bump: escrow.bump,
        });
    }
}

export const EscrowSchema = new Map([
    [ Escrow, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['mint', [32]],
            ['quantity', 'u8'],
            ['bump', 'u8'],
        ],
    }]
]);