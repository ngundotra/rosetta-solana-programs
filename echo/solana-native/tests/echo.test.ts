import {
    Connection,
    Signer,
    Keypair,
    Transaction,
    TransactionInstruction,
    PublicKey,
    TransactionSignature,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
    MessageV0
} from "@solana/web3.js";
import { assert } from "chai";

const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

type EchoInstructionAccounts = {
    signer: Signer
}
type EchoInstructionArgs = {
    message: String
}

function createEchoInstruction(
    accounts: EchoInstructionAccounts,
    args: EchoInstructionArgs
): TransactionInstruction {
    return {
        programId: PROGRAM_ID,
        keys: [
            {
                pubkey: accounts.signer.publicKey,
                isSigner: true,
                isWritable: false,
            }
        ],
        data: Buffer.from(args.message, 'utf-8'),
    };
}

function parseMessage(logMessages: string[], publicKey: PublicKey): string {
    for (const logLine of logMessages!) {
        if (logLine.startsWith("Program log:")) {
            const userLog = logLine.slice("Program log: ".length);
            const walletPublicKey = publicKey.toBase58();
            if (userLog.startsWith(`"${walletPublicKey}"`)) {
                const parts = userLog.split(": ");
                return parts[1];
            }
        }
    }
    throw Error("Could not find our message in the transaction log messages");
}

describe("Echo Solana Native", () => {
    const connection = new Connection("http://localhost:8899");

    // This is a single test case that can use the constants defined above
    // ---------------------------------------------------------
    // Create a paper wallet (aka keypair), and send a transaction instruction
    // to our program. We test that the string we send as instruction data
    // can be retrieved from the log messages of the confirmed transaction.
    it("Test", async () => {
        // Create the paper wallet, and airdrop 1 SOL (does not work on mainnet-beta)
        const keypair = Keypair.generate();
        await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);

        // We want this to be logged by the Solana runtime
        const message = "Hello World";

        // Create a TransactionInstruction to interact with our echo program
        const ix: TransactionInstruction = createEchoInstruction({ signer: keypair }, { message });

        // Put the instruction into a Transaction
        let tx = new Transaction().add(ix);

        // Explicitly set the feePayer to be the signer
        tx.feePayer = keypair.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

        // Send transaction to network (local network)
        const txId = await sendAndConfirmTransaction(connection, tx, [keypair], { skipPreflight: true, commitment: 'confirmed' });
        // Retrieve transaction details
        const txInfo = await connection.getTransaction(txId, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });

        // Check that the transaction succeeded
        assert(!txInfo?.meta?.err, "Expected the instruction to succeed");
        // Check that the transaction info has log messages
        assert(txInfo?.meta?.logMessages, "Expected transaction to have logMessages");

        // Let's look for our string with our paper wallet's pubkey
        const parsedMessage = parseMessage(txInfo!.meta!.logMessages!, keypair.publicKey);
        assert(parsedMessage === message, "Logged string does not match passed string");
    });
});