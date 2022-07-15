import {useDID} from "../hooks/useDID";
import {FC, useCallback, useMemo, useState} from "react";
import {StoredItem} from "./StoredItem";
import {Center} from "@chakra-ui/react";
import {useWallet} from "@solana/wallet-adapter-react";
import {download, retrieve} from "../lib/storageUtils";
import {MessageSignerWalletAdapter} from "@solana/wallet-adapter-base";

export const StoredItems: FC = () => {
    const wallet = useWallet();
    const { document, did } = useDID();

    const storageServices = useMemo(() => {
        if (!document) return [];
        return (document?.service || []).filter(service => service.type === 'store');
    }, [document]);

    const downloadFile = useCallback(async (cid: string) => {
        if (!wallet || !wallet.connected) return;

        const retrievedFile = await retrieve(cid, did, wallet as unknown as MessageSignerWalletAdapter);

        console.log(Buffer.from(retrievedFile.data).toString('utf8'));
        console.log(retrievedFile.name);
        console.log(retrievedFile.mimeType);
        download(retrievedFile);

    }, [wallet, did])

    return (
        <Center py={6}>
            {storageServices.map(service => <StoredItem service={service} retrieve={downloadFile}/>)}

        </Center>
    )
}