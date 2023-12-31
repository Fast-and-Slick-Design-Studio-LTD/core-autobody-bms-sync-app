import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import hasha from 'hasha';
import SqliteDB, { FileLog } from './sqlitedb';
import { getFileSize } from './util';

// const apiUploadUrl = "https://webhook.site/72b49f57-e259-4dbf-a07c-212230f9097b";
const apiUploadUrl =
  'https://core-autobody-7fa82fc0a053.herokuapp.com/api/bms/upload';
// const apiUploadUrl = "http://localhost:3000/api/bms/upload"; // for local test

export async function onAddNewBMS(path: string, callBack: Function) {
  const hash = hasha.fromFileSync(path);
  const size = await getFileSize(path);
  const fileLog: FileLog = {
    file_path: path,
    file_hash: hash,
    created_at: new Date().getTime(),
    isUpdated: 'false',
    size: size,
  };
  const oldFiles: any[] = await SqliteDB.findFile(fileLog);
  if (oldFiles.length !== 0) {
    return;
  }

  // uploading file
  const fileStream = fs.createReadStream(path);
  const formData = new FormData();
  formData.append('file', fileStream);
  axios
    .post(apiUploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      return SqliteDB.addFileLog(fileLog).then((err: any) => {
        if (!err) {
          callBack(fileLog);
        }
      });
    })
    .catch((error) => {
      console.error('Error uploading file', error);
    });
}

export async function onUpdateBMS(path: string, callBack: Function) {
  const hash = hasha.fromFileSync(path);
  const size = await getFileSize(path);
  const fileLog: FileLog = {
    file_path: path,
    file_hash: hash,
    created_at: new Date().getTime(),
    isUpdated: 'true',
    size: size,
  };
  const oldFiles: any[] = await SqliteDB.findFile(fileLog);
  if (oldFiles.length !== 0) {
    return;
  }
  const fileStream = fs.createReadStream(path);
  const formData = new FormData();
  formData.append('file', fileStream);
  formData.append('isUpdate', 'true');

  axios
    .post(apiUploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      return SqliteDB.addFileLog(fileLog).then((err: any) => {
        if (!err) {
          callBack(fileLog);
        }
      });
    })
    .catch((error) => {
      console.error('Error uploading file', error);
    });
}

export function onDelBMS(path: string) {
  console.log(`onDelBMS ------- ${path}`);
}

export async function getFileHistory() {
  return SqliteDB.getFileLogs();
}
