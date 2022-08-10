import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton, Button, Input, Select,
} from '@chakra-ui/react'
import {FC, useMemo, useState} from "react";
import {ServiceEndpoint} from "did-resolver";
import {useDID} from "../hooks/useDID";
import {Service} from "@identity.com/sol-did-client";

type Props = { isOpen: boolean, onClose?: (service: Service) => void };
export const AddService:FC<Props> = ({ isOpen, onClose = () => {} }) => {
    const { did  } = useDID();
    const [serviceEndpoint, setServiceEndpoint] = useState<string>();
    const [type, setType] = useState<string>();
    const [identifier, setIdentifier] = useState<string>();
    const [description, setDescription] = useState<string>();

    const validated = useMemo(() => {
        const errors: { [key: string]: string } = {};
        if (!serviceEndpoint) {
            errors.serviceEndpoint = 'Required';
        }
        if (!type) {
            errors.type = 'Required';
        }
        if (!identifier) {
            errors.identifier = 'Required';
        }
        if (!description) {
            errors.description = 'Required';
        }
        return errors;
    }, [identifier, serviceEndpoint, type, description]);

    const submit = () => {
        const service = {
            fragment:identifier,
            serviceType: type,
            serviceEndpoint,
            description,
        } as Service;
        onClose(service)
    }

    return (
        <Modal isOpen={isOpen} onClose={submit}>
            <ModalOverlay/>
            <ModalContent>
                    <ModalHeader>Add Service</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Input onChange={(event) => setIdentifier(event.target.value)} value={identifier} placeholder='Identifier'/>
                        <Input onChange={(event) => setServiceEndpoint(event.target.value)} value={serviceEndpoint} name='serviceEndpoint' placeholder='Endpoint'/>
                        <Select onChange={(event) => setType(event.target.value)} value={type}  name='type' placeholder='Type'>
                            <option value='PFP'>PFP</option>
                        </Select>
                        <Input onChange={(event) => setDescription(event.target.value)} value={description} name='description' placeholder='Description'/>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} disabled={!validated} onClick={submit}>
                            Add
                        </Button>
                        <Button variant='ghost'>Cancel</Button>
                    </ModalFooter>
            </ModalContent>
        </Modal>
    );
}