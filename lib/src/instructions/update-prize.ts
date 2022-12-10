import * as borsh from "borsh";
import BN from 'bn.js';
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
    MintControl 
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";



export class UpdatePrize {

    instruction: PrestigeProtocolInstruction;
    mint_control: MintControl;
    quantity: BN;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        mint_control: MintControl,
        quantity: BN,
    }) {
        this.instruction = props.instruction;
        this.mint_control = props.mint_control;
        this.quantity = props.quantity;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(UpdatePrizeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(UpdatePrizeSchema, UpdatePrize, buffer);
    }
}

export const UpdatePrizeSchema = new Map([
    [ UpdatePrize, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['mint_control', 'u8'],
            ['quantity', 'u64'],
        ],
    }]
]);

export async function updateUpdatePrizeInstruction(
    payer: PublicKey,
    prizePubkey: PublicKey,
    eventPubkey: PublicKey,
    challengePubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    quantity: number,
): Promise<TransactionInstruction> {

    const instructionObject = new UpdatePrize({
        instruction: PrestigeProtocolInstruction.UpdatePrize,
        mint_control,
        quantity: new BN(quantity),
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: prizePubkey, isSigner: false, isWritable: true},
            {pubkey: eventPubkey, isSigner: false, isWritable: true},
            {pubkey: challengePubkey, isSigner: false, isWritable: true},
            {pubkey: mintPubkey, isSigner: false, isWritable: true},
            {pubkey: escrowOrMintAuthority, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return ix;
}


export async function updatePrize(
    connection: Connection,
    payer: Keypair,
    prizePubkey: PublicKey,
    eventPubkey: PublicKey,
    challengePubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    quantity: number,
    confirmOptions?: ConfirmOptions
): Promise<void> {

    const ix = await updateUpdatePrizeInstruction(
        payer.publicKey,
        prizePubkey,
        eventPubkey,
        challengePubkey,
        mintPubkey,
        escrowOrMintAuthority,
        mint_control,
        quantity,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
}