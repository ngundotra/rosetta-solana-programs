import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js"
import { PROGRAM_ID } from "../"
import { findWithdrawalEscrowAccountSync } from "../accounts"
import * as BN from 'bn.js';

export type WithdrawSolInstructionAccounts = {
    withdrawer: PublicKey,
    withdrawalEscrow?: PublicKey
    systemProgram?: PublicKey,
}
export type WithdrawSolInstructionArgs = {
    amount: BN
}

export function createWithdrawSolInstruction(
    accounts: WithdrawSolInstructionAccounts,
    args: WithdrawSolInstructionArgs
): TransactionInstruction {
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            {
                pubkey: accounts.withdrawer,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: accounts.withdrawalEscrow ?? findWithdrawalEscrowAccountSync(accounts.withdrawer)[0],
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.systemProgram ?? SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.concat([Buffer.from([0x1]), Buffer.from(args.amount.toArray('le', 8))])
    })
}