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
    getChallengePubkey 
} from "../util/seed-util";
import { PRESTIGE_PROGRAM_ID } from "../util";
import { User } from "../state";

export class CreateChallenge {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    author: string;
    tags: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        author: string,
        tags: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.author = props.author;
        this.tags = props.tags;
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
            ['author', 'string'],
            ['tags', 'string'],
        ],
    }]
]);

export async function createCreateChallengeInstruction(
    connection: Connection,
    payer: PublicKey,
    authority: PublicKey,
    title: string,
    description: string,
    author: string,
    tags: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let challengeId = 0;
    const userData = await connection.getAccountInfo(authority);
    if (userData?.lamports != 0 && userData?.data) {
        challengeId = User.fromBuffer(userData.data).challenges_authored + 1;
    }
    if (challengeId === 0) throw(
        '[Err]: The provided authority has no associated User account.'
    );

    const challengePubkey = (await getChallengePubkey(
        payer,
        challengeId,
    ))[0];

    const instructionObject = new CreateChallenge({
        instruction: PrestigeProtocolInstruction.CreateChallenge,
        title,
        description,
        author,
        tags,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challengePubkey, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, challengePubkey, challengeId];
}

export async function createChallenge(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    title: string,
    description: string,
    author: string,
    tags: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, challengePubkey, challengeId] = await createCreateChallengeInstruction(
        connection,
        payer.publicKey,
        authority,
        title,
        description,
        author,
        tags,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [challengePubkey, challengeId];
}