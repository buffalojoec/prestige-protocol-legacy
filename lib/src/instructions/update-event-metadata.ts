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
    getEventPubkey 
} from "../util/seed-util";
import { 
    PRESTIGE_PROGRAM_ID, 
} from "../util";
import { User } from "../state";

export class UpdateEventMetadata {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    location: string;
    host_name: string;
    date: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        location: string,
        host_name: string,
        date: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.location = props.location;
        this.host_name = props.host_name;
        this.date = props.date;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(UpdateEventMetadataSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(UpdateEventMetadataSchema, UpdateEventMetadata, buffer);
    }
}

export const UpdateEventMetadataSchema = new Map([
    [ UpdateEventMetadata, { 
        kind: 'struct', 
        fields: [ 
            ['title', 'string'],
            ['description', 'string'],
            ['location', 'string'],
            ['host_name', 'string'],
            ['date', 'string'],
        ],
    }]
]);

export async function createUpdateEventMetadataInstruction(
    connection: Connection,
    payer: PublicKey,
    authority: PublicKey,
    title: string,
    description: string,
    location: string,
    host_name: string,
    date: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let eventId = 0;
    const userData = await connection.getAccountInfo(authority);
    if (userData?.lamports != 0 && userData?.data) {
        eventId = User.fromBuffer(userData.data).events_hosted + 1;
    }
    if (eventId === 0) throw(
        '[Err]: The provided authority has no associated User account.'
    );

    const eventPubkey = (await getEventPubkey(
        payer,
        eventId,
    ))[0];

    const instructionObject = new UpdateEventMetadata({
        instruction: PrestigeProtocolInstruction.UpdateEventMetadata,
        title,
        description,
        location,
        host_name,
        date,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: eventPubkey, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, eventPubkey, eventId];
}

export async function updateEventMetadata(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    title: string,
    description: string,
    location: string,
    host_name: string,
    date: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, eventPubkey, eventId] = await createUpdateEventMetadataInstruction(
        connection,
        payer.publicKey,
        authority,
        title,
        description,
        location,
        host_name,
        date,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [eventPubkey, eventId];
}