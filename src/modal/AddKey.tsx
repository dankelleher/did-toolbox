import {
    Button, Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from '@chakra-ui/react'
import * as React from "react";
import {FC, useCallback, useMemo, useState} from "react";
import {VerificationMethod, VerificationMethodType} from "@identity.com/sol-did-client";
import {VerificationMethodFlags} from "@identity.com/sol-did-client/dist/src/lib/types";
import {PublicKey} from "@solana/web3.js";

type Props = { isOpen: boolean, onClose?: (key: VerificationMethod) => void };
export const AddKey:FC<Props> = ({ isOpen, onClose = () => {} }) => {
    const [identifier, setIdentifier] = useState<string>();
    const [key, setKey] = useState<string>();

    const validated = useMemo(() => {
        const errors: { [key: string]: string } = {};

        if (!key) {
            errors.key = 'Required';
        }

        if (!identifier) {
            errors.identifier = 'Required';
        }

        try {
            key && new PublicKey(key);
        } catch (e) {
            errors.key = 'Required';
        }

        return errors;
    }, [key, identifier]);

    const submit = useCallback(() => {
        if (!key || !identifier) return;

        const verificationMethod = {
            fragment: identifier,
            methodType: VerificationMethodType.Ed25519VerificationKey2018,
            keyData: new PublicKey(key).toBytes(),
            flags: VerificationMethodFlags.CapabilityInvocation
        }

        onClose(verificationMethod);
    }, [key, identifier]);

    return (
        <Modal isOpen={isOpen} onClose={submit}>
            <ModalOverlay/>
            <ModalContent>
                    <ModalHeader>Add Key</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Input onChange={(event) => setIdentifier(event.target.value)} value={identifier} placeholder='Identifier'/>
                        <Input onChange={(event) => setKey(event.target.value)} value={key} placeholder='Key'/>
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