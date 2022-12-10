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


export class UpdatePot {

    instruction: PrestigeProtocolInstruction;
    mint_control: MintControl;
    pot: BN;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        mint_control: MintControl,
        pot: BN,
    }) {
        this.instruction = props.instruction;
        this.mint_control = props.mint_control;
        this.pot = props.pot;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(UpdatePotSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(UpdatePotSchema, UpdatePot, buffer);
    }
}

export const UpdatePotSchema = new Map([
    [ UpdatePot, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['mint_control', 'u8'],
            ['pot', 'u64'],
        ],
    }]
]);

export async function updateUpdatePotInstruction(
    payer: PublicKey,
    potPubkey: PublicKey,
    eventPubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    pot: number,
): Promise<TransactionInstruction> {

    const instructionObject = new UpdatePot({
        instruction: PrestigeProtocolInstruction.UpdatePot,
        mint_control,
        pot: new BN(pot),
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: potPubkey, isSigner: false, isWritable: true},
            {pubkey: eventPubkey, isSigner: false, isWritable: true},
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


export async function updatePot(
    connection: Connection,
    payer: Keypair,
    potPubkey: PublicKey,
    eventPubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    pot: number,
    confirmOptions?: ConfirmOptions
): Promise<void> {

    const ix = await updateUpdatePotInstruction(
        payer.publicKey,
        potPubkey,
        eventPubkey,
        mintPubkey,
        escrowOrMintAuthority,
        mint_control,
        pot,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
}