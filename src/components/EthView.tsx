import {Avatar, Box, Button, Center, Stack, Textarea} from '@chakra-ui/react';
import {FC, useCallback, useState} from "react";
import {EthereumConnector} from "./EthConnector";
import {useWeb3React} from "@web3-react/core";
import {useProfile} from "../hooks/useProfile";
import {useRegistry} from "../hooks/useRegistry";

const RegisteredDIDs:FC = () => {
    const { registeredEthereumDIDs } = useRegistry();

    return <ul>
        {registeredEthereumDIDs.map((did) => <li>{did}</li>)}
    </ul>
}

const EthProfile:FC = () => {
    const profile = useProfile();

    if (!profile) {
        return <Center>
            No profile
        </Center>
    }

    return <Stack flex={1}>
        <Center>
            {profile.image?.url ? <Avatar
                size="lg"
                src={profile.image?.url}
            /> : <Box>No PFP</Box>
            }
            <Box>{profile.name?.value}</Box>
        </Center>
    </Stack>
}

export const EthView:FC = () => {
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
                    <EthProfile />
                    <RegisteredDIDs />
                </Stack>
            </Center>
        </>
    );
}