import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
} from '@chakra-ui/react'
import * as React from "react";
import { FC, useCallback, useMemo, useState } from "react";
import {
    AddVerificationMethodParams,
    BitwiseVerificationMethodFlag,
    VerificationMethodType
} from "@identity.com/sol-did-client";
import { PublicKey } from "@solana/web3.js";

type Props = { isOpen: boolean, onClose?: (key?: AddVerificationMethodParams) => void };
export const AddKey:FC<Props> = ({ isOpen, onClose = () => {}} ) => {
    const [identifier, setIdentifier] = useState<string>();
    const [key, setKey] = useState<string>();
    const [verificationMethodType, setVerificationMethodType] = useState<VerificationMethodType>(VerificationMethodType.Ed25519VerificationKey2018);


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

    const getBytes = useCallback(() => {
        if (!key) throw new Error("Key is required");

        switch (verificationMethodType) {
            case VerificationMethodType.Ed25519VerificationKey2018:
                return new PublicKey(key).toBytes();
            case VerificationMethodType.EcdsaSecp256k1VerificationKey2019:
            case VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020:
                return Buffer.from(key, 'hex');
        }

        throw new Error("Unsupported verification method type");
    }, [key, verificationMethodType]);

    const submit = useCallback(() => {
        if (!key || !identifier) return;

        const keyData = getBytes();

        const verificationMethod = {
            fragment: identifier,
            methodType: verificationMethodType,
            keyData,
            flags: [BitwiseVerificationMethodFlag.CapabilityInvocation]
        }

        onClose(verificationMethod);
    }, [key, identifier, getBytes, onClose, verificationMethodType]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Add Key</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Input onChange={(event) => setIdentifier(event.target.value)} value={identifier} placeholder='Identifier'/>
                    <Input onChange={(event) => setKey(event.target.value)} value={key} placeholder='Key'/>
                    <Select
                        value={verificationMethodType}
                        onChange={(event => setVerificationMethodType(event.target.value as unknown as VerificationMethodType))}>
                        {Object.values(VerificationMethodType)
                            .filter((v) => !isNaN(Number(v)))
                            .map((type) => <option value={type}>{VerificationMethodType[type as number]}</option>)
                        }
                    </Select>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} disabled={!validated} onClick={submit}>
                        Add
                    </Button>
                    <Button variant='ghost' onClick={() => onClose()}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
