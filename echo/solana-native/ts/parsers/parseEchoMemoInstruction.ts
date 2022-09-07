import {
    MessageCompiledInstruction,
    PublicKey,
    VersionedTransactionResponse,
} from '@solana/web3.js';
import { PROGRAM_ID, SPL_MEMO_PROGRAM_ID } from '../index';
import * as bs58 from 'bs58';

export function parseEchoMemoInstruction(txInfo: VersionedTransactionResponse, publicKey: PublicKey): {
    message: string,
    signers: PublicKey[]
} {
    const accountKeys = txInfo.transaction.message.staticAccountKeys;
    const getDecompiledPublicKey = (index: number): PublicKey => accountKeys[index];
    const topLevelIxs = txInfo.transaction.message.compiledInstructions;
    const getCompiledIx = (index: number): MessageCompiledInstruction => topLevelIxs[index];

    for (const topLevelIx of txInfo.meta?.innerInstructions ?? []) {
        for (const innerIx of topLevelIx.instructions) {
            if (getDecompiledPublicKey(innerIx.programIdIndex).equals(SPL_MEMO_PROGRAM_ID)) {
                // Check that the calling program is our program, otherwise keep looking
                if (!getDecompiledPublicKey(getCompiledIx(topLevelIx.index).programIdIndex).equals(PROGRAM_ID)) {
                    continue;
                }

                // Decode the instruction data sent to the program
                const innerIxData = bs58.decode(innerIx.data);
                const decoder = new TextDecoder('utf-8');
                return { message: decoder.decode(innerIxData), signers: innerIx.accounts.map((accountIndex) => getDecompiledPublicKey(accountIndex)) }
            }
        }
    }
    throw Error("Unable to find any echo memo instruction in the program")
}
