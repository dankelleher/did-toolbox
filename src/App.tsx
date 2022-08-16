import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {useState} from "react";

import {Navbar} from "./components/Navbar";
import {SolanaWalletProvider} from "./components/SolanaWalletProvider";
import {DIDProvider} from "./hooks/useDID";
import {Page} from "./Page";
import {SelectedPage} from "./lib/types";

import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

export const App = () => {
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);
    const [page, setPage] = useState<SelectedPage>('DID')

  return (
      <ChakraProvider theme={theme}>
        <SolanaWalletProvider network={network}>
          <DIDProvider network={network}>
            <Navbar setNetwork={setNetwork} network={network} setPage={setPage}/>
            <Page selectedPage={page}/>
          </DIDProvider>
        </SolanaWalletProvider>
      </ChakraProvider>
  );
}
