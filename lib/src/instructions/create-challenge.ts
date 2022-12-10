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
    getChallengeCounterPubkey,
    getChallengeMetadataPubkey, 
    getChallengePubkey 
} from "../util/seed-util";
import { 
    ChallengeCounter,
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class CreateChallenge {

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
            ['challenge_title', 'string'],
            ['challenge_description', 'string'],
            ['challenge_author', 'string'],
            ['challenge_tags', 'string'],
        ],
    }]
]);

export async function createCreateChallengeInstruction(
    connection: Connection,
    payer: PublicKey,
    challenge_title: string,
    challenge_description: string,
    challenge_author: string,
    challenge_tags: string,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let challengeId = 1;
    const challengeCounterPubkey = (await getChallengeCounterPubkey())[0];
    const challengeCounterData = await connection.getAccountInfo(challengeCounterPubkey);
    if (challengeCounterData?.lamports != 0 && challengeCounterData?.data) {
        challengeId = ChallengeCounter.fromBuffer(challengeCounterData.data).challenges_count + 1;
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
        challenge_title,
        challenge_description,
        challenge_author,
        challenge_tags,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challengePubkey, isSigner: false, isWritable: true},
            {pubkey: challengeMetadataPubkey, isSigner: false, isWritable: true},
            {pubkey: challengeCounterPubkey, isSigner: false, isWritable: true},
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
    challenge_title: string,
    challenge_description: string,
    challenge_author: string,
    challenge_tags: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, challengePubkey, challengeId] = await createCreateChallengeInstruction(
        connection,
        payer.publicKey,
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
    return [challengePubkey, challengeId];
}