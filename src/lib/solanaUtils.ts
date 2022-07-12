import {BlockhashWithExpiryBlockHeight, Connection, Transaction, TransactionInstruction} from "@solana/web3.js";
import {WalletContextState} from "@solana/wallet-adapter-react";

export const sendTransaction = (instructions: TransactionInstruction[], wallet: WalletContextState, connection: Connection, latestBlockhash: BlockhashWithExpiryBlockHeight):Promise<string> => {
    if (!wallet.publicKey) throw new Error('Wallet is not connected');
    const transaction = new Transaction(latestBlockhash).add(...instructions);
    return wallet.sendTransaction(transaction, connection);
}