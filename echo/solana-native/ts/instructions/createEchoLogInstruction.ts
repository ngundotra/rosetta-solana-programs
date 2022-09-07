
import {
    Signer,
    TransactionInstruction
} from '@solana/web3.js';
import {
    PROGRAM_ID
} from '../index';

export type EchoLogInstructionAccounts = {
    signer: Signer
}

export type EchoLogInstructionArgs = {
    message: String
}

export function createEchoLogInstruction(
    accounts: EchoLogInstructionAccounts,
    args: EchoLogInstructionArgs
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
        data: Buffer.concat([Buffer.from([0x0]), Buffer.from(args.message, 'utf-8')]),
    };
}