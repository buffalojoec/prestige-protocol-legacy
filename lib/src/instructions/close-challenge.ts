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
    Transaction,
    TransactionInstruction 
} from '@solana/web3.js';
import { 
    PrestigeProtocolInstruction 
} from './instruction';
import { 
    PRESTIGE_PROGRAM_ID, 
} from "../util";

export class CloseChallenge {

    instruction: PrestigeProtocolInstruction;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
    }) {
        this.instruction = props.instruction;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CloseChallengeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CloseChallengeSchema, CloseChallenge, buffer);
    }
}

export const CloseChallengeSchema = new Map([
    [ CloseChallenge, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
        ],
    }]
]);

export async function createCloseChallengeInstruction(
    payer: PublicKey,
    authority: PublicKey,
    challenge: PublicKey,
): Promise<TransactionInstruction> {

    const instructionObject = new CloseChallenge({
        instruction: PrestigeProtocolInstruction.CloseChallenge,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challenge, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return ix;
}

export async function closeChallenge(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    challenge: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const ix = await createCloseChallengeInstruction(
        payer.publicKey,
        authority,
        challenge,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return challenge;
}