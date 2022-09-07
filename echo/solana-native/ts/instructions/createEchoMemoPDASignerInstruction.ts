
import { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID, SPL_MEMO_PROGRAM_ID } from '../index';

export type EchoMemoPDASignerInstructionAccounts = {
    signer: Signer,
    /// PDAs can never be signers in top-level TransactionInstructions
    pdaSigner: PublicKey,
    memoProgram?: PublicKey,
}

export type EchoMemoPDASignerInstructionArgs = {
    message: String
}

export function createEchoMemoPDASignerInstruction(
    accounts: EchoMemoPDASignerInstructionAccounts,
    args: EchoMemoPDASignerInstructionArgs
): TransactionInstruction {
    return {
        programId: PROGRAM_ID,
        keys: [
            {
                pubkey: accounts.signer.publicKey,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: accounts.pdaSigner,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: accounts.memoProgram ?? SPL_MEMO_PROGRAM_ID,
                isSigner: false,
                isWritable: false
            }
        ],
        data: Buffer.concat([Buffer.from([0x2]), Buffer.from(args.message, 'utf-8')]),
    };
}