import * as React from 'react';
import {FC, ReactNode, useMemo} from 'react';
import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack, Tooltip,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import {CloseIcon, HamburgerIcon, TriangleUpIcon} from '@chakra-ui/icons';
import {ColorModeSwitcher} from "../ColorModeSwitcher";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {WalletMultiButton} from '@solana/wallet-adapter-react-ui';
import {useDID} from "../hooks/useDID";
import {findPFP} from "../lib/didUtils";
import {NetworkDropdown} from "./NetworkDropdown";
import {SelectedPage} from "../lib/types";

const Links: SelectedPage[] = ['DID', 'Storage'];

const NavLink = ({ children, select }: { children: ReactNode, select: () => void }) => (
    <Link
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('gray.200', 'gray.700'),
        }}
        onClick={select}
        href={'#'}>
        {children}
    </Link>
);

type Props = {
    setNetwork: (network : WalletAdapterNetwork) => void
    network: WalletAdapterNetwork
    setPage: (page : SelectedPage) => void
}

export const Navbar:FC<Props> = ({ setNetwork, setPage, network }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { did, document, migrateDID, isLegacyDID, accountAddress } = useDID();

    const pfp = useMemo(() => {
        if (!did) return "";
        return findPFP(document) || ''
    }, [document])

    return (
        <>
            <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                    <IconButton
                        size={'md'}
                        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                        aria-label={'Open Menu'}
                        display={{ md: 'none' }}
                        onClick={isOpen ? onClose : onOpen}
                    />
                    <HStack spacing={8} alignItems={'center'}>
                        <HStack
                            as={'nav'}
                            spacing={4}
                            display={{ base: 'none', md: 'flex' }}>
                            {Links.map((link) => (
                                <NavLink key={link} select={() => setPage(link)} >{link}</NavLink>
                            ))}
                        </HStack>
                    </HStack>
                    <Flex alignItems={'center'}>
                        { isLegacyDID &&
                            <Tooltip label='Upgrade DID'>
                                <IconButton
                                    size={'md'}
                                    icon={<TriangleUpIcon/>}
                                    aria-label={'Migrate'}
                                    onClick={migrateDID}
                                />
                            </Tooltip> }
                        <ColorModeSwitcher justifySelf="flex-end" />
                        <NetworkDropdown network={network} setNetwork={setNetwork}/>
                        <WalletMultiButton />
                        <Menu>
                            <MenuButton
                                as={Button}
                                rounded={'full'}
                                variant={'link'}
                                cursor={'pointer'}
                                minW={0}>
                                <Avatar
                                    size={'sm'}
                                    src={pfp}
                                />
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => setPage('DID')}>DID</MenuItem>
                                <MenuItem onClick={() => setPage('Storage')}>Storage</MenuItem>
                                <MenuDivider />
                                <MenuItem>
                                    <a href={`https://explorer.identity.com/address/${accountAddress}?cluster=${network}`} target="_blank">
                                        Explorer
                                    </a>
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                </Flex>

                {isOpen ? (
                    <Box pb={4} display={{ md: 'none' }}>
                        <Stack as={'nav'} spacing={4}>
                            {Links.map((link) => (
                                <NavLink key={link} select={() => setPage(link)} >{link}</NavLink>
                            ))}
                        </Stack>
                    </Box>
                ) : null}
            </Box>
        </>
    );
}