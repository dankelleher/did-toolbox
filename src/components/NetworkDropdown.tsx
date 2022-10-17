import { FC } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Select } from "@chakra-ui/react";

type Props = { network: WalletAdapterNetwork, setNetwork: (network: WalletAdapterNetwork) => void };
export const NetworkDropdown: FC<Props> = ({ network, setNetwork }) =>
    <Select value={network} onChange={(event) => setNetwork(event.target.value as WalletAdapterNetwork)}>
        {Object.values(WalletAdapterNetwork).map(n =>
            <option key={n} value={n}>{n}</option>
        )}
    </Select>
