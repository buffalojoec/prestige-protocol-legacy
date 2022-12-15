import assert from 'assert';
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
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { 
    PrestigeProtocolInstruction 
} from '.';
import {
    BadgeMetadata
} from '../state';
import { 
    PRESTIGE_PROGRAM_ID,
    badgeMetadataPda,
    challengeMetadataPda,
    prestigeMintAuthorityPda,
} from "../util";


export class MintBadge {

    instruction: PrestigeProtocolInstruction;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
    }) {
        this.instruction = props.instruction;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(MintBadgeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(MintBadgeSchema, MintBadge, buffer);
    }
}

export const MintBadgeSchema = new Map([
    [ MintBadge, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
        ],
    }]
]);

export async function createMintBadgeInstruction(
    connection: Connection,
    payer: Keypair,
    mintPublicKey: PublicKey,
    earnerPublicKey: PublicKey,
): Promise<TransactionInstruction> {

    const badgeMetadataPublicKey = badgeMetadataPda(mintPublicKey)[0];
    const badgeMetadataAccount = await connection.getAccountInfo(badgeMetadataPublicKey);
    assert(badgeMetadataAccount);
    const badgeMetadata = BadgeMetadata.fromBuffer(badgeMetadataAccount.data);
    const challengePublicKey = badgeMetadata.challenge;

    const instructionObject = new MintBadge({
        instruction: PrestigeProtocolInstruction.MintBadge,
    });

    const earnerTokenAccountPublicKey = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintPublicKey,
        earnerPublicKey,
    );

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: challengePublicKey, isSigner: true, isWritable: true},
            {pubkey: challengeMetadataPda(challengePublicKey)[0], isSigner: false, isWritable: true},
            {pubkey: mintPublicKey, isSigner: false, isWritable: true},
            {pubkey: prestigeMintAuthorityPda()[0], isSigner: false, isWritable: true},
            {pubkey: earnerTokenAccountPublicKey.address, isSigner: false, isWritable: true},
            {pubkey: payer.publicKey, isSigner: true, isWritable: true},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return ix;
}


export async function mintBadge(
    connection: Connection,
    payer: Keypair,
    mintPublicKey: PublicKey,
    earnerPublicKey: PublicKey,
    confirmOptions?: ConfirmOptions
): Promise<string> {

    const ix = await createMintBadgeInstruction(
        connection,
        payer,
        mintPublicKey,
        earnerPublicKey,
    );
    return await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
}