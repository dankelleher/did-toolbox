import {FC} from "react";
import {ServiceEndpoint} from "did-resolver";
import {Badge, Box, useColorModeValue, VStack, Image} from "@chakra-ui/react";

const cidPathToUrl = (cidPath: string) => cidToUrl(cidPath.replace(/^ipfs:\/\//, ''));
const cidToUrl = (cid: string) => `https://ipfs.infura.io/ipfs/${cid}`;

type Props = {
    service: ServiceEndpoint,
}
export const StoredItem:FC<Props> = ({ service}) =>
    (
        <VStack
            borderWidth="1px"
            borderRadius="lg"
            w={{sm: '70%', md: '40vw'}}
            height={{sm: '50vh'}}
            direction={{base: 'row', md: 'row'}}
            bg={useColorModeValue('white', 'gray.900')}
            boxShadow={'2xl'}
            padding={4}>
            <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                <Image src={cidPathToUrl(service.serviceEndpoint)} alt={service.description} />

                <Box p='6'>
                    <Box display='flex' alignItems='baseline'>
                        <Box
                            color='gray.500'
                            fontWeight='semibold'
                            letterSpacing='wide'
                            fontSize='xs'
                            textTransform='uppercase'
                            ml='2'
                        >
                            {service.description}
                        </Box>
                    </Box>

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
            </Box>
        </VStack>
    )