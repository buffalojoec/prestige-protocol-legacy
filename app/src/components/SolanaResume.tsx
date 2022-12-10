import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import useSolanaResumeStore from "stores/useSolanaResumeStore";
import { renderSolanaResume, SolanaResume } from "prestige-protocol";


interface SolanaResumeProps {
    // connection: Connection,
    programId: PublicKey,
    // publicKey: PublicKey,
}


export const SolanaResumeComponent: FC<SolanaResumeProps> = (props: SolanaResumeProps) => {

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const { solanaResume, getSolanaResume } = useSolanaResumeStore();

    const [ testResume, setTestResume ] = useState<SolanaResume>(undefined);

    const loadResume = async () => {
        const res = await renderSolanaResume(connection, props.programId, publicKey);
        setTestResume(res);
        console.log(res.achievements[0].eventTitle);
    }

    useEffect(() => {
        if (publicKey) {
            getSolanaResume(connection, props.programId, publicKey);
            // loadResume();
        };
    }, [connection, publicKey, getSolanaResume]);


    return(
        <div>
            {testResume && <p>{testResume.achievements[0].eventTitle}</p>}
        </div>
    )
}