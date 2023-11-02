import { Button, Container, Heading, Text } from "@chakra-ui/react";
import { CHANNEL, IPC_KEY } from "../keys";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ChangeFolder = () => {
  const navigate = useNavigate();
  const [folder, setFolder] = useState('');

  const openFolder = ()=>{
    window.electron.ipcRenderer.sendMessage('ipc-example', [IPC_KEY.OPEN_FOLDER])
  }

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('ipc-example', [IPC_KEY.GET_BMS_FOLDER]);
    window.electron.ipcRenderer.on(CHANNEL.BMS_FOLDER_REPLY, (folder: any)=>{
      setFolder(folder);
    })
  }, [])

  return (
    <>
    <Header navigate={navigate} />
    <Container paddingTop={'10%'}>
      <Text fontSize={"sm"} fontWeight={'bold'} mb={3}>Current Folder: {folder}</Text>
      <Button onClick={openFolder}>Choose Sync Folder</Button>
    </Container>
    </>
  );
}

export default ChangeFolder;