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
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { 
    PrestigeProtocolInstruction 
} from './instruction';
import { 
    getRewardPubkey 
} from "../util/seed-util";
import { 
    fetchPrize 
} from "../render";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class IssueReward {

    instruction: PrestigeProtocolInstruction;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
    }) {
        this.instruction = props.instruction;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(IssueRewardSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(IssueRewardSchema, IssueReward, buffer);
    }
}

export const IssueRewardSchema = new Map([
    [ IssueReward, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
        ],
    }]
]);

export async function createIssueRewardInstruction(
    connection: Connection,
    payer: Keypair,
    prizePubkey: PublicKey,
    earnerPubkey: PublicKey,
): Promise<[TransactionInstruction, PublicKey]> {

    const prizeData = await fetchPrize(connection, prizePubkey);
    const rewardId = prizeData.prize.rewards_count + 1;
    
    const mintPubkey = new PublicKey(prizeData.prize.mint);
    const escrowOrMintAuthority = new PublicKey(prizeData.prize.escrow_or_mint_authority);

    const [rewardPubkey, _] = await getRewardPubkey(
        prizePubkey,
        rewardId,
    );

    const instructionObject = new IssueReward({
        instruction: PrestigeProtocolInstruction.IssueReward,
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
            {pubkey: prizePubkey, isSigner: false, isWritable: true},
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


export async function issueReward(
    connection: Connection,
    payer: Keypair,
    prizePubkey: PublicKey,
    earnerPubkey: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const [ix, rewardPubkey] = await createIssueRewardInstruction(
        connection,
        payer,
        prizePubkey,
        earnerPubkey,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return rewardPubkey;
}