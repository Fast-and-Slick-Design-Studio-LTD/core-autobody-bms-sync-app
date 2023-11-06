import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Container,
  Heading,
  Input,
  Button,
  VStack,
  Flex
} from '@chakra-ui/react'
import { CHANNEL, IPC_KEY } from "../keys";
import { useToast } from '@chakra-ui/react'

interface FormProps {
  email: string;
  password: string;
}

const defaultFormVals = {
  email: '',
  password: ''
}

const Login : React.FC = (props) => {
  const [formValue, setFormValue] = useState<FormProps>(defaultFormVals);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(()=>{
    window.electron.ipcRenderer.sendMessage('ipc-send', [IPC_KEY.VERIFY_TOKEN_REQUEST]);
    window.electron.ipcRenderer.once(CHANNEL.VERIFY_TOKEN_REPLY, (res: any)=>{
      setVerifying(false);
      if (res) {
        navigate('ChangeFolder');
      }
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValue((_prevFormValue)=>{ return {..._prevFormValue, [e.target.name]: e.target.value}});
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setIsLoading(true);
    window.electron.ipcRenderer.sendMessage('ipc-send', [IPC_KEY.LOGIN_REQUEST, event.target.email.value, event.target.password.value]);
    window.electron.ipcRenderer.once(CHANNEL.LOGIN_REPLY, (res: any)=>{
      setIsLoading(false);
      if (!res) {
        toast({
          title: 'Authenticate',
          description: "Login Failed",
          status: 'error',
          duration: 2000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Authenticate',
          description: res.message,
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
        navigate('ChangeFolder');
      }
    });
    return false;
  }

  return (
    <Flex justifyContent={'center'} alignItems={'center'} height={'100vh'}>
      <Container>
        <Heading mb={3}>LOG IN</Heading>
        <form onSubmit={handleSubmit}>
        <VStack gap={3}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input 
              type='email'
              value={formValue.email}
              name="email"
              onChange={(e)=>handleChange(e)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input 
              type='password'
              value={formValue.password}
              name="password"
              onChange={(e)=>handleChange(e)}
            />
          </FormControl>
          <FormControl>
              <Button
                mt={4}
                colorScheme='teal'
                type='submit'
                isLoading={verifying || isLoading}
                loadingText={verifying ? 'Verifying' : 'Submitting'}
              >
                Submit
              </Button>
          </FormControl>
        </VStack> 
        </form>
      </Container>
    </Flex>
  );
}

export default Login;