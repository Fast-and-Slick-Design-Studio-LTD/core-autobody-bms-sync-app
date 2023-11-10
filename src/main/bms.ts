import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import SqliteDB, { FileLog } from './sqlitedb';
import hasha from 'hasha';
import { getFileSize } from './util';

const apiUploadUrl = "https://webhook.site/72b49f57-e259-4dbf-a07c-212230f9097b";
const apiEndpointUrl = 'https://webhook.site/token/72b49f57-e259-4dbf-a07c-212230f9097b/requests';

export async function onAddNewBMS(path: string, callBack: Function) {
  const hash = hasha.fromFileSync(path);
  const size = await getFileSize(path);
  let fileLog: FileLog = {
    file_path: path,
    file_hash: hash,
    created_at: new Date().getTime(),
    isUpdated: 'false',
    size: size
  }
  const oldFiles: any[] = await SqliteDB.findFile(fileLog);
  if (oldFiles.length != 0) {
    return;
  }

  // uploading file
  const fileStream = fs.createReadStream(path)
  const formData = new FormData();
  formData.append('file', fileStream);
  axios.post(apiUploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  .then((response) => {
    console.log('File uploaded successfully', response.data);
    SqliteDB.addFileLog(fileLog).then((err: any)=> {
      if (!err) {
        console.log('addFileLog succeed');
        callBack(fileLog);
      } else {
        console.log(err.message);
      }
    })
  })
  .catch((error) => {
    console.error('Error uploading file', error);
  });
}

export async function onUpdateBMS(path: string, callBack: Function) {
  const hash = hasha.fromFileSync(path);
  const size = await getFileSize(path);
  let fileLog: FileLog = {
    file_path: path,
    file_hash: hash,
    created_at: new Date().getTime(),
    isUpdated: 'true',
    size: size
  }
  const oldFiles: any[] = await SqliteDB.findFile(fileLog);
  if (oldFiles.length != 0) {
    console.log('Already synced');
    return;
  }
  const fileStream = fs.createReadStream(path)
  const formData = new FormData();
  formData.append('file', fileStream);
  formData.append('isUpdate', 'true');
    
  axios.post(apiUploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  .then((response) => {
    console.log('File uploaded successfully', response.data);
    SqliteDB.addFileLog(fileLog).then((err: any)=> {
      if (!err) {
        console.log('addFileLog succeed on update');
        callBack(fileLog);
      } else {
        console.log(err.message);
      }
    })
  })
  .catch((error) => {
    console.error('Error uploading file', error);
  });
}

export function onDelBMS(path: string) {
    console.log(`onDelBMS ------- ${path}`);
}

export async function getFileHistory() {
    return await SqliteDB.getFileLogs();
}