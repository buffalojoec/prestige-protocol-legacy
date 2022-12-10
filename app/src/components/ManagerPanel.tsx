import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FC, useEffect } from "react";
import useManagerPanelStore from "stores/useManagerPanelStore";


interface ManagerPanelProps {
    // connection: Connection,
    programId: PublicKey,
    // publicKey: PublicKey,
}


export const ManagerPanelComponent: FC<ManagerPanelProps> = (props: ManagerPanelProps) => {

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const { managerPanel, getManagerPanel } = useManagerPanelStore();

    useEffect(() => {
        getManagerPanel(connection, props.programId, publicKey);
    }, [connection, publicKey, getManagerPanel]);

    return(
        <div>
            <p>{managerPanel.managedEvents[0].eventTitle}</p>
        </div>
    )
}