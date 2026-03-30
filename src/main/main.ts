import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { execFile } from 'child_process';
import serve from 'electron-serve';

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Cấu hình serve cho production
if (app.isPackaged) {
  serve({ directory: 'out' });
}

const loadURL = serve({ directory: 'out' });
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

// ---------------------------------------------------------
// CẤU HÌNH GO CLI
// ---------------------------------------------------------
// const getGoBinPath = () => {
//   return app.isPackaged
//     ? path.join(process.resourcesPath, 'bin', 'go-cli.exe')
//     : path.join(app.getAppPath(), 'bin', 'go-cli.exe');
// };

// const runGoCommand = (args: string[]): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const binPath = getGoBinPath();
//     console.log(`Executing Go command: ${binPath} ${args.join(' ')}`);

//     execFile(binPath, args, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Go CLI Error: ${error.message}`);
//         reject(stderr || error.message);
//         return;
//       }
//       resolve(stdout.trim());
//     });
//   });
// };

// // Đăng ký IPC Handler (Chuẩn Promise)
// ipcMain.handle('go-cli-cmd', async (_event, args: string[]) => {
//   try {
//     return await runGoCommand(args);
//   } catch (err) {
//     throw err;
//   }
// });
// ---------------------------------------------------------

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    require('electron-reload')(__dirname);
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // Load bằng protocol app:// thay vì file://
    await loadURL(win);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('Quitting app');
    app.quit();
  }
});
