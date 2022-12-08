import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {clusterApiUrl} from "@solana/web3.js";
import {FC, ReactNode, useMemo} from "react";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter} from "@solana-mobile/wallet-adapter-mobile";
import {endpointFromEnv} from "../lib/cryptoUtils";

export const SolanaWalletProvider: FC<{ children: ReactNode, network: WalletAdapterNetwork }> = ({ children, network }) => {
    const endpoint = useMemo(() => endpointFromEnv(network) || clusterApiUrl(network), [network]);
    console.log('network', network, 'endpoint', endpoint)

    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                appIdentity: { name: 'DID Toolbox' },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
            }),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};