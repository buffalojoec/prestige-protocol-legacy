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
    getEventMetadataPubkey, 
    getEventPubkey,
    getUserPubkey, 
} from "../util/seed-util";
import { 
    User 
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";

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
    const userPubkey = (await getUserPubkey(payer))[0];
    const userData = await connection.getAccountInfo(userPubkey);
    if (userData?.lamports != 0 && userData?.data) {
        eventId = User.fromBuffer(userData.data).events_hosted + 1;
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
        title,
        description,
        host,
        tags,
        uri,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: eventPubkey, isSigner: false, isWritable: true},
            {pubkey: eventMetadataPubkey, isSigner: false, isWritable: true},
            {pubkey: userPubkey, isSigner: false, isWritable: true},
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
    title: string,
    description: string,
    host: string,
    tags: string,
    uri: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, eventPubkey, eventId] = await createCreateEventInstruction(
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
    return [eventPubkey, eventId];
}