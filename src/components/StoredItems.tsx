import {useDID} from "../hooks/useDID";
import {FC, useMemo} from "react";
import {StoredItem} from "./StoredItem";
import {Center} from "@chakra-ui/react";

export const StoredItems: FC = () => {
    const { document } = useDID();

    const storageServices = useMemo(() => {
        if (!document) return [];
        return (document?.service || []).filter(service => service.type === 'store');
    }, [document]);

    return (
        <Center py={6}>
            {storageServices.map(service => <StoredItem service={service}/>)}

        </Center>
    )
}