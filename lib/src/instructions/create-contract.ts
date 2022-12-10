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
    getContractPubkey 
} from "../util/seed-util";
import { 
    NULL_EVENT_PUBKEY,
    PRESTIGE_PROGRAM_ID, 
} from "../util";
import { Challenge } from "../state";

export class CreateContract {

    instruction: PrestigeProtocolInstruction;
    expiration: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        expiration: string,
    }) {
        this.instruction = props.instruction;
        this.expiration = props.expiration;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateContractSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateContractSchema, CreateContract, buffer);
    }
}

export const CreateContractSchema = new Map([
    [ CreateContract, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['expiration', 'string'],
        ],
    }]
]);

export async function createCreateContractInstruction(
    connection: Connection,
    payer: PublicKey,
    authority: PublicKey,
    challenge: PublicKey,
    earner: PublicKey,
    expiration: string,
    event?: PublicKey,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let contractId = 0;
    const challengeData = await connection.getAccountInfo(authority);
    if (challengeData?.lamports != 0 && challengeData?.data) {
        contractId = Challenge.fromBuffer(challengeData.data).contracts_created + 1;
    }
    if (contractId === 0) throw(
        '[Err]: The provided challenge was not found.'
    );

    const contractPubkey = (await getContractPubkey(
        payer,
        contractId,
    ))[0];

    const instructionObject = new CreateContract({
        instruction: PrestigeProtocolInstruction.CreateContract,
        expiration,
    });

    const eventPubkey = event ? event : NULL_EVENT_PUBKEY;

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: contractPubkey, isSigner: false, isWritable: true},
            {pubkey: challenge, isSigner: true, isWritable: true},
            {pubkey: earner, isSigner: true, isWritable: true},
            {pubkey: eventPubkey, isSigner: true, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, contractPubkey, contractId];
}

export async function createContract(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    challenge: PublicKey,
    earner: PublicKey,
    expiration: string,
    event?: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, contractPubkey, contractId] = await createCreateContractInstruction(
        connection,
        payer.publicKey,
        authority,
        challenge,
        earner,
        expiration,
        event,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [contractPubkey, contractId];
}