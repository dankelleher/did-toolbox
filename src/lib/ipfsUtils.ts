import {CID, create as ipfsHttpClient} from "ipfs-http-client";

const ipfs = ipfsHttpClient({url: 'https://ipfs.infura.io:5001/api/v0'})

export const addToIPFS = async (file: File, progressCallback: (percent: number) => void):Promise<CID> => {
    const result = await ipfs.add({
        path: file.name,
        content: file.stream()
    }, {
        progress: (bytes) => progressCallback(bytes * 100 / file.size)
    });
    return result.cid;
}