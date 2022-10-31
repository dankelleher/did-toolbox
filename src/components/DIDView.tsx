import {
    Box,
    Center,
    Image,
    Stack,
    useColorModeValue,
} from '@chakra-ui/react';
import {FC, useCallback, useMemo, useState} from "react";
import { useDID } from '../hooks/useDID';
import ReactJson, {InteractionProps} from "react-json-view";
import {findPFP, isVerificationMethod} from "../lib/didUtils";
import {VerificationMethod as DIDVerificationMethod, ServiceEndpoint} from "did-resolver";
import {AddService} from "../modal/AddService";
import {ActionButton} from "./ActionButton";
import {AddVerificationMethodParams, Service} from "@identity.com/sol-did-client";
import {AddKey} from "../modal/AddKey";

const jsonStyle = {
    backgroundColor: '#fafafa',
}

export const DIDView:FC = () => {
    const { did, document, addService, removeService, addKey, removeKey } = useDID();
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
    const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);

    const pfp = useMemo(() => {
        if (!did) return "";
        return findPFP(document) || '';
    }, [document, did])

    const triggerDelete = ({existing_value}:InteractionProps) => {
        if (!did || !existing_value || !(typeof existing_value === 'object')) return;

        const entry = existing_value as DIDVerificationMethod | ServiceEndpoint;

        if (isVerificationMethod(entry)) {
            removeKey(entry.id);
        } else {
            removeService(entry.id);
        }
    };

    const triggerAddService = useCallback(async (service: Service) => {
        if (!did) return;
        await addService(service);
    }, [did, addService])

    const triggerAddKey = useCallback(async (key: AddVerificationMethodParams) => {
        if (!did) return;
        await addKey(key);
    }, [did, addKey])

    return (
        <Center py={6}>
            <Stack
                borderWidth="1px"
                borderRadius="lg"
                w={{sm: '100%', md: '80vw'}}
                height={{sm: '80vh'}}
                direction={{base: 'column', md: 'row'}}
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'2xl'}
                padding={4}>
                <Stack flex={1} bg="blue.200">
                    {pfp ? <Image
                        objectFit="scale-down"
                        boxSize="100%"
                        src={pfp}
                    /> : <Box>No PFP</Box>
                    }
                </Stack>
                <Stack
                    flex={2}
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    overflowY="scroll"
                    p={1}
                    pt={2}>
                    <Stack overflowY="scroll" height="100%" width="100%">
                        <ReactJson src={document} onDelete={triggerDelete} style={jsonStyle} />
                    </Stack>
                    <ActionButton onClick={() => setIsAddServiceOpen(true)} text={'Add Service'} />
                    <ActionButton onClick={() => setIsAddKeyOpen(true)} text={'Add Key'} />
                </Stack>
            </Stack>
            <AddService isOpen={isAddServiceOpen} onClose={(payload) => {
                setIsAddServiceOpen(false);
                triggerAddService(payload);
            }} />
            <AddKey isOpen={isAddKeyOpen} onClose={(payload) => {
                setIsAddKeyOpen(false);
                payload && triggerAddKey(payload);
            }} />
        </Center>
    );
}
