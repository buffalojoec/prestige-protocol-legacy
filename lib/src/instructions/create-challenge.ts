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
    COption,
    FixedPrizeList,
} from "../state";
import { 
    PRESTIGE_PROGRAM_ID,
    challengeMetadataPda,
    challengePda,
    userPda,
} from "../util";

export class CreateChallenge {

    instruction: PrestigeProtocolInstruction;
    title: string;
    description: string;
    author: string;
    tags: string;
    uri: string;
    fixed_prizes: FixedPrizeList;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        description: string,
        author: string,
        tags: string,
        uri: string,
        fixedPrizes?: FixedPrizeList,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.description = props.description;
        this.author = props.author;
        this.tags = props.tags;
        this.uri = props.uri;
        this.fixed_prizes = props.fixedPrizes ?
            props.fixedPrizes
            :
            [
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
                COption.fromFixedPrize(undefined),
            ];
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
            ['fixed_prizes', [36 * 5]],
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
    const userPublicKey = userPda(payer)[0];
    try {
        challengeId = (await fetchUser(connection, userPublicKey)).user.challenges_authored + 1;
    } catch (e) {
        console.error(e);
    }

    const challengePublicKey = challengePda(payer, challengeId)[0];

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
            {pubkey: challengePublicKey, isSigner: false, isWritable: true},
            {pubkey: challengeMetadataPda(challengePublicKey)[0], isSigner: false, isWritable: true},
            {pubkey: userPublicKey, isSigner: false, isWritable: true},
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
    author: string,
    tags: string,
    uri: string,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, challengePublicKey, challengeId] = await createCreateChallengeInstruction(
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
    return [challengePublicKey, challengeId];
}