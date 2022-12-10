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
    getUserPubkey 
} from "../util/seed-util";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class CreateUser {

    instruction: PrestigeProtocolInstruction;
    username: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        username: string,
    }) {
        this.instruction = props.instruction;
        this.username = props.username;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateUserSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateUserSchema, CreateUser, buffer);
    }
}

export const CreateUserSchema = new Map([
    [ CreateUser, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['username', 'string'],
        ],
    }]
]);

export async function createCreateUserInstruction(
    connection: Connection,
    payer: PublicKey,
    username: string,
): Promise<[TransactionInstruction, PublicKey]> {

    const userPubkey = (await getUserPubkey(
        payer,
    ))[0];

    const instructionObject = new CreateUser({
        instruction: PrestigeProtocolInstruction.CreateUser,
        username,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: userPubkey, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, userPubkey];
}


export async function createUser(
    connection: Connection,
    payer: Keypair,
    username: string,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const [ix, userPubkey] = await createCreateUserInstruction(
        connection, 
        payer.publicKey,
        username,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return userPubkey;
}