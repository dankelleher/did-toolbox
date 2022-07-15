import {Connection, PublicKey, TransactionInstruction} from "@solana/web3.js";
import {
    createAddKeyInstruction,
    createAddServiceInstruction, createRemoveKeyInstruction,
    createRemoveServiceInstruction,
    DIDDocument,
    resolve
} from "@identity.com/sol-did-client";
import {ServiceEndpoint} from "did-resolver/src/resolver";
import {WalletContextState} from "@solana/wallet-adapter-react/src/useWallet";
import {sendTransaction} from "./solanaUtils";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {VerificationMethod} from "did-resolver";

export const keyToDid = (key: PublicKey, network: WalletAdapterNetwork): string => {
    const networkPrefix = network === WalletAdapterNetwork.Mainnet ? "" : network.toString() + ":";
    return `did:sol:${networkPrefix}${key.toBase58()}`;
}
export const findPFP = (document: DIDDocument): string | undefined => document.service?.find(s => s.type === 'PFP')?.serviceEndpoint

export const isVerificationMethod = (entry: VerificationMethod | ServiceEndpoint): entry is VerificationMethod => entry.hasOwnProperty('controller');

export const resolveDID = (did: string): Promise<DIDDocument> => resolve(did)

const sendInstruction = async (instruction: TransactionInstruction, wallet: WalletContextState, connection: Connection): Promise<string> => {
    const latestBlockhash = await connection.getLatestBlockhash()
    const signature = await sendTransaction([instruction], wallet, connection, latestBlockhash)
    await connection.confirmTransaction({
        signature,
        blockhash: 'latest',
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });
    return signature;
}

export const addServiceToDID = async (did: string, wallet: WalletContextState, service: ServiceEndpoint, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const instruction = await createAddServiceInstruction({
        authority: wallet.publicKey, did, payer: wallet.publicKey, service, connection
    });

    await sendInstruction(instruction, wallet, connection);
}
export const removeServiceFromDID = async (did: string, wallet: WalletContextState, identifier: string, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const fragment = identifier.match(/^did:sol:.*#(.*)$/)?.[1];

    if (!fragment) throw new Error(`Invalid identifier: ${identifier}`);

    const instruction = await createRemoveServiceInstruction({
        authority: wallet.publicKey, did, payer: wallet.publicKey, fragment, connection
    });

    await sendInstruction(instruction, wallet, connection);
}

export const addVerificationMethodToDID = async (did: string, wallet: WalletContextState, fragment: string, key: PublicKey, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const instruction = await createAddKeyInstruction({
        authority: wallet.publicKey, did, payer: wallet.publicKey, fragment, key, connection
    });

    await sendInstruction(instruction, wallet, connection);
}
export const removeVerificationMethodFromDID = async (did: string, wallet: WalletContextState, identifier: string, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const fragment = identifier.match(/^did:sol:.*#(.*)$/)?.[1];

    if (!fragment) throw new Error(`Invalid identifier: ${identifier}`);

    const instruction = await createRemoveKeyInstruction({
        authority: wallet.publicKey, did, payer: wallet.publicKey, fragment, connection
    });

    await sendInstruction(instruction, wallet, connection);
}