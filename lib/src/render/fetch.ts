import { 
    Metadata 
} from "@metaplex-foundation/mpl-token-metadata";
import { 
    getMint 
} from "@solana/spl-token";
import { 
    Connection, 
    PublicKey 
} from "@solana/web3.js";
import { 
    BadgeMetadata,
    Challenge, 
    ChallengeMetadata, 
    Event, 
    EventMetadata, 
    User
} from "../state";
import { 
    BadgeWrapper, 
    ChallengeWrapper, 
    EventWrapper, 
    UserWrapper
} from "./types";
import { 
    badgeMetadataPda,
    challengeMetadataPda,
    eventMetadataPda, 
    mintMetadataMplPda, 
} from "../util";


// --- Single Fetch

async function fetchAccount(
    connection: Connection,
    publicKey: PublicKey,
    accountType: string,
): Promise<Buffer> {
    const accountInfo = await connection.getAccountInfo(publicKey);
    if (!accountInfo || accountInfo.lamports === 0) throw(`${accountType} not found for ${publicKey}`);
    return accountInfo.data
}

export async function fetchBadge(
    connection: Connection, 
    badgePublicKey: PublicKey
): Promise<BadgeWrapper> {
    return {
        address: badgePublicKey,
        mint: await getMint(connection, badgePublicKey),
        mintMetadata: Metadata.deserialize(
            await fetchAccount(
                connection,
                mintMetadataMplPda(badgePublicKey)[0],
                'Mint Metadata',
            )
        )[0],
        badgeMetadata: BadgeMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                badgeMetadataPda(badgePublicKey)[0], 
                'Badge Metadata'
            )
        ),
    }
}

export async function fetchChallenge(
    connection: Connection, 
    challengePublicKey: PublicKey
): Promise<ChallengeWrapper> {
    return {
        address: challengePublicKey,
        challenge: Challenge.fromBuffer(
            await fetchAccount(
                connection, 
                challengePublicKey, 
                'Challenge'
            )
        ),
        metadata: ChallengeMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                challengeMetadataPda(challengePublicKey)[0], 
                'Challenge Metadata'
            )
        ),
    }
}

export async function fetchEvent(
    connection: Connection, 
    eventPublicKey: PublicKey
): Promise<EventWrapper> {
    return {
        address: eventPublicKey,
        event: Event.fromBuffer(
            await fetchAccount(
                connection, 
                eventPublicKey, 
                'Event'
            )
        ),
        metadata: EventMetadata.fromBuffer(
            await fetchAccount(
                connection, 
                eventMetadataPda(eventPublicKey)[0], 
                'Event Metadata'
            )
        ),
    }
}

export async function fetchUser(
    connection: Connection, 
    userPublicKey: PublicKey
): Promise<UserWrapper> {
    return {
        address: userPublicKey,
        user: User.fromBuffer(
            await fetchAccount(
                connection, 
                userPublicKey, 
                'User'
            )
        ),
    }
}