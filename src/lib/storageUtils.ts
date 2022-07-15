import {decrypt, encrypt, UnencryptedPayload} from "./cryptoUtils";
import {MessageSignerWalletAdapter} from "@solana/wallet-adapter-base";
import {addToIPFS} from "./ipfsUtils";

export const cidPathToUrl = (cidPath: string) => cidToUrl(cidPath.replace(/^ipfs:\/\//, ''));
const cidToUrl = (cid: string) => `https://ipfs.infura.io/ipfs/${cid}`;

export const store = async (file: File, did: string, wallet: MessageSignerWalletAdapter, progressCallback: (percent: number) => void) => {
    // TODO this is crazy inefficient - turning the file to a base64 string, encrypting it, then encoding the result as base64 again
    // we should change lexi (& did-jwt) to accept a buffer if possible
    const data = await file.arrayBuffer().then(arrayBuffer => new Buffer(arrayBuffer));
    const unencryptedPayload = {
        data,
        name: file.name,
        mimeType: file.type,
    }
    const payload = await encrypt(unencryptedPayload, did, wallet);
    return addToIPFS(JSON.stringify(payload), file.name, progressCallback);
}

export const retrieve = async (cid: string, did: string, wallet: MessageSignerWalletAdapter): Promise<UnencryptedPayload> => {
    const url = cidPathToUrl(cid);
    const encryptedContent = await fetch(url).then(res => res.text()).then(JSON.parse);
    return decrypt(encryptedContent, did, wallet);
}

export const download = (file: UnencryptedPayload) => {
    const blob = new Blob(
        [ file.data ],
        { type: file.mimeType }
    );

    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = file.name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );

    // Remove link from body
    document.body.removeChild(link);
};