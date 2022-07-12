import {Button, Stack} from "@chakra-ui/react";
import {FC} from "react";

type Props = {
    onClick: () => void,
    text: string,
};
export const ActionButton: FC<Props> = ({ onClick, text}) =>
    <Stack
        width={'100%'}
        mt={'2rem'}
        direction={'row'}
        padding={2}
        justifyContent={'space-between'}
        alignItems={'center'}>
        <Button
            onClick={onClick}
            flex={1}
            fontSize={'sm'}
            rounded={'full'}
            bg={'blue.400'}
            color={'white'}
            boxShadow={
                '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
            }
            _hover={{
                bg: 'blue.500',
            }}
            _focus={{
                bg: 'blue.500',
            }}>
            {text}
        </Button>
    </Stack>
