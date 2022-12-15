import * as borsh from "borsh";
import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";

export class Event {

    id: number;
    authority: PublicKey;

    constructor(props: {
        id: number,
        authority: PublicKey,
    }) {
        this.id = props.id;
        this.authority = props.authority;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(EventSchema, Event, buffer);
        return new Event({
            id: data.id,
            authority: new PublicKey(data.authority),
        });
    }
}

export const EventSchema = new Map([
    [ Event, { 
        kind: 'struct', 
        fields: [ 
            ['id', 'u16'],
            ['authority', [32]],
        ],
    }]
]);

export class EventMetadata {

    authority: PublicKey;
    event: PublicKey;
    title: string;
    description: string;
    location: string;
    host: string;
    date: string;
    uri: string;

    constructor(props: {
        authority: PublicKey,
        event: PublicKey,
        title: string,
        description: string,
        location: string,
        host: string,
        date: string,
        uri: string,
    }) {
        this.authority = props.authority;
        this.event = props.event;
        this.title = props.title;
        this.description = props.description;
        this.location = props.location;
        this.host = props.host;
        this.date = props.date;
        this.uri = props.uri;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(EventMetadataSchema, EventMetadata, buffer);
        return new EventMetadata({
            authority: new PublicKey(data.authority),
            event: new PublicKey(data.event),
            title: data.title,
            description: data.description,
            location: data.location,
            host: data.host,
            date: data.date,
            uri: data.uri,
        });
    }
}

export const EventMetadataSchema = new Map([
    [ EventMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['event', [32]],
            ['title', 'string'],
            ['description', 'string'],
            ['location', 'string'],
            ['host', 'string'],
            ['date', 'string'],
            ['uri', 'string'],
        ],
    }]
]);

export class EventCounter {

    authority: PublicKey;
    count: number;

    constructor(props: {
        authority: PublicKey,
        count: number,
    }) {
        this.authority = props.authority;
        this.count = props.count;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventCounterSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const data = borsh.deserialize(EventCounterSchema, EventCounter, buffer);
        return new EventCounter({
            count: data.count,
            authority: new PublicKey(data.authority),
        })
    }
}

export const EventCounterSchema = new Map([
    [ EventCounter, { 
        kind: 'struct', 
        fields: [ 
            ['authority', [32]],
            ['count', 'u16'],
        ],
    }]
]);