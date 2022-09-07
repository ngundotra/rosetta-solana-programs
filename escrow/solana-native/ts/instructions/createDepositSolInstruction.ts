import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID } from '../index';
import { findWithdrawalEscrowAccountSync } from '../accounts';
import * as BN from 'bn.js';

export type DepositSolInstructionAccounts = {
    depositor: PublicKey,
    withdrawer: PublicKey,
    withdrawalEscrow?: PublicKey,
    systemProgram?: PublicKey,
}

export type DepositSolInstructionArgs = {
    amount: BN
}

export function createDepositSolInstruction(
    accounts: DepositSolInstructionAccounts,
    args: DepositSolInstructionArgs
): TransactionInstruction {
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            {
                pubkey: accounts.depositor,
                isSigner: true,
                isWritable: true
            },
            {
                pubkey: accounts.withdrawer,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: accounts.withdrawalEscrow ?? findWithdrawalEscrowAccountSync(accounts.withdrawer)[0],
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.systemProgram ?? SystemProgram.programId,
                isSigner: false,
                isWritable: false
            }
        ],
        data: Buffer.concat([Buffer.from([0x0]), Buffer.from(args.amount.toArray('le', 8))])
    })
}