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
    getEventMetadataPubkey 
} from "../util/seed-util";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class UpdateEvent {

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
        return Buffer.from(borsh.serialize(UpdateEventSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(UpdateEventSchema, UpdateEvent, buffer);
    }
}

export const UpdateEventSchema = new Map([
    [ UpdateEvent, { 
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

export async function updateUpdateEventInstruction(
    payer: PublicKey,
    eventPubkey: PublicKey,
    event_title: string,
    event_description: string,
    event_location: string,
    event_host: string,
    event_date: string,
): Promise<TransactionInstruction> {

    const eventMetadataPubkey = (await getEventMetadataPubkey(
        eventPubkey,
    ))[0];

    const instructionObject = new UpdateEvent({
        instruction: PrestigeProtocolInstruction.UpdateEvent,
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
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return ix;
}


export async function updateEvent(
    connection: Connection,
    payer: Keypair,
    eventPubkey: PublicKey,
    event_title: string,
    event_description: string,
    event_location: string,
    event_host: string,
    event_date: string,
    confirmOptions?: ConfirmOptions
): Promise<void> {

    const ix = await updateUpdateEventInstruction(
        payer.publicKey,
        eventPubkey,
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
}