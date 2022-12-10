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
    getPrizePubkey 
} from "../util/seed-util";
import { 
    fetchChallenge 
} from "../render";
import { 
    MintControl 
} from "../state";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class CreatePrize {

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
        return Buffer.from(borsh.serialize(CreatePrizeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreatePrizeSchema, CreatePrize, buffer);
    }
}

export const CreatePrizeSchema = new Map([
    [ CreatePrize, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['mint_control', 'u8'],
            ['quantity', 'u64'],
        ],
    }]
]);

export async function createCreatePrizeInstruction(
    connection: Connection,
    payer: PublicKey,
    eventPubkey: PublicKey,
    challengePubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    quantity: number,
): Promise<[TransactionInstruction, PublicKey, number]> {

    const challengeData = await fetchChallenge(connection, challengePubkey);
    const prizeId = challengeData.challenge.prizes_count + 1;
    
    const [prizePubkey, _] = await getPrizePubkey(
        challengePubkey,
        prizeId,
    );

    const instructionObject = new CreatePrize({
        instruction: PrestigeProtocolInstruction.CreatePrize,
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
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, prizePubkey, prizeId];
}


export async function createPrize(
    connection: Connection,
    payer: Keypair,
    eventPubkey: PublicKey,
    challengePubkey: PublicKey,
    mintPubkey: PublicKey,
    escrowOrMintAuthority: PublicKey,
    mint_control: MintControl,
    quantity: number,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, number]> {

    const [ix, prizePubkey, prizeId] = await createCreatePrizeInstruction(
        connection,
        payer.publicKey,
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
    return [prizePubkey, prizeId];
}