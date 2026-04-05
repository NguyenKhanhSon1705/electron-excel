// Types cho feature excel-import

export interface ExcelSheet {
  sheetName: string;
  data: string[][];
}

export interface ExcelWorkbook {
  fileName: string;
  sheets: ExcelSheet[];
}

export interface ExcelImportState {
  workbook: ExcelWorkbook | null;
  currentSheetIndex: number;
  isLoading: boolean;
  progress: number;
  error: string | null;
}
