import {useWeb3React} from "@web3-react/core";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useEffect, useState} from "react";
import {Registry, Wallet} from "@civic/did-registry";

export type RegisteredDIDs = { solana: string[], ethereum: string[]};
export const useRegistry = ():RegisteredDIDs => {
    const { account } = useWeb3React();
    const wallet = useWallet();
    const { connection } = useConnection();
    const [ registeredSolanaDIDs, setRegisteredSolanaDIDs ] = useState<string[]>([]);
    const [ registeredEthereumDIDs, setRegisteredEthereumDIDs ] = useState<string[]>([]);

    useEffect(() => {
        if (wallet) {
            const registry = new Registry(wallet as Wallet, connection)

            registry.listDIDs().then(setRegisteredSolanaDIDs);

            if (account) {
                registry.listDIDsForEthAddress(account).then(setRegisteredEthereumDIDs);
            }
        }
    }, [account, wallet, connection]);

    return { solana: registeredSolanaDIDs, ethereum: registeredEthereumDIDs };
}