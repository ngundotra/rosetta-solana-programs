import { PublicKey } from '@solana/web3.js';

export function parseEchoLogInstruction(logMessages: string[], publicKey: PublicKey): string {
    if (!logMessages || !logMessages.length) {
        throw Error("Expected transaction to have logMessages");
    }

    for (const logLine of logMessages!) {
        if (logLine.startsWith("Program log:")) {
            const userLog = logLine.slice("Program log: ".length);
            const walletPublicKey = publicKey.toBase58();
            if (userLog.startsWith(walletPublicKey)) {
                const parts = userLog.split(": ");
                return parts[1];
            }
        }
    }
    throw Error("Could not find our message in the transaction log messages");
}
