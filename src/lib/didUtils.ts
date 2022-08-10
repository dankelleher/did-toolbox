import {Connection, PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {
    DidSolIdentifier,
    DidSolService,
    ExtendedCluster,
    Service,
    VerificationMethodFlags,
    VerificationMethodType,
    Wallet
} from "@identity.com/sol-did-client";
import {WalletContextState} from "@solana/wallet-adapter-react/src/useWallet";
import {sendTransaction} from "./solanaUtils";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {DIDDocument, VerificationMethod} from "did-resolver";

const toWallet = (walletContextState: WalletContextState):Wallet => {
    if (!walletContextState.publicKey || !walletContextState.signTransaction || !walletContextState.signAllTransactions) {
        throw Error("Unsupported wallet type");
    }

    return {
        publicKey: walletContextState.publicKey,
        signTransaction(tx: Transaction): Promise<Transaction> {
            return walletContextState.signTransaction!(tx);
        },
        signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
            return walletContextState.signAllTransactions!(txs);
        }
    };
}

const getService = (authority: PublicKey, clusterType: ExtendedCluster, wallet?: WalletContextState) =>
    DidSolService.build(
        new DidSolIdentifier({authority, clusterType}),
        undefined,
        wallet ? toWallet(wallet) : undefined
    );

const getServiceFromDID = (did: string, wallet?: WalletContextState) => DidSolService.build(
    DidSolIdentifier.parse(did),
    undefined,
    wallet ? toWallet(wallet) : undefined
    );

export const keyToDid = (key: PublicKey, network: WalletAdapterNetwork): string => {
    const networkPrefix = network === WalletAdapterNetwork.Mainnet ? "" : network.toString() + ":";
    return `did:sol:${networkPrefix}${key.toBase58()}`;
}
export const findPFP = (document: DIDDocument): string | undefined => document.service?.find(s => s.type === 'PFP')?.serviceEndpoint

export const isVerificationMethod = (entry: VerificationMethod | Service): entry is VerificationMethod => entry.hasOwnProperty('controller');

export const resolveDID = (did: string): Promise<DIDDocument> => getServiceFromDID(did).then(service => service.resolve())

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

export const addServiceToDID = async (did: string, wallet: WalletContextState, service: Service, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const didSolService = await getServiceFromDID(did, wallet);

    await didSolService.addService(service).rpc();
}
export const removeServiceFromDID = async (did: string, wallet: WalletContextState, identifier: string, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const didSolService = await getServiceFromDID(did, wallet);

    const fragment = identifier.match(/^did:sol:.*#(.*)$/)?.[1];
    if (!fragment) throw new Error(`Invalid identifier: ${identifier}`);

    await didSolService.removeService(fragment).rpc();
}

export const addVerificationMethodToDID = async (did: string, wallet: WalletContextState, fragment: string, key: PublicKey, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const didSolService = await getServiceFromDID(did, wallet);

    await didSolService.addVerificationMethod(
        {
            flags: VerificationMethodFlags.None, fragment, keyData: key.toBytes(), methodType: VerificationMethodType.Ed25519VerificationKey2018
        }
    ).rpc();
}
export const removeVerificationMethodFromDID = async (did: string, wallet: WalletContextState, identifier: string, connection: Connection): Promise<void> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');

    const fragment = identifier.match(/^did:sol:.*#(.*)$/)?.[1];
    if (!fragment) throw new Error(`Invalid identifier: ${identifier}`);

    const didSolService = await getServiceFromDID(did, wallet);

    await didSolService.removeVerificationMethod(fragment).rpc();
}