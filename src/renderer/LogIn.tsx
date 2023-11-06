import { ChangeEvent, useState } from "react";
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
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValue((_prevFormValue)=>{ return {..._prevFormValue, [e.target.name]: e.target.value}});
  }

  const handleSubmit = (event: any) => {
    // event.preventDefault();
    // navigate('ChangeFolder');
    window.electron.ipcRenderer.sendMessage('ipc-example', [IPC_KEY.LOGIN_REQUEST]);
    window.electron.ipcRenderer.on(CHANNEL.LOGIN_REPLY, (res)=>{
      
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