import {createContext, FC, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {
    addServiceToDID, addVerificationMethodToDID, isMigratable, isInitialized,
    keyToDid, migrate,
    removeServiceFromDID,
    removeVerificationMethodFromDID,
    resolveDID, getDIDAddress, listRegisteredDIDs, getVerificationMethodFlags, registerDID, setOwned
} from "../lib/didUtils";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {DIDDocument} from "did-resolver";
import {PublicKey} from "@solana/web3.js";
import {
    AddVerificationMethodParams,
    Service,
    VerificationMethodFlags
} from "@identity.com/sol-did-client";

type DIDContextProps = {
    did: string;
    document: DIDDocument;
    linkedDIDs: string[];
    registerDIDOnKey: () => Promise<void>;
    addKey: (key: AddVerificationMethodParams) => Promise<void>;
    removeKey: (fragment: string) => Promise<void>;
    getKeyFlags: (fragment: string) => Promise<VerificationMethodFlags | undefined>;
    setKeyOwned: () => Promise<void>;
    addService: (service: Service) => Promise<void>;
    removeService: (fragment: string) => Promise<void>;
    migrateDID: () => Promise<void>;
    isDIDInitialized: () => Promise<boolean>;
    isLegacyDID: boolean | undefined;    // true if the DID refers to a "legacy" (v1 did:sol method) DID and needs migrating
    accountAddress: PublicKey | undefined;  // the address of the DID account if it is not a generative DID
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
    linkedDIDs: [],
    registerDIDOnKey: async () => {},
    addKey: async (key: AddVerificationMethodParams) => {},
    removeKey: async (fragment: string) => {},
    getKeyFlags: async (fragment: string) => undefined,
    setKeyOwned: async () => {},
    addService: async (service: Service) => {},
    removeService: async (fragment: string) => {},
    migrateDID: async () => {},
    isDIDInitialized: async () => false,
    isLegacyDID: undefined,
    accountAddress: undefined,
}
export const DIDContext = createContext<DIDContextProps>(defaultDIDContextProps)

export const DIDProvider: FC<{ children: ReactNode, network: WalletAdapterNetwork }> = ({ children, network }) => {
    const wallet = useWallet();
    const {connection} = useConnection();
    const [document, setDocument] = useState<DIDDocument>();
    const [did, setDIO] = useState<string>("");
    const [linkedDIDs, setLinkedDIDs] = useState<string[]>([]);
    const [isLegacyDID, setIsLegacyDID] = useState<boolean>();
    const [accountAddress, setAccountAddress] = useState<PublicKey>();

    const loadDID = useCallback(() => {
        console.log("Loading DID", did);
        console.log("network is", network);
        if (did) {
            resolveDID(did, connection).then(setDocument).catch(console.error);
            isMigratable(did, connection).then(setIsLegacyDID)
            getDIDAddress(did, connection).then(setAccountAddress);

            if (wallet && wallet.publicKey) {
                listRegisteredDIDs(wallet, connection).then(linkedDIDs => {
                    // TODO this is a hack - clean up
                    const didsOnNetwork = linkedDIDs.map(did => did.replace("did:sol:", `did:sol:${network}:`));
                    setLinkedDIDs(didsOnNetwork);
                });
            }
        }
    }, [did, wallet, network, connection])

    useEffect(() => {
        const location = window.location.href.match(/\/(did:sol:.*)#?$/);
        if (location) {
            setDIO(location[1]);
        } else if (wallet && wallet.publicKey) {
            const did = keyToDid(wallet.publicKey, network);
            setDIO(did);
        }
    }, [wallet, network]);

    useEffect(() => {
        const location = window.location.href.match(/\/(did:sol:.*)#?$/);
        if (location) setDIO(location[1]);
    }, [])

    useEffect(loadDID, [did, loadDID]);

    const getKeyFlags = (fragment: string) => getVerificationMethodFlags(did, wallet, fragment, connection)

    const addService = (service: Service) => addServiceToDID(did, wallet, service, connection).then(() => loadDID())

    const removeService = (fragment: string) => removeServiceFromDID(did, wallet, fragment, connection).then(() => loadDID())

    const addKey = (key: AddVerificationMethodParams) => addVerificationMethodToDID(did, wallet, key, connection).then(() => loadDID())

    const removeKey = (fragment: string) => removeVerificationMethodFromDID(did, wallet, fragment, connection).then(() => loadDID())

    const migrateDID = () => migrate(did, wallet, connection)
    const isDIDInitialized = () => isInitialized(did, connection);

    const registerDIDOnKey = () => registerDID(wallet, connection, did).then(() => listRegisteredDIDs(wallet, connection).then(setLinkedDIDs))

    const setKeyOwned = () => setOwned(did, wallet, connection).then(loadDID)

    return (
        <DIDContext.Provider value={{
            did,
            document: document ?? defaultDocument,
            linkedDIDs,
            registerDIDOnKey,
            addKey,
            removeKey,
            getKeyFlags,
            setKeyOwned,
            addService,
            removeService,
            migrateDID,
            isDIDInitialized,
            isLegacyDID,
            accountAddress,
        }}>{children}</DIDContext.Provider>
    )
}

export const useDID = (): DIDContextProps => useContext(DIDContext);