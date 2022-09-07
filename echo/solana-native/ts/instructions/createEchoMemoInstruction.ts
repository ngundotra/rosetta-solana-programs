
import { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID, SPL_MEMO_PROGRAM_ID } from '../index';

export type EchoMemoInstructionAccounts = {
    signer: Signer,
    memoProgram?: PublicKey,
}

export type EchoMemoInstructionArgs = {
    message: String
}

export function createEchoMemoInstruction(
    accounts: EchoMemoInstructionAccounts,
    args: EchoMemoInstructionArgs
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
                pubkey: accounts.memoProgram ?? SPL_MEMO_PROGRAM_ID,
                isSigner: false,
                isWritable: false
            }
        ],
        data: Buffer.concat([Buffer.from([0x1]), Buffer.from(args.message, 'utf-8')]),
    };
}