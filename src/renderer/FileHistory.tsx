import { Box, Container, Heading, Skeleton, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useEffect, useState } from "react";
import { CHANNEL, IPC_KEY } from "../keys";

const FileHistory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(()=>{
    window.electron.ipcRenderer.sendMessage('ipc-example', [IPC_KEY.GET_FILE_HISTORY]);
    window.electron.ipcRenderer.on(CHANNEL.FILE_HISTORY_REPLY, (_items: any) => {
      setItems(_items[0]);
      setLoading(false);
    })
  }, []);

  return (
    <>
      <Header navigate={navigate} />
      <Box p={3}>
        <Text fontSize={"md"} fontWeight={'bold'} p={3}>File History</Text>
        {
          loading ? 
          <Stack>
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
          </Stack>
          :
          <TableContainer>
            <Table variant='simple'>
              <TableCaption>File add/update logs</TableCaption>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>File</Th>
                  <Th>Size</Th>
                  <Th>Date/Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  items.map((item: any, key)=>(
                    <Tr key={key}>
                      <Td>{key + 1}</Td>
                      <Td>{ item.files?.file ? item.files?.file?.filename : 'None'}</Td>
                      <Td>{ item.files?.file ? item.files?.file?.size + ' Byte' : ''}</Td>
                      <Td>{item.created_at}</Td>
                    </Tr>
                  ))
                }
              </Tbody>
            </Table>
          </TableContainer>
        }
      </Box>
    </>
  );
}

export default FileHistory;