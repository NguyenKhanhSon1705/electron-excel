import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Generic Go CLI command
  invokeGoCli: (args: string[]) => ipcRenderer.invoke('go-cli-cmd', args),

  // Import Excel: mở dialog chọn file → Go xử lý → trả JSON data
  importExcel: () => ipcRenderer.invoke('import-excel'),

  // Generic IPC
  send: (channel: string, data: unknown) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args));
  },
  cancelExcelImport: () => ipcRenderer.invoke('cancel-excel-import'),
  selectWordTemplate: () => ipcRenderer.invoke('select-word-template'),
  selectExportDirectory: () => ipcRenderer.invoke('select-export-directory'),
  saveMergedFile: (args: { directory: string; fileName: string; content: Uint8Array }) => 
    ipcRenderer.invoke('save-merged-file', args),
  convertHtmlToDocx: (html: string) => ipcRenderer.invoke('convert-html-to-docx', html),
  onExcelImportProgress: (callback: (percent: number) => void) => {
    const subscription = (_event: any, percent: number) => callback(percent);
    ipcRenderer.on('excel-import-progress', subscription);
    return () => ipcRenderer.removeListener('excel-import-progress', subscription);
  },
});
