'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ExcelWorkbook } from '../types/excel.types';
import { importExcelFile } from '../services/excel.service';

interface UseExcelImportReturn {
  /** Dữ liệu workbook đã import */
  workbook: ExcelWorkbook | null;
  /** Index của sheet đang hiển thị */
  currentSheetIndex: number;
  /** Dữ liệu sheet đang active */
  activeSheetData: string[][];
  /** Danh sách tên sheet */
  sheetNames: string[];
  /** Đang loading */
  isLoading: boolean;
  /** Tiến độ loading (0-100) */
  progress: number;
  /** Thông báo lỗi */
  error: string | null;
  /** Có data hay chưa */
  hasData: boolean;

  /** Import file Excel mới */
  importFile: () => Promise<void>;
  /** Chuyển sheet */
  selectSheet: (index: number) => void;
  /** Hủy bỏ quá trình import đang diễn ra */
  cancelImport: () => Promise<void>;
  /** Xóa tất cả data */
  clearData: () => void;
  /** Xóa thông báo lỗi */
  clearError: () => void;
}

export function useExcelImport(): UseExcelImportReturn {
  const [workbook, setWorkbook] = useState<ExcelWorkbook | null>(null);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const importFile = useCallback(async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    // Đăng ký listener cho progress
    const cleanup = window.electron.onExcelImportProgress((percent) => {
      setProgress(percent);
    });

    try {
      const result = await importExcelFile();

      if (result.cancelled) {
        // User hủy dialog, không làm gì
        setIsLoading(false);
        return;
      }

      if (!result.success || !result.data) {
        if (!result.cancelled) {
          setError(result.error || 'Import thất bại');
        }
        setIsLoading(false);
        return;
      }

      // Khi data đã về đến đây, ta set 100% rồi mới đóng loader
      setProgress(100);
      setWorkbook(result.data);
      setCurrentSheetIndex(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
    } finally {
      cleanup();
      setIsLoading(false);
      setProgress(0);
    }
  }, []);

  const cancelImport = useCallback(async () => {
    await window.electron.cancelExcelImport();
    setIsLoading(false);
    setProgress(0);
  }, []);

  const selectSheet = useCallback((index: number) => {
    setCurrentSheetIndex(index);
  }, []);

  const clearData = useCallback(() => {
    setWorkbook(null);
    setCurrentSheetIndex(0);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const activeSheetData = useMemo(() => 
    workbook?.sheets[currentSheetIndex]?.data || [], 
    [workbook, currentSheetIndex]
  );

  const sheetNames = useMemo(() => 
    workbook?.sheets.map(s => s.sheetName) || [], 
    [workbook]
  );

  const hasData = useMemo(() => 
    workbook !== null && workbook.sheets.length > 0,
    [workbook]
  );

  return {
    workbook,
    currentSheetIndex,
    activeSheetData,
    sheetNames,
    isLoading,
    progress,
    error,
    hasData,
    importFile,
    selectSheet,
    cancelImport,
    clearData,
    clearError,
  };
}
