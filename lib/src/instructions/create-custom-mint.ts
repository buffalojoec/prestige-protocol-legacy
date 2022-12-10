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
} from './instruction';
import { 
    getMetadataPubkey 
} from "../util/seed-util";
import { PRESTIGE_PROGRAM_ID } from "../util";


export class CreateCustomMint {

    instruction: PrestigeProtocolInstruction;
    token_title: string;
    token_symbol: string;
    token_uri: string;
    decimals: number;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        token_title: string,
        token_symbol: string,
        token_uri: string,
        decimals: number,
    }) {
        this.instruction = props.instruction;
        this.token_title = props.token_title;
        this.token_symbol = props.token_symbol;
        this.token_uri = props.token_uri;
        this.decimals = props.decimals;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateCustomMintSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateCustomMintSchema, CreateCustomMint, buffer);
    }
}

export const CreateCustomMintSchema = new Map([
    [ CreateCustomMint, { 
        kind: 'struct', 
        fields: [ 
            ['instruction', 'u8'],
            ['token_title', 'string'],
            ['token_symbol', 'string'],
            ['token_uri', 'string'],
            ['decimals', 'u8'],
        ],
    }]
]);



export async function createCreateCustomMintInstruction(
    payer: PublicKey,
    mintPubkey: PublicKey,
    mintAuthorityPubkey: PublicKey,
    tokenTitle: string,
    tokenSymbol: string,
    tokenUri: string,
    decimals: number,
): Promise<[TransactionInstruction, PublicKey, PublicKey, PublicKey]> {

    const metadataPubkey = (await getMetadataPubkey(
        mintPubkey
    ))[0];

    const instructionObject = new CreateCustomMint({
        instruction: PrestigeProtocolInstruction.CreateCustomMint,
        token_title: tokenTitle,
        token_symbol: tokenSymbol,
        token_uri: tokenUri,
        decimals,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: mintPubkey, isSigner: true, isWritable: true},
            {pubkey: mintAuthorityPubkey, isSigner: false, isWritable: true},
            {pubkey: metadataPubkey, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, mintPubkey, mintAuthorityPubkey, metadataPubkey];
}


export async function createCustomMint(
    connection: Connection,
    payer: Keypair,
    mintAuthorityPubkey: PublicKey,
    tokenTitle: string,
    tokenSymbol: string,
    tokenUri: string,
    decimals: number,
    confirmOptions?: ConfirmOptions
): Promise<[PublicKey, PublicKey, PublicKey]> {

    const mint = Keypair.generate();

    const [ix, mintPubkey, setMintAuthorityPubkey, metadataPubkey] = await createCreateCustomMintInstruction(
        payer.publicKey,
        mint.publicKey,
        mintAuthorityPubkey,
        tokenTitle,
        tokenSymbol,
        tokenUri,
        decimals,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer, mint],
        confirmOptions,
    );
    return [mintPubkey, setMintAuthorityPubkey, metadataPubkey];
}