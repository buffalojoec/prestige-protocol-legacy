import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class User {

    wallet: PublicKey;
    name: string;
    endorsements: number;
    challenges_authored: number;
    contracts_completed: number;
    contracts_created: number;
    events_hosted: number;
    bump: number;

    constructor(props: {
        wallet: PublicKey,
        name: string,
        endorsements: number,
        challenges_authored: number,
        contracts_completed: number,
        contracts_created: number,
        events_hosted: number,
        bump: number,
    }) {
        this.wallet = props.wallet;
        this.name = props.name;
        this.endorsements = props.endorsements;
        this.challenges_authored = props.challenges_authored;
        this.contracts_completed = props.contracts_completed;
        this.contracts_created = props.contracts_created;
        this.events_hosted = props.events_hosted;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(UserSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const user = borsh.deserialize(UserSchema, User, buffer);
        return new User({
            wallet: new PublicKey(user.wallet),
            name: user.name,
            endorsements: user.endorsements,
            challenges_authored: user.challenges_authored,
            contracts_completed: user.contracts_completed,
            contracts_created: user.contracts_created,
            events_hosted: user.events_hosted,
            bump: user.bump,
        });
    }
}

export const UserSchema = new Map([
    [ User, { 
        kind: 'struct', 
        fields: [ 
            ['wallet', [32]],
            ['name', 'string'],
            ['endorsements', 'u32'],
            ['challenges_authored', 'u32'],
            ['contracts_completed', 'u32'],
            ['contracts_created', 'u32'],
            ['events_hosted', 'u32'],
            ['bump', 'u8'],
        ],
    }]
]);