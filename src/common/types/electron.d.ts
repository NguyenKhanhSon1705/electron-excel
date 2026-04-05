// Type declarations cho window.electron API (preload bridge)

export interface ElectronAPI {
  invokeGoCli: (args: string[]) => Promise<string>;
  importExcel: () => Promise<ImportExcelResponse>;
  send: (channel: string, data: unknown) => void;
  receive: (channel: string, func: (...args: unknown[]) => void) => void;
  onExcelImportProgress: (callback: (percent: number) => void) => () => void;
  cancelExcelImport: () => Promise<boolean>;
  selectWordTemplate: () => Promise<WordTemplateResponse>;
  selectExportDirectory: () => Promise<SelectDirectoryResponse>;
  saveMergedFile: (args: { directory: string; fileName: string; content: Uint8Array }) => Promise<SaveFileResponse>;
  convertHtmlToDocx: (html: string) => Promise<Uint8Array>;
}

export interface WordTemplateResponse {
  success: boolean;
  cancelled?: boolean;
  fileName?: string;
  content?: Uint8Array;
}

export interface SelectDirectoryResponse {
  success: boolean;
  cancelled?: boolean;
  path?: string;
}

export interface SaveFileResponse {
  success: boolean;
  error?: string;
}

export interface ImportExcelResponse {
  success: boolean;
  cancelled?: boolean;
  data?: {
    fileName: string;
    sheets: Array<{
      sheetName: string;
      data: string[][];
    }>;
  };
  error?: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
