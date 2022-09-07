import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
    VersionedTransaction
} from '@solana/web3.js';
import { assert } from 'chai';
import * as BN from 'bn.js';

import {
    createDepositSolInstruction,
    findWithdrawalEscrowAccountSync,
    createWithdrawSolInstruction,
} from '../ts';

describe("Echo Solana Native", () => {
    const connection = new Connection("http://localhost:8899");

    const depositorKeypair = Keypair.generate();
    const depositor = depositorKeypair.publicKey;

    const withdrawerKeypair = Keypair.generate();
    const withdrawer = withdrawerKeypair.publicKey;

    const withdrawalEscrow = findWithdrawalEscrowAccountSync(withdrawer)[0];
    const amount = new BN.BN(LAMPORTS_PER_SOL).div(new BN.BN(2.0));
    it("Test deposit sol", async () => {
        await connection.requestAirdrop(depositor, LAMPORTS_PER_SOL);

        const ix: TransactionInstruction = createDepositSolInstruction({
            depositor,
            withdrawer,
            withdrawalEscrow
        }, { amount });

        let tx = new Transaction().add(ix);

        tx.feePayer = depositor;
        tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

        await sendAndConfirmTransaction(connection, tx, [depositorKeypair], { skipPreflight: true, commitment: 'confirmed' });

        const withdrawalEscrowAccount = await connection.getAccountInfo(withdrawalEscrow, { commitment: "confirmed" });
        assert!(withdrawalEscrowAccount, "Expected withdrawalAccount to have been created");
        assert!(withdrawalEscrowAccount!.lamports === amount.toNumber(), "Expected withdrawal amount to equal amount deposited")
    });
    it("Test withdraw sol", async () => {
        await connection.requestAirdrop(withdrawer, LAMPORTS_PER_SOL);

        const ix: TransactionInstruction = createWithdrawSolInstruction({
            withdrawer,
            withdrawalEscrow
        }, { amount });

        let tx = new Transaction().add(ix);

        // tx.feePayer = withdrawer;
        tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

        await sendAndConfirmTransaction(connection, tx, [withdrawerKeypair], { skipPreflight: true, commitment: 'confirmed' });
        const withdrawerAccount = await connection.getAccountInfo(withdrawer, { commitment: "confirmed" });
        assert!(withdrawerAccount, "Expected withdrawer to have been created");
        const amountWithdrawn = withdrawerAccount!.lamports - (LAMPORTS_PER_SOL - 5000);
        assert!((amountWithdrawn === amount.toNumber()) || (amountWithdrawn === amount.toNumber() + 5000), "Expected withdrawer amount to equal amount withdrawn")
    });
    it("Test withdraw sol [bad actor]", async () => {
        const hackerManKeypair = Keypair.generate();
        const hackerMan = hackerManKeypair.publicKey;
        await connection.requestAirdrop(hackerMan, LAMPORTS_PER_SOL);

        const ix: TransactionInstruction = createWithdrawSolInstruction({
            withdrawer: hackerMan,
            withdrawalEscrow
        }, { amount });

        let tx = new Transaction().add(ix);

        tx.feePayer = hackerMan;
        tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

        try {
            await sendAndConfirmTransaction(connection, tx, [hackerManKeypair], { skipPreflight: true, commitment: 'confirmed' });
            assert(false, "Expected transaction to fail!");
        } catch (e) {
            console.log("Hackerman succesfully stopped with error:", e)
        }
    })
});