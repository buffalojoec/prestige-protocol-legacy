import { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SolanaResumeComponent } from './SolanaResume';
import { ManagerPanelComponent } from './ManagerPanel';
import { PublicKey } from '@solana/web3.js';
// import { PRESTIGE_PROGRAM_ID } from 'prestige-protocol';


export const PrestigeDao: FC = () => {

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [ showRewards, setShowRewards ] = useState<boolean>(true);

    const PRESTIGE_PROGRAM_ID = new PublicKey("663mRtTGD5Y5LVxo5uaaPWviM1NdHBrvZtLwFhY5RLRL");


    return(
        <div className='flex flex-col w-full'>
            { publicKey ?
                <div>
                    { showRewards ?
                        <div className='text-center'>
                            <button className="text-md text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 bg-[#eb9b34]" 
                                onClick={() => setShowRewards(false)}>
                                    <span>Manage Events</span>
                            </button>
                            <SolanaResumeComponent
                                // connection={connection}
                                programId={PRESTIGE_PROGRAM_ID}
                                // publicKey={publicKey}
                            />
                        </div>
                        :
                        <div className='text-center'>
                            <button className="text-md text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-2 bg-[#eb9b34]" 
                                onClick={() => setShowRewards(true)}>
                                    <span>Show Rewards</span>
                            </button>
                            <ManagerPanelComponent
                                // connection={connection}
                                programId={PRESTIGE_PROGRAM_ID}
                                // publicKey={publicKey}
                            />
                        </div>
                    }
                </div>
                :
                <div>
                    <div className='rounded-md border-2 border-[#2b2b2b] px-8 py-4 my-2 text-xl'>
                        <p>Connect your wallet to access <span className="text-[#eb9b34] font-['Arial']">PrestigeDAO</span></p>
                    </div>
                </div>
            }
        </div>
    );
};