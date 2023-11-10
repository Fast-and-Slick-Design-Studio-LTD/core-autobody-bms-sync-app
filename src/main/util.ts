/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { dialog } from 'electron';
import Fs from 'fs/promises'

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}


export function setSyncFolder() {
  const dlg: string[] = dialog.showOpenDialogSync({ properties: ['openDirectory'] }) ?? [];
  return dlg;
}

export async function getFileSize(filePath: string) {
  const stats = await Fs.stat(filePath);
  return stats.size
}