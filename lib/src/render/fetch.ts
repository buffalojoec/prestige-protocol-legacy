import { 
    AccountInfo,
    Connection, 
    PublicKey 
} from "@solana/web3.js";
import { 
    Challenge,
    Contract,
    Escrow,
    Event,
    User
} from "../state";
import { 
    ChallengeWrapper,
    ContractWrapper,
    EscrowWrapper,
    EventWrapper,
    UserWrapper,
} from "./types";

export async function fetchAccount(
    connection: Connection,
    pubkey: PublicKey,
    accountType: string,
): Promise<AccountInfo<Buffer>> {
    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) throw(`${accountType} not found for ${pubkey}`);
    return accountInfo;
}

export async function fetchChallenge(
    connection: Connection, 
    pubkey: PublicKey
): Promise<ChallengeWrapper> {
    return {
        address: pubkey,
        challenge: Challenge.fromBuffer((
            await fetchAccount(connection, pubkey, 'Challenge')
        ).data),
    };
}

export async function fetchContract(
    connection: Connection, 
    pubkey: PublicKey
): Promise<ContractWrapper> {
    return {
        address: pubkey,
        contract: Contract.fromBuffer((
            await fetchAccount(connection, pubkey, 'Contract')
        ).data),
    };
}

export async function fetchEscrow(
    connection: Connection, 
    pubkey: PublicKey
): Promise<EscrowWrapper> {
    return {
        address: pubkey,
        escrow: Escrow.fromBuffer((
            await fetchAccount(connection, pubkey, 'Escrow')
        ).data),
    };
}

export async function fetchEvent(
    connection: Connection, 
    pubkey: PublicKey
): Promise<EventWrapper> {
    return {
        address: pubkey,
        event: Event.fromBuffer((
            await fetchAccount(connection, pubkey, 'Event')
        ).data),
    };
}

export async function fetchUser(
    connection: Connection, 
    pubkey: PublicKey
): Promise<UserWrapper> {
    return {
        address: pubkey,
        user: User.fromBuffer((
            await fetchAccount(connection, pubkey, 'User')
        ).data),
    };
}