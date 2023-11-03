// eslint-disable-next-line prettier/prettier
import {
  app,
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import { setSyncFolder } from './util';
import { IPC_KEY } from '../keys';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenus: DarwinMenuItemConstructorOptions[] = [
      {
        label: 'Change Folder',
        selector: 'Command+Shift+O',
        click: () => {
          this.changeFolder();
        },
      },
      {
        label: 'File History',
        selector: 'Command+Shift+F',
        click: () => {
          this.showFileHistory();
        },
      },
      {
        label: 'Log out',
        selector: 'Command+Shift+L',
        click: () => {
          this.logOut();
        },
      },
      {
        label: 'Exit',
        selector: 'Command+Shift+X',
        click: () => {
          app.quit();
        },
      },
    ];

    return subMenus;
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&Change Folder',
        accelerator: 'Ctrl+O',
        click: () => {
          this.changeFolder();
        },
      },
      {
        label: '&File History',
        accelerator: 'Ctrl+F',
        click: () => {
          this.showFileHistory();
        },
      },
      {
        label: '&Log out',
        accelerator: 'Ctrl+L',
        click: () => {
          this.logOut();
        },
      },
      {
        label: '&Exit',
        accelerator: 'Ctrl+X',
        click: () => {
            this.mainWindow.close();
        },
      },
    ];

    return templateDefault;
  }

  // change folder dialog
  // eslint-disable-next-line class-methods-use-this
  changeFolder() {
    setSyncFolder();
  }

  // eslint-disable-next-line class-methods-use-this
  showFileHistory() {}

  // eslint-disable-next-line class-methods-use-this
  logOut() {
    this.mainWindow.webContents.send('ipc-example', [IPC_KEY.LOGOUT])
  }
}
