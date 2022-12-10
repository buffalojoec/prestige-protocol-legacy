import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import BN from 'bn.js';
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
    getPotPubkey 
} from "../util/seed-util";
import { 
    fetchEvent 
} from "../render";
import { 
    MintControl 
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class CreatePot {

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
        return Buffer.from(borsh.serialize(CreatePotSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreatePotSchema, CreatePot, buffer);
    }
}

export const CreatePotSchema = new Map([
    [ CreatePot, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['mint_control', 'u8'],
            ['pot', 'u64'],
        ],
    }]
]);

export async function createCreatePotInstruction(
    connection: Connection,
    payer: PublicKey,
    eventPubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    pot: number,
): Promise<[TransactionInstruction, PublicKey, number]> {

    const eventData = await fetchEvent(connection, eventPubkey);
    const potId = eventData.event.pots_count + 1;
    
    const [potPubkey, _] = await getPotPubkey(
        eventPubkey,
        potId,
    );

    const instructionObject = new CreatePot({
        instruction: PrestigeProtocolInstruction.CreatePot,
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
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, potPubkey, potId];
}


export async function createPot(
    connection: Connection,
    payer: Keypair,
    eventPubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    pot: number,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, potPubkey, potId] = await createCreatePotInstruction(
        connection,
        payer.publicKey,
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
    return [potPubkey, potId];
}