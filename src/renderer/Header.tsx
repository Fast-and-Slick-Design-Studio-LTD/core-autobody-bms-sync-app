import { Button, HStack, useColorModeValue, useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IPC_KEY } from "../keys";

const Header = (props: any) => {
    const toast = useToast();
    const onLogout = () => {
        window.electron.ipcRenderer.sendMessage('ipc-send', [IPC_KEY.LOGOUT])
        toast({
            title: 'Authenticate',
            description: "Signed out Successfully",
            status: 'success',
            duration: 2000,
            isClosable: true,
          })
        props.navigate('/');
    }
    return (
        <HStack 
            w={'full'} 
            p={3} 
            gap={5}
            borderBottom={1}
            minH={'60px'}
            py={{ base: 2 }}
            px={{ base: 4 }}
            borderStyle={'solid'}
            borderColor={useColorModeValue('gray.200', 'gray.900')}
            align={'center'}
        >
          <Link to="/ChangeFolder">Change Folder</Link>
          <Link to="/FileHistory">File History</Link>
          <Button onClick={onLogout}>Log out</Button>
        </HStack>
    )
}

export default Header;