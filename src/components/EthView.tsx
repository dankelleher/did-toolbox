import {Box, Button, Center, Stack, Textarea } from '@chakra-ui/react';
import {FC, useCallback, useState} from "react";
import {useDID} from '../hooks/useDID';
import {EthereumConnector} from "./EthConnector";
import {useWeb3React} from "@web3-react/core";

export const EthView:FC = () => {
    const { document } = useDID();
    const { library, account } = useWeb3React();
    const [ message, setMessage ] = useState<string>();
    const [ signature, setSignature ] = useState<string>();

    const sign = useCallback(() => {
        library?.getSigner().signMessage(message).then(setSignature)
    }, [library, message]);

    return (
        <>
            <Center py={6}>
                <Stack>
                    <Stack>
                        <EthereumConnector />
                    </Stack>
                    {account &&
                        <Stack>
                        <Box
                            mt='1'
                            fontWeight='semibold'
                            as='h4'
                            lineHeight='tight'
                            noOfLines={1}
                        >
                            {account}
                        </Box>
                            <Textarea value={message} placeholder="Message to sign" onChange={(e) => setMessage(e.target.value)} />
                            <Textarea value={signature} placeholder="Signature"/>
                            <Button onClick={sign}>Sign</Button>
                        </Stack>
                    }
                </Stack>
            </Center>
        </>
    );
}