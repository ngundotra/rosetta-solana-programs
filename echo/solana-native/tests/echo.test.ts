import {
    Connection,
    Keypair,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { assert } from "chai";
import {
    createEchoLogInstruction,
    createEchoMemoInstruction,
    createEchoMemoPDASignerInstruction,
    findMemoSignerAccount,
    parseEchoLogInstruction,
    parseEchoMemoInstruction
} from '../ts';

describe("Echo Solana Native", () => {
    const connection = new Connection("http://localhost:8899");

    // This is a single test case that can use the constants defined above
    // ---------------------------------------------------------
    // Create a paper wallet (aka keypair), and send a transaction instruction
    // to our program. We test that the string we send as instruction data
    // can be retrieved from the log messages of the confirmed transaction.
    it("Test echo using logs", async () => {
        // Create the paper wallet, and airdrop 1 SOL (does not work on mainnet-beta)
        const keypair = Keypair.generate();
        await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);

        // We want this to be logged by the Solana runtime
        const message = "Hello World";

        // Create a TransactionInstruction to interact with our echo program
        const ix: TransactionInstruction = createEchoLogInstruction({ signer: keypair }, { message });

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

        // Let's look for our string with our paper wallet's pubkey
        const parsedMessage = parseEchoLogInstruction(txInfo!.meta!.logMessages!, keypair.publicKey);
        assert(parsedMessage === message, "Logged string does not match passed string");
    });
    it("Test echo using spl-memo", async () => {
        // Create the paper wallet, and airdrop 1 SOL (does not work on mainnet-beta)
        const keypair = Keypair.generate();
        await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);

        // We want this to be logged by the Solana runtime
        const message = "Hello World";

        // Create a TransactionInstruction to interact with our echo program
        // Note: we automatically infer the memoProgram ID in this function
        const ix: TransactionInstruction = createEchoMemoInstruction({ signer: keypair }, { message });

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

        // Let's look for our string with our paper wallet's pubkey
        const parsedEchoMemoInstruction = parseEchoMemoInstruction(txInfo!, keypair.publicKey);
        assert(parsedEchoMemoInstruction.message === message, "Logged string does not match passed string");
    });
    it("Test echo using spl-memo with PDA signer", async () => {
        // Create the paper wallet, and airdrop 1 SOL (does not work on mainnet-beta)
        const keypair = Keypair.generate();
        await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);

        // We want this to be logged by the Solana runtime
        const message = "Hello World";

        // Create a TransactionInstruction to interact with our echo program
        // Note: we automatically infer the memoProgram ID in this function
        const [pdaSigner, _bump] = await findMemoSignerAccount(message);
        const ix: TransactionInstruction = createEchoMemoPDASignerInstruction({ signer: keypair, pdaSigner }, { message });

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

        // Let's look for our string with our paper wallet's pubkey
        const parsedEchoMemoInstruction = parseEchoMemoInstruction(txInfo!, keypair.publicKey);
        assert(parsedEchoMemoInstruction.message === message, "Logged string does not match passed string");

        assert(parsedEchoMemoInstruction.signers[0].equals(keypair.publicKey), "Expected first signer to match user's keypair");
        assert(parsedEchoMemoInstruction.signers[1].equals(pdaSigner), "Expected second signer to be PDA key");
    });
});