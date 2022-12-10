import create from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { renderSolanaResume, SolanaResume } from 'prestige-protocol';


interface SolanaResumeStore {
    solanaResume: SolanaResume;
    getSolanaResume: (
        connection: Connection,
        programId: PublicKey, 
        walletPubkey: PublicKey, 
    ) => void
}


const useSolanaResumeStore = create<SolanaResumeStore>((set, _get) =>({
    solanaResume: undefined,
    getSolanaResume: async (connection, walletPubkey, programId) => {

        let solanaResume: SolanaResume = undefined;
        try {
            solanaResume = await renderSolanaResume(
                connection,
                programId,
                walletPubkey,
            );
            if (solanaResume) console.log(`Solana Resume Test: ${solanaResume}`);
            if (solanaResume) console.log(`Solana Resume Test: ${solanaResume.achievements.length}`);
            set({ solanaResume })
        } catch (e) {
            console.log(`Error fetching Solana Resume: `, e);
        };
    },
}));

export default useSolanaResumeStore;