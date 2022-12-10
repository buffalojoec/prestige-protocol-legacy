import BN from 'bn.js';
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
    getEscrowPubkey 
} from "../util/seed-util";
import { 
    PRESTIGE_PROGRAM_ID, 
} from "../util";
import { Contract } from "../state";

export class CreateEscrow {

    instruction: PrestigeProtocolInstruction;
    quantity: BN;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        quantity: BN,
    }) {
        this.instruction = props.instruction;
        this.quantity = props.quantity;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateEscrowSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateEscrowSchema, CreateEscrow, buffer);
    }
}

export const CreateEscrowSchema = new Map([
    [ CreateEscrow, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['quantity', 'u64'],
        ],
    }]
]);

export async function createCreateEscrowInstruction(
    connection: Connection,
    payer: PublicKey,
    authority: PublicKey,
    contract: PublicKey,
    mint: PublicKey,
    quantity: number,
): Promise<[TransactionInstruction, PublicKey, number]> {

    let escrowId = 0;
    const contractData = await connection.getAccountInfo(authority);
    if (contractData?.lamports != 0 && contractData?.data) {
        escrowId = Contract.fromBuffer(contractData.data).escrows_created + 1;
    }
    if (escrowId === 0) throw(
        '[Err]: The provided contract was not found.'
    );

    const escrowPubkey = (await getEscrowPubkey(
        payer,
        escrowId,
    ))[0];

    const instructionObject = new CreateEscrow({
        instruction: PrestigeProtocolInstruction.CreateEscrow,
        quantity: new BN(quantity),
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: escrowPubkey, isSigner: false, isWritable: true},
            {pubkey: contract, isSigner: true, isWritable: true},
            {pubkey: mint, isSigner: true, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, escrowPubkey, escrowId];
}

export async function createEscrow(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    contract: PublicKey,
    mint: PublicKey,
    quantity: number,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, escrowPubkey, escrowId] = await createCreateEscrowInstruction(
        connection,
        payer.publicKey,
        authority,
        contract,
        mint,
        quantity,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return [escrowPubkey, escrowId];
}