import {useWeb3React} from "@web3-react/core";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useEffect, useState} from "react";
import {Registry, Wallet} from "@civic/did-registry";

export type RegistryContrxt = { solana: string[], ethereum: string[], registry?: Registry };
export const useRegistry = (): RegistryContrxt => {
    const { account } = useWeb3React();
    const wallet = useWallet();
    const { connection } = useConnection();
    const [ registeredSolanaDIDs, setRegisteredSolanaDIDs ] = useState<string[]>([]);
    const [ registeredEthereumDIDs, setRegisteredEthereumDIDs ] = useState<string[]>([]);
    const [ registry, setRegistry ] = useState<Registry | undefined>();

    useEffect(() => {
        if (wallet) {
            setRegistry(new Registry(wallet as Wallet, connection));
        } else {
            setRegistry(undefined);
        }
    }, [wallet, connection]);


    useEffect(() => {
        if (registry) {
            registry.listDIDs().then(setRegisteredSolanaDIDs);

            if (account) {
                registry.listDIDsForEthAddress(account).then(setRegisteredEthereumDIDs);
            }
        }
        else {
            setRegisteredSolanaDIDs([]);
            setRegisteredEthereumDIDs([]);
        }
    }, [account, registry]);

    return { solana: registeredSolanaDIDs, ethereum: registeredEthereumDIDs, registry };
}
