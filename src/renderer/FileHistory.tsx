import { Box, Container, Heading, Skeleton, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useEffect, useMemo, useState } from "react";
import { CHANNEL, IPC_KEY } from "../keys";
import dayjs from 'dayjs';
import { createColumnHelper } from "@tanstack/react-table";
import { FileLog } from "../main/sqlitedb";
import { DataTable } from "./components/DataTable";

const FileHistory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    window.electron.ipcRenderer.sendMessage('ipc-send', [IPC_KEY.GET_FILE_HISTORY]);
    const timer = setInterval(()=>{
      window.electron.ipcRenderer.sendMessage('ipc-send', [IPC_KEY.GET_FILE_HISTORY]);
    }, 3000)
    window.electron.ipcRenderer.on(CHANNEL.FILE_HISTORY_REPLY, (_items: any) => {
      setItems(_items.sort((a: any, b:any)=>{
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }));
      setLoading(false);
    });
    // File adding or updating listener
    // window.electron.ipcRenderer.on(CHANNEL.FILE_NEW_HISTORY_REPLY, (item: any) => {
    //   console.log('======== prevItems ==========', items);
    //   items.unshift(item);
    //   setItems(items);
    // })
    return ()=>{
      clearInterval(timer);
    }
  }, []);

  const columnHelper = createColumnHelper<FileLog>();

  const columns = useMemo(()=>[
    columnHelper.display({
      cell: ({ table, row: {index} }) => index + 1,
      header: "No"
    }),
    columnHelper.accessor("file_path", {
      cell: (info) => info.getValue(),
      header: "File"
    }),
    columnHelper.accessor("size", {
      cell: (info) => info.getValue(),
      header: "Size",
      meta: {
        isNumeric: true
      }
    }),
    columnHelper.accessor("isUpdated", {
      cell: (info) => info.getValue() == 'true' ? 'Update' : 'Add',
      header: "Action"
    }),
    columnHelper.accessor("created_at", {
      cell: (info) => dayjs(new Date(info.getValue())).format('YYYY-MM-DD HH:mm:ssZ[Z]'),
      header: "Date/Time"
    })
  ], []);

  return (
    <>
      <Header navigate={navigate} />
      <Box p={3}>
        <Text fontSize={"md"} fontWeight={'bold'} p={3}>File History</Text>
        {
          loading ? 
          <Stack>
            {
              [1,2,3,4,5,6,7,8,9,10].map((val: number)=>(
                <Skeleton key={val} height='20px' />
              ))
            }
          </Stack>
          :
          <TableContainer>
            <DataTable data={items} columns={columns} />
          </TableContainer>
        }
      </Box>
    </>
  );
}

export default FileHistory;