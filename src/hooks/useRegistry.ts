import {useWeb3React} from "@web3-react/core";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useCallback, useEffect, useState} from "react";
import {EthRegistry, ReadOnlyRegistry, Registry, Wallet} from "@civic/did-registry";

export type RegistryContext = {
    registeredSolanaDIDs: string[],
    registeredEthereumDIDs: string[],
    solanaKeyRegistry?: Registry,
    ethereumKeyRegistry?: EthRegistry
    reload: () => void
};
export const useRegistry = (): RegistryContext => {
    const { account } = useWeb3React();
    const wallet = useWallet();
    const { connection } = useConnection();
    const [ registeredSolanaDIDs, setRegisteredSolanaDIDs ] = useState<string[]>([]);
    const [ registeredEthereumDIDs, setRegisteredEthereumDIDs ] = useState<string[]>([]);
    const [ solanaKeyRegistry, setSolanaKeyRegistry ] = useState<Registry>();
    const [ ethereumKeyRegistry, setEthereumKeyRegistry ] = useState<EthRegistry>();

    const loadDIDs = useCallback(() => {
        console.log("Loading DIDs")
        if (wallet.publicKey) {
            console.log("Found wallet public key " + wallet.publicKey.toBase58())
            ReadOnlyRegistry.for(wallet.publicKey, connection).listDIDs().then(setRegisteredSolanaDIDs);
            setSolanaKeyRegistry(Registry.for(wallet as Wallet, connection));
        } else {
            setRegisteredSolanaDIDs([]);
        }

        if (account) {
            console.log("Found Ethereum account " + account)
            ReadOnlyRegistry.forEthAddress(account, connection).listDIDs().then(d => {
                console.log("Found Ethereum DIDs" + d)
                setRegisteredEthereumDIDs(d)
            });
            setEthereumKeyRegistry(EthRegistry.forEthAddress(account, wallet as Wallet, connection));
        } else {
            setRegisteredEthereumDIDs([]);
        }
    }, [account, wallet, connection]);

    useEffect(loadDIDs, [account, wallet, connection]);

    return {
        registeredSolanaDIDs,
        registeredEthereumDIDs,
        solanaKeyRegistry,
        ethereumKeyRegistry,
        reload: loadDIDs
    };
}
