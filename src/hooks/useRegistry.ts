import {useWeb3React} from "@web3-react/core";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {EthRegistry, ReadOnlyRegistry, Registry, Wallet} from "@civic/did-registry";
import { PublicKey } from "@solana/web3.js";
import { useDID } from "./useDID";
import {keyToDid} from "../lib/didUtils";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";

export type RegistryContext = {
    registeredSolanaDIDs: string[],
    registeredEthereumDIDs: string[],
    solanaKeyRegistry?: Registry,
    ethereumKeyRegistry?: EthRegistry
    getRegisteredDIDsForEthAddress: (ethAddress: string) => Promise<string[]>,
    getRegisteredDIDsForKey: (account: PublicKey) => Promise<string[]>,
    reload: () => void
};
export const useRegistry = (): RegistryContext => {
    const { cluster } = useDID();
    const { account } = useWeb3React();
    const wallet = useWallet();
    const { connection } = useConnection();
    const [ registeredSolanaDIDs, setRegisteredSolanaDIDs ] = useState<string[]>([]);
    const [ registeredEthereumDIDs, setRegisteredEthereumDIDs ] = useState<string[]>([]);
    const [ solanaKeyRegistry, setSolanaKeyRegistry ] = useState<Registry>();
    const [ ethereumKeyRegistry, setEthereumKeyRegistry ] = useState<EthRegistry>();

    const naturalDID = useMemo(() => wallet?.publicKey ? keyToDid(wallet.publicKey, cluster as WalletAdapterNetwork ) : null, [wallet, cluster]);

    const getRegisteredDIDsForEthAddress = useCallback(
      (ethAddress: string): Promise<string[]> => ReadOnlyRegistry.forEthAddress(ethAddress, connection, cluster).listDIDs()
      ,[connection]);

    const getRegisteredDIDsForKey = useCallback(
      (key: PublicKey): Promise<string[]> => ReadOnlyRegistry
          .for(key, connection, cluster)
          .listDIDs()
          .then(dids => [
              ...( naturalDID && !dids.includes(naturalDID) ? [naturalDID] : []),
                ...dids,
          ])
      ,[connection, naturalDID]);

    const loadDIDs = useCallback(() => {
        console.log("Loading DIDs")
        if (wallet.publicKey) {
            console.log("Found wallet public key " + wallet.publicKey.toBase58())
            getRegisteredDIDsForKey(wallet.publicKey).then(setRegisteredSolanaDIDs);
            setSolanaKeyRegistry(Registry.for(wallet as Wallet, connection, cluster));
        } else {
            setRegisteredSolanaDIDs([]);
        }

        if (account) {
            console.log("Found Ethereum account " + account)
            getRegisteredDIDsForEthAddress(account).then(setRegisteredEthereumDIDs);
            setEthereumKeyRegistry(EthRegistry.forEthAddress(account, wallet as Wallet, connection, cluster));
        } else {
            setRegisteredEthereumDIDs([]);
        }
    }, [account, wallet, connection, setSolanaKeyRegistry, setEthereumKeyRegistry, setRegisteredSolanaDIDs, setRegisteredEthereumDIDs]);



    useEffect(loadDIDs, [account, wallet, connection]);

    return {
        registeredSolanaDIDs,
        registeredEthereumDIDs,
        solanaKeyRegistry,
        ethereumKeyRegistry,
        getRegisteredDIDsForEthAddress,
        getRegisteredDIDsForKey,
        reload: loadDIDs,
    };
}
