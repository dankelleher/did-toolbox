import {LexiWallet} from "@civic/lexi";
import {MessageSignerWalletAdapter} from "@solana/wallet-adapter-base/src/signer";

type Payload = {

}

export const encrypt = (readableStream: ReadableStream<>, did: string, wallet: MessageSignerWalletAdapter) => {
    const lexi = new LexiWallet(wallet, did, { publicSigningString : seed})
}