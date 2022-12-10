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
} from './instruction';
import { 
    getEventCounterPubkey, 
    getEventMetadataPubkey, 
    getEventPubkey 
} from "../util/seed-util";
import { 
    EventCounter 
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class CreateEvent {

    instruction: PrestigeProtocolInstruction;
    event_title: string;
    event_description: string;
    event_location: string;
    event_host: string;
    event_date: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        event_title: string,
        event_description: string,
        event_location: string,
        event_host: string,
        event_date: string,
    }) {
        this.instruction = props.instruction;
        this.event_title = props.event_title;
        this.event_description = props.event_description;
        this.event_location = props.event_location;
        this.event_host = props.event_host;
        this.event_date = props.event_date;
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
            ['event_title', 'string'],
            ['event_description', 'string'],
            ['event_location', 'string'],
            ['event_host', 'string'],
            ['event_date', 'string'],
        ],
    }]
]);

export async function createCreateEventInstruction(
    connection: Connection,
    payer: PublicKey,
    event_title: string,
    event_description: string,
    event_location: string,
    event_host: string,
    event_date: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let eventId = 1;
    const eventCounterPubkey = (await getEventCounterPubkey())[0];
    const eventCounterData = await connection.getAccountInfo(eventCounterPubkey);
    if (eventCounterData?.lamports != 0 && eventCounterData?.data) {
        eventId = EventCounter.fromBuffer(eventCounterData.data).events_count + 1;
    }

    const eventPubkey = (await getEventPubkey(
        payer,
        eventId,
    ))[0];

    const eventMetadataPubkey = (await getEventMetadataPubkey(
        eventPubkey,
    ))[0];

    const instructionObject = new CreateEvent({
        instruction: PrestigeProtocolInstruction.CreateEvent,
        event_title,
        event_description,
        event_location,
        event_host,
        event_date,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: eventPubkey, isSigner: false, isWritable: true},
            {pubkey: eventMetadataPubkey, isSigner: false, isWritable: true},
            {pubkey: eventCounterPubkey, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, eventPubkey, eventId];
}


export async function createEvent(
    connection: Connection,
    payer: Keypair,
    event_title: string,
    event_description: string,
    event_location: string,
    event_host: string,
    event_date: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, eventPubkey, eventId] = await createCreateEventInstruction(
        connection, 
        payer.publicKey,
        event_title,
        event_description,
        event_location,
        event_host,
        event_date,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [eventPubkey, eventId];
}