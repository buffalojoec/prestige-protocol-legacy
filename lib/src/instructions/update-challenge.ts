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
    getChallengeMetadataPubkey
} from "../util/seed-util";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class UpdateChallenge {

    instruction: PrestigeProtocolInstruction;
    challenge_title: string;
    challenge_description: string;
    challenge_author: string;
    challenge_tags: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        challenge_title: string,
        challenge_description: string,
        challenge_author: string,
        challenge_tags: string,
    }) {
        this.instruction = props.instruction;
        this.challenge_title = props.challenge_title;
        this.challenge_description = props.challenge_description;
        this.challenge_author = props.challenge_author;
        this.challenge_tags = props.challenge_tags;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(UpdateChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(UpdateChallengeSchema, UpdateChallenge, buffer);
    }
}

export const UpdateChallengeSchema = new Map([
    [ UpdateChallenge, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['challenge_title', 'string'],
            ['challenge_description', 'string'],
            ['challenge_author', 'string'],
            ['challenge_tags', 'string'],
        ],
    }]
]);

export async function updateUpdateChallengeInstruction(
    payer: PublicKey,
    challengePubkey: PublicKey,
    eventPubkey: PublicKey,
    challenge_title: string,
    challenge_description: string,
    challenge_author: string,
    challenge_tags: string,
): Promise<TransactionInstruction> {

    const challengeMetadataPubkey = (await getChallengeMetadataPubkey(
        challengePubkey,
    ))[0];

    const instructionObject = new UpdateChallenge({
        instruction: PrestigeProtocolInstruction.UpdateChallenge,
        challenge_title,
        challenge_description,
        challenge_author,
        challenge_tags,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challengePubkey, isSigner: false, isWritable: true},
            {pubkey: challengeMetadataPubkey, isSigner: false, isWritable: true},
            {pubkey: eventPubkey, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return ix;
}


export async function updateChallenge(
    connection: Connection,
    payer: Keypair,
    challengePubkey: PublicKey,
    eventPubkey: PublicKey,
    challenge_title: string,
    challenge_description: string,
    challenge_author: string,
    challenge_tags: string,
    confirmOptions?: ConfirmOptions
): Promise<void> {

    const ix = await updateUpdateChallengeInstruction(
        payer.publicKey,
        challengePubkey,
        eventPubkey,
        challenge_title,
        challenge_description,
        challenge_author,
        challenge_tags,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
}