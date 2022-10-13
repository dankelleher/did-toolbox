import * as React from "react"
import {
    ChakraProvider,
    theme,
} from "@chakra-ui/react"
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {useState} from "react";
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import {Navbar} from "./components/Navbar";
import {SolanaWalletProvider} from "./components/SolanaWalletProvider";
import {DIDProvider} from "./hooks/useDID";
import {Page} from "./Page";
import {SelectedPage} from "./lib/types";

import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const getLibrary = (provider: any) => new Web3Provider(provider);

export const App = () => {
    const [network, setNetwork] = useState(WalletAdapterNetwork.Mainnet);
    const [page, setPage] = useState<SelectedPage>('DID')

    return (
        <ChakraProvider theme={theme}>
            <SolanaWalletProvider network={network}>
                <Web3ReactProvider getLibrary={getLibrary}>
                    <DIDProvider network={network}>
                        <Navbar setNetwork={setNetwork} network={network} setPage={setPage}/>
                        <Page selectedPage={page}/>
                    </DIDProvider>
                </Web3ReactProvider>
            </SolanaWalletProvider>
        </ChakraProvider>
    );
}
