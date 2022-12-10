import { 
    Connection, 
    Keypair, 
    PublicKey, 
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import { 
    fetchAllPrizesForChallenge 
} from "../render/fetch";
import { 
    createIssueRewardInstruction, 
    issueReward 
} from "../instructions/issue-reward";



export async function issueAllRewardsForChallenge(
    connection: Connection,
    authority: Keypair,
    eventPubkey: PublicKey,
    challengePubkey: PublicKey,
    earnerPubkey: PublicKey,
): Promise<PublicKey[]> {

    const prizes = (await fetchAllPrizesForChallenge(
        connection, 
        challengePubkey
    )).filter((p) => p.prize.event === eventPubkey);
    const rewardsPubkeys: PublicKey[] = [];
    for (const prize of prizes) {
        rewardsPubkeys.push(
            await issueReward(
                connection,
                authority,
                prize.address,
                earnerPubkey,
            )
        );
    }
    return rewardsPubkeys;
}


export async function issueRewardsBatch(
    connection: Connection,
    authority: Keypair,
    earnerPubkey: PublicKey,
    challengesList: PublicKey[],
): Promise<PublicKey[]> {

    const rewardPubkeysList: PublicKey[] = [];

    let instructions: TransactionInstruction[] = [];
    let blockhash = await connection
        .getLatestBlockhash()
        .then((res) => res.blockhash)
    
    for (const challenge of challengesList) {

        const prizesList = await fetchAllPrizesForChallenge(
            connection, 
            challenge,
        );

        for (const prize of prizesList) {

            const [ix, rewardPubkey] = await createIssueRewardInstruction(
                connection,
                authority,
                prize.address,
                earnerPubkey,
            );

            instructions.push(ix);
            rewardPubkeysList.push(rewardPubkey);

            try {

                const messageV0 = new TransactionMessage({
                    payerKey: authority.publicKey,
                    recentBlockhash: blockhash,
                    instructions,
                }).compileToV0Message();

            } catch (e) {

                instructions.pop();
                
                const messageV0 = new TransactionMessage({
                    payerKey: authority.publicKey,
                    recentBlockhash: blockhash,
                    instructions,
                }).compileToV0Message();
                const tx = new VersionedTransaction(messageV0)
                tx.sign([authority])
                await connection.sendTransaction(tx, {skipPreflight: true});
                
                blockhash = await connection
                    .getLatestBlockhash()
                    .then((res) => res.blockhash)
                instructions = [];
                instructions.push(ix);
            }
        }
    }

    const messageV0 = new TransactionMessage({
        payerKey: authority.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message();
    const tx = new VersionedTransaction(messageV0)
    tx.sign([authority])
    await connection.sendTransaction(tx, {skipPreflight: true});

    return rewardPubkeysList;
}