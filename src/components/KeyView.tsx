import { Badge, Box, Button, Center, Flex, useColorModeValue, VStack, } from '@chakra-ui/react';
import {FC, useCallback, useEffect, useState} from "react";
import {useDID} from '../hooks/useDID';
import {PublicKey} from "@solana/web3.js";
import {VerificationMethod} from "did-resolver";
import { BitwiseVerificationMethodFlag, VerificationMethodType } from "@identity.com/sol-did-client";
import { isAddress } from "@ethersproject/address";
import { useRegistry } from "../hooks/useRegistry";
import { useMetaWallet } from "../hooks/useMetaWallet";

const KeyEntry:FC<{ verificationMethod: VerificationMethod}> = ({ verificationMethod }) => {
    const { getKeyFlags, registerDIDOnKey, setKeyOwned, did } = useDID();
    const { isConnected } = useMetaWallet();
    const { getRegisteredDIDsForKey, getRegisteredDIDsForEthAddress, solanaKeyRegistry, ethereumKeyRegistry } = useRegistry();
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
        const setOwnershipFlag = () => {
            getKeyFlags(fragment)
              .then((flags) => flags != undefined && flags.has(BitwiseVerificationMethodFlag.OwnershipProof))
              .then(setIsOwned);
        }

        // Check Key against Registry
        const setRegistryStatus = () => {
            if (verificationMethod.type === VerificationMethodType[VerificationMethodType.Ed25519VerificationKey2018] && verificationMethod.publicKeyBase58) {
                getRegisteredDIDsForKey(new PublicKey(verificationMethod.publicKeyBase58))
                  .then((dids) => {
                      console.log(`Trying to find ${did} in ${dids} (Sol ${verificationMethod.publicKeyBase58})`);
                      return dids.includes(did)
                  }).then(setIsRegistered);
            }

            if (verificationMethod.type === VerificationMethodType[VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020] && verificationMethod.ethereumAddress) {
                getRegisteredDIDsForEthAddress(verificationMethod.ethereumAddress)
                  .then((dids) => {
                      console.log(`Trying to find ${did} in ${dids} (Eth ${verificationMethod.ethereumAddress})`);
                      return dids.includes(did)
                  }).then(setIsRegistered);
            }
        };

        setOwnershipFlag();
        setRegistryStatus();
    }, [verificationMethod, getRegisteredDIDsForKey, getRegisteredDIDsForEthAddress, did, fragment, getKeyFlags]);

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


        // TODO: Only the Button check guarantees that the right wallet is connected.
        if (verificationMethod.type === VerificationMethodType[VerificationMethodType.Ed25519VerificationKey2018]
          && solanaKeyRegistry
          && verificationMethod.publicKeyBase58) {
            solanaKeyRegistry.register(did).then(() => setIsRegistered(true));
        }

        if (verificationMethod.type === VerificationMethodType[VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020]
          && ethereumKeyRegistry
          && verificationMethod.ethereumAddress) {
            console.log(`Getting here!`);
            ethereumKeyRegistry.register(did).then(() => setIsRegistered(true)).catch(console.error);
        }

    }, [getKeyString, did, solanaKeyRegistry, ethereumKeyRegistry, verificationMethod]);



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
        <Flex>
            <Box p={4}>
            {isOwned ?
                <Badge colorScheme='green'>Owned</Badge>
                :
                <Button onClick={claim} disabled={!isConnected(getKeyString())}>Claim</Button>
            }
            </Box>
            <Box p={4}>
            {isRegistered ?
                <Badge colorScheme='green'>Registered</Badge>
                :
                <Button onClick={register} disabled={!isConnected(getKeyString())}>Register</Button>
            }
            </Box>
        </Flex>
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
