import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram
} from '@solana/web3.js';
import { CounterSeahorse } from "../target/types/counter_seahorse";

describe("counter_seahorse", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CounterSeahorse as Program<CounterSeahorse>;

  it("Is initialized!", async () => {
    // Add your test here.

    const counter = PublicKey.findProgramAddressSync(
      [program.provider.publicKey!.toBuffer()],
      program.programId
    )[0];

    const tx = await program.methods
      .increment()
      .accounts({
        counter
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
