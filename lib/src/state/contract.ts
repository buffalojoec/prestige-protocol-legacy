import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Contract {

    authority: PublicKey;
    challenge: PublicKey;
    earner: PublicKey;
    event: PublicKey;
    escrows_created: number;
    status: number;
    bump: number;

    constructor(props: {
        authority: PublicKey,
        challenge: PublicKey,
        earner: PublicKey,
        event: PublicKey,
        escrows_created: number,
        status: number,
        bump: number,
    }) {
        this.authority = props.authority;
        this.challenge = props.challenge;
        this.earner = props.earner;
        this.event = props.event;
        this.escrows_created = props.escrows_created;
        this.status = props.status;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(ContractSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const contract = borsh.deserialize(ContractSchema, Contract, buffer);
        return new Contract({
            authority: contract.authority,
            challenge: contract.challenge,
            earner: contract.earner,
            event: contract.event,
            escrows_created: contract.escrows_created,
            status: contract.status,
            bump: contract.bump,
        });
    }
}

export const ContractSchema = new Map([
    [ Contract, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['challenge', [32]],
            ['earner', [32]],
            ['event', [32]],
            ['escrows_created', 'u32'],
            ['status', 'u8'],
            ['bump', 'u8'],
        ],
    }]
]);