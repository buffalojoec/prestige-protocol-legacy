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
import { 
    fetchUser,
} from "../render";
import { 
    PRESTIGE_PROGRAM_ID,
    eventMetadataPda,
    eventPda,
    userPda, 
} from "../util";

export class CreateEvent {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    host: string;
    tags: string;
    uri: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        host: string,
        tags: string,
        uri: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.host = props.host;
        this.tags = props.tags;
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
            ['host', 'string'],
            ['tags', 'string'],
            ['uri', 'string'],
        ],
    }]
]);

export async function createCreateEventInstruction(
    connection: Connection,
    payer: PublicKey,
    title: string,
    description: string,
    host: string,
    tags: string,
    uri: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let eventId = 1;
    const userPublicKey = userPda(payer)[0];
    try {
        eventId = (await fetchUser(connection, userPublicKey)).user.events_hosted + 1;
    } catch (e) {
        console.error(e);
    }

    const eventPublicKey = eventPda(payer, eventId)[0];

    const instructionObject = new CreateEvent({
        instruction: PrestigeProtocolInstruction.CreateEvent,
        title,
        description,
        host,
        tags,
        uri,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: eventPublicKey, isSigner: false, isWritable: true},
            {pubkey: eventMetadataPda(eventPublicKey)[0], isSigner: false, isWritable: true},
            {pubkey: userPublicKey, isSigner: false, isWritable: true},
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
    host: string,
    tags: string,
    uri: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, eventPublicKey, eventId] = await createCreateEventInstruction(
        connection, 
        payer.publicKey,
        title,
        description,
        host,
        tags,
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