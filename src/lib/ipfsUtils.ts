import {CID, create as ipfsHttpClient} from "ipfs-http-client";

const ipfs = ipfsHttpClient({
    url: 'https://ipfs.infura.io:5001/api/v0'
})

export const addToIPFS = async (content: string, path: string, progressCallback: (percent: number) => void):Promise<CID> => {
    const result = await ipfs.add({
        path,
        content,
    }, {
        progress: (bytes) => progressCallback(bytes * 100 / content.length)
    });
    return result.cid;
}