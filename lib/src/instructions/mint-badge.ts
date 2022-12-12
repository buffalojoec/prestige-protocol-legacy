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
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { 
    PrestigeProtocolInstruction 
} from '.';
import { 
    getPayoutPubkey 
} from "../util/seed-util";
import { 
    fetchPot 
} from "../render";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class IssuePayout {

    instruction: PrestigeProtocolInstruction;
    amount: BN;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        amount: BN,
    }) {
        this.instruction = props.instruction;
        this.amount = props.amount;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(IssuePayoutSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(IssuePayoutSchema, IssuePayout, buffer);
    }
}

export const IssuePayoutSchema = new Map([
    [ IssuePayout, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['amount', 'u64'],
        ],
    }]
]);

export async function createIssuePayoutInstruction(
    connection: Connection,
    payer: Keypair,
    potPubkey: PublicKey,
    earnerPubkey: PublicKey,
    amount: number,
): Promise<[TransactionInstruction, PublicKey]> {

    const potData = await fetchPot(connection, potPubkey);
    const rewardId = potData.pot.payouts_count + 1;
    
    const mintPubkey = new PublicKey(potData.pot.mint);
    const escrowOrMintAuthority = new PublicKey(potData.pot.escrow_or_mint_authority);

    const [rewardPubkey, _] = await getPayoutPubkey(
        potPubkey,
        rewardId,
    );

    const instructionObject = new IssuePayout({
        instruction: PrestigeProtocolInstruction.IssuePayout,
        amount: new BN(amount),
    });

    const tokenAccountPubkey = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintPubkey,
        earnerPubkey,
    );

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: rewardPubkey, isSigner: false, isWritable: true},
            {pubkey: potPubkey, isSigner: false, isWritable: true},
            {pubkey: earnerPubkey, isSigner: false, isWritable: true},
            {pubkey: tokenAccountPubkey.address, isSigner: false, isWritable: true},
            {pubkey: mintPubkey, isSigner: false, isWritable: true},
            {pubkey: escrowOrMintAuthority, isSigner: false, isWritable: true},
            {pubkey: payer.publicKey, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, rewardPubkey];
}


export async function issuePayout(
    connection: Connection,
    payer: Keypair,
    potPubkey: PublicKey,
    earnerPubkey: PublicKey,
    amount: number,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const [ix, rewardPubkey] = await createIssuePayoutInstruction(
        connection,
        payer,
        potPubkey,
        earnerPubkey,
        amount,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return rewardPubkey;
}