import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Event {

    authority: PublicKey;
    title: string;
    description: string;
    location: string;
    host_name: string;
    date: string;
    endorsements: number;
    contracts_completed: number;
    bump: number;

    constructor(props: {
        authority: PublicKey,
        title: string,
        description: string,
        location: string,
        host_name: string,
        date: string,
        endorsements: number,
        contracts_completed: number,
        bump: number,
    }) {
        this.authority = props.authority;
        this.title = props.title;
        this.description = props.description;
        this.location = props.location;
        this.host_name = props.host_name;
        this.date = props.date;
        this.endorsements = props.endorsements;
        this.contracts_completed = props.contracts_completed;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const event = borsh.deserialize(EventSchema, Event, buffer);
        return new Event({
            authority: new PublicKey(event.authority),
            title: event.title,
            description: event.description,
            location: event.location,
            host_name: event.host_name,
            date: event.date,
            endorsements: event.endorsements,
            contracts_completed: event.contracts_completed,
            bump: event.bump,
        });
    }
}

export const EventSchema = new Map([
    [ Event, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['title', 'string'],
            ['description', 'string'],
            ['location', 'string'],
            ['host_name', 'string'],
            ['date', 'string'],
            ['endorsements', 'u32'],
            ['contracts_completed', 'u32'],
            ['bump', 'u8'],
        ],
    }]
]);