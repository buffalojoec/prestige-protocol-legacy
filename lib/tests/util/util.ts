import fs from "fs";
import { 
    Keypair, 
    PublicKey 
} from '@solana/web3.js';
import { 
    ManagerPanel,  
    SolanaResume,
} from '../../src';


export function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(path, "utf-8")))
    )
}


export function printSolanaResume(solanaResume: SolanaResume, earner: PublicKey): void {
    console.log("====================================================");
    console.log("Solana Resume:");
    console.log(`Earner: ${earner.toString()}`);
    console.log("- Achievements:");
    for (const achievement of solanaResume.achievements) {
        console.log(`   - ${achievement.eventTitle}`);
        for (const challenge of achievement.challengesCompleted) {
            console.log(`       - ${challenge.challengeTitle}`);
            for (const reward of challenge.rewards) {
                console.log(`           - ${reward.title}   ${reward.quantity}`);
            }
        }
    }
    console.log("====================================================");
}


export function printManagerPanel(managerPanel: ManagerPanel, authority: PublicKey): void {
    console.log("====================================================");
    console.log("Manager Panel:");
    console.log(`Authority: ${authority.toString()}`);
    console.log("- Events:");
    for (const event of managerPanel.managedEvents) {
        console.log(`   - ${event.eventTitle}`);
        for (const challenge of event.challengesCompleted) {
            console.log(`       - ${challenge.challengeTitle}`);
            for (const reward of challenge.rewards) {
                console.log(`           - ${reward.title}   ${reward.quantity}`);
            }
        }
    }
    console.log("====================================================");
}