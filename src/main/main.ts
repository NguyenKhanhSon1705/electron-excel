import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import serve from 'electron-serve';
// @ts-ignore
import htmlToDocx from 'html-to-docx';

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

// Cấu hình serve cho production (chỉ đăng ký protocol một lần duy nhất)
const loadURL = serve({ directory: 'out' });

// ---------------------------------------------------------
// CẤU HÌNH GO CLI
// ---------------------------------------------------------
let currentChild: ReturnType<typeof spawn> | null = null;

const getGoBinPath = () => {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'bin', 'go-cli.exe')
    : path.join(app.getAppPath(), 'bin', 'go-cli.exe');
};

const runGoCommand = (args: string[], event?: Electron.IpcMainInvokeEvent): Promise<string> => {
  return new Promise((resolve, reject) => {
    const binPath = getGoBinPath();
    console.log(`[Go CLI] Executing: ${binPath} ${args.join(' ')}`);

    const child = spawn(binPath, args);
    currentChild = child;
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      const line = data.toString().trim();
      stderr += line;

      // Kiểm tra progress: PROGRESS:XX
      const match = line.match(/PROGRESS:(\d+)/);
      if (match && event) {
        const percent = parseInt(match[1], 10);
        event.sender.send('excel-import-progress', percent);
      }
    });

    child.on('close', (code: number | null) => {
      currentChild = null;
      if (code !== 0) {
        console.error(`[Go CLI] Error (Exit Code ${code}): ${stderr}`);
        reject(stderr || `Process exited with code ${code}`);
        return;
      }
      resolve(stdout.trim());
    });

    child.on('error', (err: Error) => {
      currentChild = null;
      reject(err.message);
    });
  });
};

// IPC Handler: Cancel active Go CLI command
ipcMain.handle('cancel-excel-import', () => {
  if (currentChild) {
    console.log('[Go CLI] Killing active process...');
    currentChild.kill('SIGTERM');
    currentChild = null;
    return true;
  }
  return false;
});

// IPC Handler: Generic Go CLI command
ipcMain.handle('go-cli-cmd', async (event, args: string[]) => {
  try {
    return await runGoCommand(args, event);
  } catch (err) {
    throw err;
  }
});

// IPC Handler: Import Excel file
ipcMain.handle('import-excel', async (event) => {
  try {
    // Mở dialog chọn file
    const result = await dialog.showOpenDialog({
      title: 'Chọn file Excel để import',
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, cancelled: true };
    }

    const filePath = result.filePaths[0];
    console.log(`[Import Excel] File selected: ${filePath}`);

    // Gọi Go CLI để đọc file Excel
    const jsonOutput = await runGoCommand(['import', '--file', filePath], event);
    const parsed = JSON.parse(jsonOutput);

    return parsed;
  } catch (err) {
    console.error(`[Import Excel] Error:`, err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMessage || 'Lỗi không xác định'
    };
  }
});

// IPC Handler: Chọn Word Template
ipcMain.handle('select-word-template', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Chọn file Word (.docx) làm mẫu',
    filters: [{ name: 'Word Documents', extensions: ['docx'] }],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, cancelled: true };
  }

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath);
  return {
    success: true,
    fileName: path.basename(filePath),
    content: content // Trả về Buffer
  };
});

// IPC Handler: Chọn thư mục xuất file
ipcMain.handle('select-export-directory', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Chọn thư mục để lưu các file Word đã điền',
    properties: ['openDirectory', 'createDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, cancelled: true };
  }

  return {
    success: true,
    path: result.filePaths[0]
  };
});

// IPC Handler: Lưu file Word đã trộn
ipcMain.handle('save-merged-file', async (_event, { directory, fileName, content }) => {
  try {
    const fullPath = path.join(directory, fileName);
    fs.writeFileSync(fullPath, Buffer.from(content));
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

// IPC Handler: Chuyển HTML sang Docx (Chạy ở Main process để tránh lỗi fs)
ipcMain.handle('convert-html-to-docx', async (_event, html: string) => {
  try {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; }
            table { border-collapse: collapse; width: 100%; border: 1px solid black; }
            th, td { border: 1px solid black; padding: 5px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const docxBlob = await htmlToDocx(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // In Node.js, html-to-docx returns a Buffer or Uint8Array
    // so we can directly return it or wrap it in Buffer.from
    return Buffer.from(docxBlob);
  } catch (err) {
    console.error('[Main] Convert HTML to Docx error:', err);
    throw err;
  }
});
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
    // win.webContents.openDevTools();
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

app.on('before-quit', () => {
  if (currentChild) {
    console.log('[Main] Killing active Go process before quit...');
    currentChild.kill();
    currentChild = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
