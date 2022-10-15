import {Badge, Box, Button, Center, useColorModeValue, VStack,} from '@chakra-ui/react';
import {FC, useCallback, useEffect, useState} from "react";
import {useDID} from '../hooks/useDID';
import {PublicKey} from "@solana/web3.js";
import {VerificationMethod} from "did-resolver";
import { BitwiseVerificationMethodFlag, VerificationMethodType } from "@identity.com/sol-did-client";
import { isAddress } from "@ethersproject/address";
import { useRegistry } from "../hooks/useRegistry";

const KeyEntry:FC<{ verificationMethod: VerificationMethod}> = ({ verificationMethod }) => {
    const { getKeyFlags, registerDIDOnKey, setKeyOwned, did } = useDID();
    const { registry } = useRegistry();
    const [ isOwned, setIsOwned ] = useState(false);
    const [ isRegistered, setIsRegistered ] = useState(false);


    // TODO: This is the reason why it's hard to work on the Did Document directly.
    const fragment = verificationMethod.id.replace(/^.*#/, '')

    const getKeyString = useCallback((): string => {
        switch (verificationMethod.type) {
            case VerificationMethodType[VerificationMethodType.Ed25519VerificationKey2018]:
                return new PublicKey(verificationMethod.publicKeyBase58 || '').toBase58();
            case VerificationMethodType[VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020]:
                if (!isAddress(verificationMethod.ethereumAddress || '')) {
                    return "Invalid Ethereum Address";
                }
                return verificationMethod.ethereumAddress as string;
        }

        return "Unknown Key Format";
    }, [verificationMethod]);

    useEffect(() => {
        const setOwnershipFlag = async () => {
            const flags = await getKeyFlags(fragment);
            if (flags && flags.has(BitwiseVerificationMethodFlag.OwnershipProof)) {
                console.log("setting isOwned to true");
                // the type of this is messed up at the moment, it is mapped to an enum
                // TODO change this when the sol-did-client is fixed
                setIsOwned(true);
            }
        }

        // Check Key against Registry
        const setRegistryStatus = async () => {
            if (registry) {
                if (verificationMethod.type === VerificationMethodType[VerificationMethodType.Ed25519VerificationKey2018]) {
                    // TODO: Bug need to be able to pass current Key (getKeyString()) into here
                    registry.listDIDs().then((dids) => dids.includes(did)).then(setIsRegistered);
                }

                if (verificationMethod.type === VerificationMethodType[VerificationMethodType.EcdsaSecp256k1VerificationKey2019]) {
                    registry.listDIDsForEthAddress(getKeyString()).then((dids) => dids.includes(verificationMethod.controller)).then(setIsRegistered);
                }
            }
        };

        setOwnershipFlag();
        setRegistryStatus();
    }, [verificationMethod, registry, getKeyString, did]);

    const claim = useCallback(() => {
        console.log("claiming ownership");
        (async () => {
            const fragment = verificationMethod.id.replace(/^.*#/, '')
            const verificationMethodType = VerificationMethodType[verificationMethod.type as keyof typeof VerificationMethodType];
            await setKeyOwned(fragment, verificationMethodType);
            // await registerDIDOnKey();
        })();
    }, [registerDIDOnKey, setKeyOwned, verificationMethod]);

    const register = useCallback(() => {
        console.log(`registering key ${getKeyString()} for ${did} in did-registry`);
        // TODO implement

        // (async () => {
        //     const fragment = verificationMethod.id.replace(/^.*#/, '')
        //     const verificationMethodType = VerificationMethodType[verificationMethod.type as keyof typeof VerificationMethodType];
        //     await setKeyOwned(fragment, verificationMethodType);
        //     // await registerDIDOnKey();
        // })();
    }, [getKeyString, did]);

    return <VStack
        borderWidth="1px"
        borderRadius="lg"
        w={{sm: '70%', md: '40vw'}}
        direction={{base: 'row', md: 'row'}}
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={'2xl'}
        padding={4}>
        <Box
            mt='1'
            fontWeight='semibold'
            as='h4'
            lineHeight='tight'
            noOfLines={1}
        >
            {fragment}
        </Box>
        <Box
            mt='1'
            fontWeight='semibold'
            as='h4'
            lineHeight='tight'
            noOfLines={1}
        >
            {getKeyString()}
        </Box>
        <Box>
            {isOwned ?
              <Badge colorScheme='green'>Owned</Badge>
              :
              <Button onClick={claim}>Claim</Button>
            }
            {isRegistered ?
              <Badge colorScheme='green'>Registered</Badge>
              :
              <Button onClick={register}>Register</Button>
            }
        </Box>
    </VStack>
}

export const KeyView:FC = () => {
    const { document } = useDID();

    return (
        <>
            <Center py={6} w={"full"}>
                <VStack
                  padding={8}>
                {document.verificationMethod?.map(
                  verificationMethod => <KeyEntry verificationMethod={verificationMethod}/>
                )}
                </VStack>
            </Center>
        </>
    );
}
