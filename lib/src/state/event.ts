import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    PublicKey 
} from "@solana/web3.js";

export class Event {

    event_id: number;
    authority: PublicKey;
    bump: number;

    constructor(props: {
        event_id: number,
        authority: PublicKey,
        bump: number,
    }) {
        this.event_id = props.event_id;
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
            ['event_id', 'u32'],
            ['authority', [32]],
            ['bump', 'u8'],
        ],
    }]
]);

export class EventMetadata {

    title: string;
    description: string;
    host: string;
    tags: string;
    uri: string;
    bump: number;

    constructor(props: {
        title: string,
        description: string,
        host: string,
        tags: string,
        uri: string,
        bump: number,
    }) {
        this.title = props.title;
        this.description = props.description;
        this.host = props.host;
        this.tags = props.tags;
        this.uri = props.uri;
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(EventMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        const eventMetadata = borsh.deserialize(EventMetadataSchema, EventMetadata, buffer);
        return new EventMetadata({
            title: eventMetadata.title,
            description: eventMetadata.description,
            host: eventMetadata.host,
            tags: eventMetadata.tags,
            uri: eventMetadata.uri,
            bump: eventMetadata.bump,
        })
    }
}

export const EventMetadataSchema = new Map([
    [ EventMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['title', 'string'],
            ['description', 'string'],
            ['host', 'string'],
            ['tags', 'string'],
            ['uri', 'string'],
            ['bump', 'u8'],
        ],
    }]
]);