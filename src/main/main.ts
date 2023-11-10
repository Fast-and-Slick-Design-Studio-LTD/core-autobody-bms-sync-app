/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, nativeImage, Tray, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath, setSyncFolder } from './util';
import { CHANNEL, IPC_KEY } from '../keys';
import chokidar from 'chokidar';
import { getFileHistory, onAddNewBMS, onDelBMS, onUpdateBMS } from './bms';
import fs from 'fs';
import schedule from 'node-schedule';
import Store from 'electron-store';

import { loginByPwd, verifyToken } from './auth';
import SqliteDB, { FileLog } from './sqlitedb';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');


let mainWindow: BrowserWindow | null = null;
let watcher: any = null;
let tray: any = null;

// const BMS_FOLDER_TEXT_FILE = path.join(__dirname, 'bmsfolder.txt');
const store = new Store();

ipcMain.on('ipc-send', async (event, arg) => {
  switch(arg[0]) {
    case IPC_KEY.OPEN_FOLDER:
      {
        let dlgs: string[] = setSyncFolder();
        if(dlgs[0]) {
          store.set('bms_folder', dlgs[0]);
          event.reply(CHANNEL.BMS_FOLDER_REPLY, [dlgs[0]]);
          // initialize watcher
          await initializeWatcher(dlgs[0]);
        } else {
          event.reply('ipc-send', IPC_KEY.OPEN_FOLDER_CANCEL);
        }
        break;
      }
    case IPC_KEY.GET_FILE_HISTORY:
      {
        let fileData: any = await getFileHistory();
        event.reply(CHANNEL.FILE_HISTORY_REPLY, fileData)
        break;
      }
    case IPC_KEY.GET_BMS_FOLDER:
      {
        let bmsFolder: any = store.get('bms_folder');
        if (bmsFolder) {
          await initializeWatcher(bmsFolder.toString());
          event.reply(CHANNEL.BMS_FOLDER_REPLY, bmsFolder.toString());
        } else {
          event.reply(CHANNEL.BMS_FOLDER_REPLY, 'Not Set');
        }
        break;
      }
    case IPC_KEY.CHECK_BMS_FOLDER:
      {
        let bmsFolder: any = store.get('bms_folder');
        if (bmsFolder) {
          if (!fs.existsSync(bmsFolder.toString())) {
            mainWindow?.webContents.executeJavaScript('alert("BMS folder has been removed")');
          }
        }
        break;
      }
    case IPC_KEY.LOGIN_REQUEST:
      {
        let response: any = await loginByPwd(arg[1], arg[2]);
        if(response.success) {
          store.set('user_token', response.token);
          event.reply(CHANNEL.LOGIN_REPLY, response)
        } else {
          event.reply(CHANNEL.LOGIN_REPLY, false)
        }
        break;
      }
    case IPC_KEY.VERIFY_TOKEN_REQUEST:
      {
        let token = store.get('user_token');
        if (!token) {
          event.reply(CHANNEL.VERIFY_TOKEN_REPLY, false);
          break;
        }
        let response: any = await verifyToken(token);
        if (response.success) {
          event.reply(CHANNEL.VERIFY_TOKEN_REPLY, true);
        } else {
          event.reply(CHANNEL.VERIFY_TOKEN_REPLY, false);
        }
        break;
      }
    case IPC_KEY.LOGOUT:
      {
        store.delete('user_token');
        event.reply(CHANNEL.LOGOUT_REPLY, true);
      }
    default:
      break;
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const createTray = () => {
  const icon = getAssetPath('icon.png') // required.
  const trayicon = nativeImage.createFromPath(icon)
  tray = new Tray(trayicon.resize({ width: 16 }))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        createWindow();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit() // actually quit the app.
      }
    },
  ])

  tray.setContextMenu(contextMenu)
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};


const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = async () => {
  if (!tray) {
    createTray();
  }
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
  mainWindow.setMenu(null);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // initialize sqlitedb
  SqliteDB.initDB(path.join(__dirname, 'coreauto.db'));

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

// initialize watcher
const initializeWatcher = async (folder: string) => {
  let token = store.get('user_token');
  if (!token) {
    return;
  }
  if (!fs.existsSync(folder)) {
    mainWindow?.webContents.executeJavaScript('alert("BMS folder has been removed")');
    return;
  }
  if (!watcher) {
    // await (watcher as chokidar.FSWatcher).close();
    watcher = chokidar.watch(folder, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });
  
    watcher
      .on('add', (_path: string)=> onAddNewBMS(_path, (fileLog: FileLog) => {
        mainWindow?.webContents.send(CHANNEL.FILE_NEW_HISTORY_REPLY, fileLog)
      }))
      .on('change', (_path: string)=> onUpdateBMS(_path, (fileLog: FileLog) => {
        mainWindow?.webContents.send(CHANNEL.FILE_NEW_HISTORY_REPLY, fileLog)
      }))
      .on('unlink', (_path: string)=> onDelBMS(_path))
      .on('error', (error: string)=> {
        mainWindow?.webContents.send('error', error);
      });
  } else {
    let watched = watcher.getWatched();
    if (!Object.keys(watched).includes(folder)) {
      Object.keys(watched).forEach((watchfolder)=>{
        watcher.unwatch(watchfolder);
      })
      watcher.add(folder);
    }
  }
  
}

// cron job
schedule.scheduleJob('*/5 * * * * *', async ()=> {
  let token = store.get('user_token');
  if (!token) {
    return;
  }
  let bmsFolder: any = store.get('bms_folder');
  if (bmsFolder) {
    if (!fs.existsSync(bmsFolder.toString())) {
      mainWindow?.webContents.executeJavaScript('alert("BMS folder has been removed")');
    }
  }
})

/**
 * Add event listeners...
 */

app.on('window-all-closed', async () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    // app.quit();
    // app.dock.hide();
    mainWindow?.hide();
  } else {
    // app.dock.hide();
    mainWindow?.hide();
  }
});

app.on('before-quit', () => {
  SqliteDB.db.close((err: any) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database connection closed.');
    }
  })
})

  /** Prevent multiple instance running */
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  })

  app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
}
/** End multiple instance running */