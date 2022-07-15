import {FC} from "react";
import {ServiceEndpoint} from "did-resolver";
import {LinkBox, Box, useColorModeValue, VStack, Image, LinkOverlay} from "@chakra-ui/react";
import encrypted from '../assets/encrypted.png';

type Props = {
    service: ServiceEndpoint,
    retrieve: (cid: string) => Promise<void>,
}
export const StoredItem:FC<Props> = ({ service, retrieve }) =>
    (
        <VStack
            borderWidth="1px"
            borderRadius="lg"
            w={{sm: '70%', md: '40vw'}}
            direction={{base: 'row', md: 'row'}}
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow={'2xl'}
            padding={4}>
            <LinkBox
                maxW='sm'
                borderWidth='1px'
                borderRadius='lg'
                overflow='hidden'
                onClick={() => retrieve(service.serviceEndpoint)}
            >
                <LinkOverlay href='#'>
                    <Box p='6'>
                        <Image src={encrypted} alt={service.description}/>
                        <Box
                            mt='1'
                            fontWeight='semibold'
                            as='h4'
                            lineHeight='tight'
                            noOfLines={1}
                        >
                            {service.description}
                        </Box>
                    </Box>
                </LinkOverlay>
            </LinkBox>
        </VStack>
    )