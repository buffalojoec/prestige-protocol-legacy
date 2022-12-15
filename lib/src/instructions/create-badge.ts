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
    SYSVAR_RENT_PUBKEY, 
    Transaction, 
    TransactionInstruction
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
    PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { 
    PrestigeProtocolInstruction 
} from '.';
import { 
    PRESTIGE_PROGRAM_ID,
    badgeMetadataPda,
    challengePda,
    eventPda, 
    mintMetadataMplPda,
    prestigeMintAuthorityPda,
} from "../util";


export class CreateBadge {

    instruction: PrestigeProtocolInstruction;
    title: string;
    symbol: string;
    uri: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        title: string,
        symbol: string,
        uri: string,
    }) {
        this.instruction = props.instruction;
        this.title = props.title;
        this.symbol = props.symbol;
        this.uri = props.uri;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateBadgeSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateBadgeSchema, CreateBadge, buffer);
    }
}

export const CreateBadgeSchema = new Map([
    [ CreateBadge, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['title', 'string'],
            ['symbol', 'string'],
            ['uri', 'string'],
        ],
    }]
]);



export async function createCreateBadgeInstruction(
    payer: PublicKey,
    mintPublicKey: PublicKey,
    event: number | PublicKey,
    challenge: number | PublicKey,
    tokenTitle: string,
    tokenSymbol: string,
    tokenUri: string,
): Promise<[TransactionInstruction, PublicKey]> {

    const instructionObject = new CreateBadge({
        instruction: PrestigeProtocolInstruction.CreateBadge,
        title: tokenTitle,
        symbol: tokenSymbol,
        uri: tokenUri,
    });

    const ix = new TransactionInstruction({
        keys: [
            {
                pubkey: typeof event === 'object' ? 
                    event 
                    : 
                    eventPda(payer, event)[0], 
                isSigner: true, 
                isWritable: true
            },
            {
                pubkey: typeof challenge === 'object' ? 
                    challenge 
                    : 
                    challengePda(payer, challenge)[0], 
                isSigner: true, 
                isWritable: true
            },
            {pubkey: mintPublicKey, isSigner: true, isWritable: true},
            {pubkey: mintMetadataMplPda(mintPublicKey)[0], isSigner: false, isWritable: true},
            {pubkey: badgeMetadataPda(mintPublicKey)[0], isSigner: true, isWritable: true},
            {pubkey: prestigeMintAuthorityPda()[0], isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, mintPublicKey];
}


export async function createBadge(
    connection: Connection,
    payer: Keypair,
    event: number | PublicKey,
    challenge: number | PublicKey,
    tokenTitle: string,
    tokenSymbol: string,
    tokenUri: string,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const mint = Keypair.generate();

    const [ix, mintPublicKey] = await createCreateBadgeInstruction(
        payer.publicKey,
        mint.publicKey,
        event,
        challenge,
        tokenTitle,
        tokenSymbol,
        tokenUri,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer, mint],
        confirmOptions,
    );
    return mintPublicKey;
}