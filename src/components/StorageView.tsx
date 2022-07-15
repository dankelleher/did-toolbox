import {
    Box,
    Center, Progress, Input, useColorModeValue, VStack,
} from '@chakra-ui/react';
import {FC, useCallback, useEffect, useMemo, useState} from "react";
import { useDID } from '../hooks/useDID';
import {ServiceEndpoint} from "did-resolver";
import {useDropzone} from "react-dropzone";
import {ActionButton} from "./ActionButton";
import {StoredItems} from "./StoredItems";
import {useWallet} from "@solana/wallet-adapter-react";
import {store} from "../lib/storageUtils";
import {MessageSignerWalletAdapter} from "@solana/wallet-adapter-base";

const baseStyle = {
    // flex: 1,
    // display: 'flex',
    // flexDirection: 'column' as const,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box' as const
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};

type EnhancedFile = File & { preview: string }
export const StorageView:FC = () => {
    const wallet = useWallet();
    const { did, addService } = useDID();
    const [ loading, setLoading ] = useState(false);
    const [ progress, setProgress ] = useState(0);
    const [files, setFiles] = useState<EnhancedFile[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }, [])

    const {getRootProps, getInputProps, isDragActive, isFocused,
        isDragAccept,
        isDragReject
    } = useDropzone({onDrop})

    const triggerAddFile = useCallback(async () => {
        if (!did || !files || files.length === 0) return;

        try {
            setLoading(true)
            const cid = await store(files[0], did, wallet as unknown as MessageSignerWalletAdapter, setProgress);
            const identifier = files[0].name.replaceAll(/[^a-zA-Z0-9]+/g,'');  // TODO sanitise better
            const service = {
                id: `${did}#${identifier}`,
                type: 'store',
                serviceEndpoint: 'ipfs://' + cid,
                description: files[0].name,
            } as ServiceEndpoint;
            await addService(service);
        } finally {
            setLoading(false)
        }
    }, [did, files, addService, wallet])

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    const thumbs = files.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                    // Revoke data uri after image is loaded
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                />
            </div>
        </div>
    ));

    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    useEffect(() => () => files.forEach(file => URL.revokeObjectURL(file.preview)), [files]);

    return (
        <>
            <StoredItems />
            <Center py={6}>
                <VStack
                    borderWidth="1px"
                    borderRadius="lg"
                    w={{sm: '70%', md: '40vw'}}
                    height={{sm: '50vh'}}
                    direction={{base: 'row', md: 'row'}}
                    bg={useColorModeValue('white', 'gray.900')}
                    boxShadow={'2xl'}
                    padding={4}>
                    <div {...getRootProps({style})}>
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <p>Drop the files here ...</p> :
                                <p>Drag 'n' drop some files here, or click to select files</p>
                        }
                    </div>
                    <Box>{thumbs}</Box>
                    <ActionButton onClick={() => triggerAddFile()} text={'Add Service'} />
                    { loading && <Progress value={progress} />}
                </VStack>
            </Center>
        </>
    );
}