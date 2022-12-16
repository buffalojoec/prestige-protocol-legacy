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
import { fetchChallengeCounter } from "../render";
import { 
    challengeCounterPda, 
    challengeMetadataPda, 
    challengePda, 
    PRESTIGE_PROGRAM_ID 
} from "../util";


export class CreateChallenge {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    tags: string;
    author: string;
    uri: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        tags: string,
        author: string,
        uri: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.tags = props.tags;
        this.author = props.author;
        this.uri = props.uri;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateChallengeSchema, CreateChallenge, buffer);
    }
}

export const CreateChallengeSchema = new Map([
    [ CreateChallenge, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['title', 'string'],
            ['description', 'string'],
            ['tags', 'string'],
            ['author', 'string'],
            ['uri', 'string'],
        ],
    }]
]);

export async function createCreateChallengeInstruction(
    connection: Connection,
    payer: PublicKey,
    title: string,
    description: string,
    tags: string,
    author: string,
    uri: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    const challengeCounterPublicKey = challengeCounterPda(payer)[0];

    let challengeId = 1;
    try {
        challengeId = (await fetchChallengeCounter(
            connection, 
            challengeCounterPublicKey,
        )).count + 1;
    } catch (e) {
        console.log(e);
    }

    const challengePublicKey = challengePda(payer, challengeId)[0];
    const challengeMetadataPublicKey = challengeMetadataPda(challengePublicKey)[0];

    const instructionObject = new CreateChallenge({
        instruction: PrestigeProtocolInstruction.CreateChallenge,
        title,
        description,
        tags,
        author,
        uri,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challengePublicKey, isSigner: false, isWritable: true},
            {pubkey: challengeCounterPublicKey, isSigner: false, isWritable: true},
            {pubkey: challengeMetadataPublicKey, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, challengePublicKey, challengeId];
}


export async function createChallenge(
    connection: Connection,
    payer: Keypair,
    title: string,
    description: string,
    tags: string,
    author: string,
    uri: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, challengePublicKey, challengeId] = await createCreateChallengeInstruction(
        connection,
        payer.publicKey,
        title,
        description,
        tags,
        author,
        uri,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [challengePublicKey, challengeId];
}