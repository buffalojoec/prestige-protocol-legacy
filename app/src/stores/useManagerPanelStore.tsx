import create from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'
import { renderManagerPanel, ManagerPanel } from 'prestige-protocol';


interface ManagerPanelStore {
    managerPanel: ManagerPanel;
    getManagerPanel: (
        connection: Connection,
        programId: PublicKey, 
        walletPubkey: PublicKey, 
    ) => void
}


const useManagerPanelStore = create<ManagerPanelStore>((set, _get) => ({
    managerPanel: undefined,
    getManagerPanel: async (connection, walletPubkey, programId) => {

        let managerPanel: ManagerPanel = undefined;
        try {
            managerPanel = await renderManagerPanel(
                connection,
                programId,
                walletPubkey,
            );
            if (managerPanel) console.log(`Manager Panel Test: ${managerPanel}`);
            if (managerPanel) console.log(`Manager Panel Test: ${managerPanel.managedEvents.length}`);
            set({ managerPanel })
        } catch (e) {
            console.log(`Error fetching Manager Panel: `, e);
        };
    },
}));

export default useManagerPanelStore;