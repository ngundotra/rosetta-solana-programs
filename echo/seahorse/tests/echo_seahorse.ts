import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";
import { EchoSeahorse } from "../target/types/echo_seahorse";

function parseMessage(logMessages: string[], publicKey: PublicKey): string {
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


describe("echo_seahorse", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EchoSeahorse as Program<EchoSeahorse>;

  it("Test our echo", async () => {
    // Add your test here.
    const provider = anchor.getProvider();
    const message = "Hello World";
    const txId = await program.methods.echo(message).accounts({
      signer: provider.publicKey
    }).rpc({
      commitment: 'confirmed'
    });
    const txInfo = await provider.connection.getTransaction(txId, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    // Check that the transaction succeeded
    assert(!txInfo?.meta?.err, "Expected the instruction to succeed");
    // Check that the transaction info has log messages
    assert(txInfo?.meta?.logMessages, "Expected transaction to have logMessages");

    // Let's look for our string with our paper wallet's pubkey
    const parsedMessage = parseMessage(txInfo!.meta!.logMessages!, provider.publicKey);
    assert(parsedMessage === message, "Logged string does not match passed string");
  });
});
