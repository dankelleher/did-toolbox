import {createContext, FC, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {
    addServiceToDID, addVerificationMethodToDID,
    keyToDid,
    removeServiceFromDID,
    removeVerificationMethodFromDID,
    resolveDID
} from "../lib/didUtils";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {DIDDocument} from "did-resolver";
import {PublicKey} from "@solana/web3.js";
import {Service} from "@identity.com/sol-did-client";

type DIDContextProps = {
    did: string;
    document: DIDDocument;
    addKey: (identifier: string, key: PublicKey) => Promise<void>;
    removeKey: (fragment: string) => Promise<void>;
    addService: (service: Service) => Promise<void>;
    removeService: (fragment: string) => Promise<void>;
}

const defaultDocument = {
    "@context": "https://w3id.org/did/v1",
    id: "",
    verificationMethod: [],
    service: [],
}

const defaultDIDContextProps: DIDContextProps = {
    did: "",
    document: defaultDocument,
    addKey: async (identifier: string, key: PublicKey) => {},
    removeKey: async (identifier: string) => {},
    addService: async (service: Service) => {},
    removeService: async (identifier: string) => {},
}
export const DIDContext = createContext<DIDContextProps>(defaultDIDContextProps)

export const DIDProvider: FC<{ children: ReactNode, network: WalletAdapterNetwork }> = ({ children, network }) => {
    const wallet = useWallet();
    const {connection} = useConnection();
    const [document, setDocument] = useState<DIDDocument>();
    const [did, setDid] = useState<string>("");

    const loadDID = useCallback(() => {
        if (did) {
            resolveDID(did).then(setDocument);
        }
    }, [did])

    useEffect(() => {
        if (wallet && wallet.publicKey) {
            const did = keyToDid(wallet.publicKey, network);
            setDid(did);
        }
    }, [wallet, network]);

    useEffect(() => {
        loadDID();
    }, [did]);

    const addService = (service: Service) => {
        return addServiceToDID(did, wallet, service, connection).then(() => loadDID());
    }

    const removeService = (identifier: string) => {
        return removeServiceFromDID(did, wallet, identifier, connection).then(() => loadDID());
    }

    const addKey = (identifier: string, key: PublicKey) => {
        return addVerificationMethodToDID(did, wallet, identifier, key, connection).then(() => loadDID());
    }

    const removeKey = (identifier: string) => {
        return removeVerificationMethodFromDID(did, wallet, identifier, connection).then(() => loadDID());
    }

    return (
        <DIDContext.Provider value={{
            did,
            document: document ?? defaultDocument,
            addKey,
            removeKey,
            addService,
            removeService,
        }}>{children}</DIDContext.Provider>
    )
}

export const useDID = (): DIDContextProps => useContext(DIDContext);