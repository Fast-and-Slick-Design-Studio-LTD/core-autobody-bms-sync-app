import { Button, Container, Heading, Text } from "@chakra-ui/react";
import { IPC_KEY } from "../keys";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const ChangeFolder = () => {
  const navigate = useNavigate();
  const openFolder = ()=>{
    window.electron.ipcRenderer.sendMessage('ipc-example', [IPC_KEY.OPEN_FOLDER])
  }
  return (
    <>
    <Header navigate={navigate} />
    <Container paddingTop={'10%'}>
      <Text fontSize={"md"} fontWeight={'bold'} mb={3}>Choose Sync Folder</Text>
      <Button onClick={openFolder}>Open..</Button>
    </Container>
    </>
  );
}

export default ChangeFolder;