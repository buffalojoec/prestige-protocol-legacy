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
    getChallengeMetadataPubkey, 
    getChallengePubkey,
    getUserPubkey,
} from "../util/seed-util";
import { 
    User,
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";

export class CreateChallenge {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    author: string;
    tags: string;
    uri: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        author: string,
        tags: string,
        uri: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.author = props.author;
        this.tags = props.tags;
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
            ['author', 'string'],
            ['tags', 'string'],
            ['uri', 'string'],
        ],
    }]
]);

export async function createCreateChallengeInstruction(
    connection: Connection,
    payer: PublicKey,
    title: string,
    description: string,
    author: string,
    tags: string,
    uri: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let challengeId = 1;
    const userPubkey = (await getUserPubkey(payer))[0];
    const userData = await connection.getAccountInfo(userPubkey);
    if (userData?.lamports != 0 && userData?.data) {
        challengeId = User.fromBuffer(userData.data).challenges_authored + 1;
    }

    const challengePubkey = (await getChallengePubkey(
        payer,
        challengeId,
    ))[0];

    const challengeMetadataPubkey = (await getChallengeMetadataPubkey(
        challengePubkey,
    ))[0];

    const instructionObject = new CreateChallenge({
        instruction: PrestigeProtocolInstruction.CreateChallenge,
        title,
        description,
        author,
        tags,
        uri,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challengePubkey, isSigner: false, isWritable: true},
            {pubkey: challengeMetadataPubkey, isSigner: false, isWritable: true},
            {pubkey: userPubkey, isSigner: false, isWritable: true},
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
    title: string,
    description: string,
    author: string,
    tags: string,
    uri: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, challengePubkey, challengeId] = await createCreateChallengeInstruction(
        connection,
        payer.publicKey,
        title,
        description,
        author,
        tags,
        uri,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [challengePubkey, challengeId];
}