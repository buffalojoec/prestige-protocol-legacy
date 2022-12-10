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

export class CloseContract {

    instruction: PrestigeProtocolInstruction;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
    }) {
        this.instruction = props.instruction;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CloseContractSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CloseContractSchema, CloseContract, buffer);
    }
}

export const CloseContractSchema = new Map([
    [ CloseContract, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
        ],
    }]
]);

export async function createCloseContractInstruction(
    payer: PublicKey,
    authority: PublicKey,
    contract: PublicKey,
): Promise<TransactionInstruction> {

    const instructionObject = new CloseContract({
        instruction: PrestigeProtocolInstruction.CloseContract,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: contract, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return ix;
}

export async function closeContract(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    contract: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const ix = await createCloseContractInstruction(
        payer.publicKey,
        authority,
        contract,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return contract;
}