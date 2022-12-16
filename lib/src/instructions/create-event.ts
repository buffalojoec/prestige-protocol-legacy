import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    ConfirmOptions,
    Connection,
    Keypair,
    PublicKey, 
    sendAndConfirmTransaction, 
    SystemProgram,
    Transaction,
    TransactionInstruction 
} from '@solana/web3.js';
import { 
    PrestigeProtocolInstruction 
} from '.';
import { fetchEventCounter } from "../render";
import { 
    eventCounterPda, 
    eventMetadataPda, 
    eventPda, 
    PRESTIGE_PROGRAM_ID 
} from "../util";


export class CreateEvent {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    location: string;
    date: string;
    host: string;
    uri: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        location: string,
        date: string,
        host: string,
        uri: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.location = props.location;
        this.date = props.date;
        this.host = props.host;
        this.uri = props.uri;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateEventSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateEventSchema, CreateEvent, buffer);
    }
}

export const CreateEventSchema = new Map([
    [ CreateEvent, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['title', 'string'],
            ['description', 'string'],
            ['location', 'string'],
            ['date', 'string'],
            ['host', 'string'],
            ['uri', 'string'],
        ],
    }]
]);

export async function createCreateEventInstruction(
    connection: Connection,
    payer: PublicKey,
    title: string,
    description: string,
    location: string,
    date: string,
    host: string,
    uri: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    const eventCounterPublicKey = eventCounterPda(payer)[0];

    let eventId = 1;
    try {
        eventId = (await fetchEventCounter(
            connection, 
            eventCounterPublicKey,
        )).count + 1;
    } catch (e) {
        console.log(e);
    }

    const eventPublicKey = eventPda(payer, eventId)[0];
    const eventMetadataPublicKey = eventMetadataPda(eventPublicKey)[0];

    const instructionObject = new CreateEvent({
        instruction: PrestigeProtocolInstruction.CreateEvent,
        title,
        description,
        location,
        date,
        host,
        uri,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: eventPublicKey, isSigner: false, isWritable: true},
            {pubkey: eventCounterPublicKey, isSigner: false, isWritable: true},
            {pubkey: eventMetadataPublicKey, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, eventPublicKey, eventId];
}


export async function createEvent(
    connection: Connection,
    payer: Keypair,
    title: string,
    description: string,
    location: string,
    date: string,
    host: string,
    uri: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, eventPublicKey, eventId] = await createCreateEventInstruction(
        connection,
        payer.publicKey,
        title,
        description,
        location,
        date,
        host,
        uri,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [eventPublicKey, eventId];
}