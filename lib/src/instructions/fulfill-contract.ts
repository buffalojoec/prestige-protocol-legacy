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

export class FulfillContract {

    instruction: PrestigeProtocolInstruction;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
    }) {
        this.instruction = props.instruction;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(FulfillContractSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(FulfillContractSchema, FulfillContract, buffer);
    }
}

export const FulfillContractSchema = new Map([
    [ FulfillContract, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
        ],
    }]
]);

export async function createFulfillContractInstruction(
    payer: PublicKey,
    authority: PublicKey,
    contract: PublicKey,
): Promise<TransactionInstruction> {

    const instructionObject = new FulfillContract({
        instruction: PrestigeProtocolInstruction.FulfillContract,
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

export async function fulfillContract(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    contract: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const ix = await createFulfillContractInstruction(
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