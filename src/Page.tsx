import {useDID} from "./hooks/useDID";
import {DIDView} from "./components/DIDView";
import {FC} from "react";
import {StorageView} from "./components/StorageView";
import {SelectedPage} from "./lib/types";
import {KeyView} from "./components/KeyView";
import {EthView} from "./components/EthView";

type Props = { selectedPage: SelectedPage };
export const Page:FC<Props> = ({selectedPage}) => {
    const { did } = useDID()

    if (!did) return <></>;
    if (selectedPage === 'DID') return <DIDView />
    if (selectedPage === 'Storage') return <StorageView />
    if (selectedPage === 'Keys') return <KeyView />
    if (selectedPage === 'Ethereum') return <EthView />

    return <></>;

}