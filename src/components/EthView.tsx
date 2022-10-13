import {Badge, Box, Button, Center, Stack, useColorModeValue, VStack,} from '@chakra-ui/react';
import {FC, useCallback, useEffect, useState} from "react";
import {useDID} from '../hooks/useDID';
import {EthereumConnector} from "./EthConnector";
import {useWeb3React} from "@web3-react/core";
import {PublicKey} from "@solana/web3.js";

export const EthView:FC = () => {
    const { document } = useDID();
    const { library, account } = useWeb3React();

    return (
        <>
            <Center py={6}>
                <Stack>
                    <Stack>
                        <EthereumConnector />
                    </Stack>
                    {account &&
                        <Box
                            mt='1'
                            fontWeight='semibold'
                            as='h4'
                            lineHeight='tight'
                            noOfLines={1}
                        >
                            {account}
                        </Box>
                    }
                </Stack>
            </Center>
        </>
    );
}