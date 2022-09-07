import {
    PublicKey
} from '@solana/web3.js';
import { PROGRAM_ID } from '../index';
export const ESCROW_PREFIX = "escrow";

export function getWithdrawalEscrowAccountSeeds(withdrawer: PublicKey): Buffer[] {
    return [Buffer.from(ESCROW_PREFIX, 'utf-8'), PROGRAM_ID.toBuffer(), withdrawer.toBuffer()]
}

export async function findWithdrawalEscrowAccount(withdrawer: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(getWithdrawalEscrowAccountSeeds(withdrawer), PROGRAM_ID)
}

export function findWithdrawalEscrowAccountSync(withdrawer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(getWithdrawalEscrowAccountSeeds(withdrawer), PROGRAM_ID)
}