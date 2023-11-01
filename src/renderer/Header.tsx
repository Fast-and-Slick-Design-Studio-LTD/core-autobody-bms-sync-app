import { Button, HStack, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Header = (props: any) => {
    const onLogout = () => {
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