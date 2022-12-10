import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";


export class Event {

    event_id: number;
    pots_count: number;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        event_id: number,
        pots_count: number,
        authority: PublicKey,
        bump: number,
    }) {
        this.event_id = props.event_id;
        this.pots_count = props.pots_count;
        this.authority = props.authority;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const event = borsh.deserialize(EventSchema, Event, buffer);
        return new Event({
            event_id: event.event_id,
            pots_count: event.pots_count,
            authority: new PublicKey(event.authority),
            bump: event.bump,
        });
    }

    static getProgramAccountsFilter(authority: PublicKey) {
        return {
            filters: [
                {
                    dataSize: 35,
                },
                {
                    memcmp: {
                        offset: 2,
                        bytes: authority.toBase58(),
                    }
                }
            ]
        };
    }
}

export const EventSchema = new Map([
    [ Event, { 
        kind: 'struct', 
        fields: [ 
            ['event_id', 'u8'],
            ['pots_count', 'u8'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);



export class EventMetadata {

    event_title: string;
    event_description: string;
    event_location: string;
    event_host: string;
    event_date: string;
    bump: number;

    constructor(props: {
        event_title: string,
        event_description: string,
        event_location: string,
        event_host: string,
        event_date: string,
        bump: number,
    }) {
        this.event_title = props.event_title;
        this.event_description = props.event_description;
        this.event_location = props.event_location;
        this.event_host = props.event_host;
        this.event_date = props.event_date;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const eventMetadata = borsh.deserialize(EventMetadataSchema, EventMetadata, buffer);
        return new EventMetadata({
            event_title: eventMetadata.event_title,
            event_description: eventMetadata.event_description,
            event_location: eventMetadata.event_location,
            event_host: eventMetadata.event_host,
            event_date: eventMetadata.event_date,
            bump: eventMetadata.bump,
        })
    }
}

export const EventMetadataSchema = new Map([
    [ EventMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['event_title', 'string'],
            ['event_description', 'string'],
            ['event_location', 'string'],
            ['event_host', 'string'],
            ['event_date', 'string'],
            ['bump', 'u8'],
        ],
    }]
]);


export class EventCounter {

    events_count: number;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        events_count: number,
        authority: PublicKey,
        bump: number,
    }) {
        this.events_count = props.events_count;
        this.authority = props.authority;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventCounterSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const eventCounter = borsh.deserialize(EventCounterSchema, EventCounter, buffer);
        return new EventCounter({
            events_count: eventCounter.events_count,
            authority: eventCounter.authority,
            bump: eventCounter.bump,
        })
    }
}

export const EventCounterSchema = new Map([
    [ EventCounter, { 
        kind: 'struct', 
        fields: [ 
            ['events_count', 'u8'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);