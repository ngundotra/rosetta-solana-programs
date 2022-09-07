import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../index";

export const MEMO_PREFIX = "memo";

export function getMemoSignerAccountSeeds(message: string): Buffer[] {
    return [Buffer.from(MEMO_PREFIX, 'utf-8'), PROGRAM_ID.toBuffer(), Buffer.from(message, 'utf-8')]
}

export async function findMemoSignerAccount(message: string): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(getMemoSignerAccountSeeds(message), PROGRAM_ID)
}

export function findMemoSignerAccountSync(message: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(getMemoSignerAccountSeeds(message), PROGRAM_ID)
}