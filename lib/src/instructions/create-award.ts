import * as borsh from "borsh";
import { Buffer } from "buffer";
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
import { PrestigeProtocolInstruction } from '.';
import { fetchAwardCounter } from "../render";
import { awardCounterPda, awardPda, PRESTIGE_PROGRAM_ID } from "../util";


export class CreateAward {

    instruction: PrestigeProtocolInstruction;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
    }) {
        this.instruction = props.instruction;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateAwardSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateAwardSchema, CreateAward, buffer);
    }
}

export const CreateAwardSchema = new Map([
    [ CreateAward, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
        ],
    }]
]);

export async function createCreateAwardInstruction(
    connection: Connection,
    payer: PublicKey,
    event: PublicKey,
    challenge: PublicKey,
    earner: PublicKey,
): Promise<[TransactionInstruction, PublicKey, number]> {

    const awardCounterPublicKey = awardCounterPda(earner)[0];

    let awardId = 1;
    try {
        awardId = (await fetchAwardCounter(
            connection, 
            awardCounterPublicKey,
        )).count + 1;
    } catch (e) {
        console.log(e);
    }

    const awardPublicKey = awardPda(earner, awardId)[0];

    const instructionObject = new CreateAward({
        instruction: PrestigeProtocolInstruction.CreateAward,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: awardPublicKey, isSigner: false, isWritable: true},
            {pubkey: awardCounterPublicKey, isSigner: false, isWritable: true},
            {pubkey: event, isSigner: false, isWritable: true},
            {pubkey: challenge, isSigner: false, isWritable: true},
            {pubkey: earner, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, awardPublicKey, awardId];
}


export async function createAward(
    connection: Connection,
    payer: Keypair,
    event: PublicKey,
    challenge: PublicKey,
    earner: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, awardPublicKey, awardId] = await createCreateAwardInstruction(
        connection, 
        payer.publicKey,
        event,
        challenge,
        earner,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [awardPublicKey, awardId];
}