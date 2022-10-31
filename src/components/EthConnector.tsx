import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { InjectedConnector } from '@web3-react/injected-connector';
import {Button, Stack} from "@chakra-ui/react";

export const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42]
});

export const EthereumConnector: React.FC = () => {
    const { active, activate, deactivate } = useWeb3React();

    const connect = useCallback(
        () => activate(injected).catch(console.error),
        [activate]
    );

    const disconnect = deactivate

    return (
        <Stack>
            {active ? (
                <Button onClick={disconnect}>Disconnect Ethereum</Button>
            ) : (
                <Button onClick={connect}>Connect Ethereum</Button>
            )}
        </Stack>
    );
};