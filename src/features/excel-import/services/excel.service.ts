// Service layer — gọi Electron IPC để import Excel
import type { ExcelWorkbook } from '../types/excel.types';

export interface ImportResult {
  success: boolean;
  data: ExcelWorkbook | null;
  cancelled?: boolean;
  error?: string;
}

/**
 * Gọi Go CLI thông qua Electron IPC để import file Excel.
 * Flow: Renderer → IPC → Main Process → dialog → Go CLI → JSON → return
 */
export async function importExcelFile(): Promise<ImportResult> {
  try {
    // Kiểm tra xem có đang chạy trong Electron không
    if (typeof window === 'undefined' || !window.electron) {
      return {
        success: false,
        data: null,
        error: 'Không tìm thấy Electron API. Hãy chạy app trong Electron.',
      };
    }

    const response = await window.electron.importExcel();

    if (response.cancelled) {
      return { success: false, data: null, cancelled: true };
    }

    if (!response.success || !response.data) {
      return {
        success: false,
        data: null,
        error: response.error || 'Lỗi không xác định khi đọc file Excel',
      };
    }

    return {
      success: true,
      data: {
        fileName: response.data.fileName,
        sheets: response.data.sheets,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      data: null,
      error: errorMessage || 'Lỗi giao tiếp với Go CLI',
    };
  }
}
