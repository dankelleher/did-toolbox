import {
    Center,
    Flex,
    Image,
    Stack,
    useColorModeValue,
} from '@chakra-ui/react';
import {FC, useCallback, useMemo, useState} from "react";
import { useDID } from '../hooks/useDID';
import ReactJson, {InteractionProps} from "react-json-view";
import {findPFP, isVerificationMethod} from "../lib/didUtils";
import {VerificationMethod, ServiceEndpoint} from "did-resolver";
import {AddService} from "../modal/AddService";
import {ActionButton} from "./ActionButton";
import {Service} from "@identity.com/sol-did-client";

const jsonStyle = {
    backgroundColor: '#fafafa',
}

export const DIDView:FC = () => {
    const { did, document, addService, removeService, removeKey } = useDID();
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

    const pfp = useMemo(() => {
        if (!did) return "";
        return findPFP(document) || '';
    }, [document])

    const triggerDelete = ({existing_value}:InteractionProps) => {
        if (!did || !existing_value || !(typeof existing_value === 'object')) return;

        const entry = existing_value as VerificationMethod | ServiceEndpoint;

        if (isVerificationMethod(entry)) {
            removeKey(entry.id);
        } else {
            removeService(entry.id);
        }
    };

    const triggerAddService = useCallback(async (service: Service) => {
        if (!did) return;
        await addService(service);
    }, [did])

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
                <Flex flex={1} bg="blue.200">
                    <Image
                        objectFit="cover"
                        boxSize="100%"
                        src={pfp}
                    />
                </Flex>
                <Stack
                    flex={1}
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    overflowY="scroll"
                    p={1}
                    pt={2}>
                    <ReactJson src={document} onDelete={triggerDelete} style={jsonStyle} />
                    <ActionButton onClick={() => setIsAddServiceOpen(true)} text={'Add Service'} />
                </Stack>
            </Stack>
            <AddService isOpen={isAddServiceOpen} onClose={(payload) => {
                setIsAddServiceOpen(false);
                triggerAddService(payload);
            }} />
        </Center>
    );
}