import { useState, useCallback } from 'react';
import type { WordTemplate } from '../types/word.types';
import { 
  renderDocxSingleFile,
  renderDocxPreview
} from '../services/word.service';

/**
 * Chuẩn hóa khóa (Key Normalization) để khớp tag thông minh hơn.
 * Ví dụ: "Ngày CT " -> "ngayct"
 */
function normalizeKey(key: string): string {
  if (!key) return '';
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/\s+/g, '')             // Bỏ khoảng trắng
    .replace(/[^a-z0-9]/g, '');      // Bỏ ký tự đặc biệt
}

/**
 * Định dạng số với dấu phân cách phần nghìn (VBA style #,##0)
 */
function formatNumber(val: any): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function useWordMerge() {
  const [template, setTemplate] = useState<WordTemplate | null>(null);
  
  // Preview states
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPreviewFull, setIsPreviewFull] = useState(false);
  const [previewBuffer, setPreviewBuffer] = useState<Uint8Array | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectTemplate = useCallback(async () => {
    try {
      const result = await window.electron.selectWordTemplate();
      if (result.cancelled || !result.content) return;

      setTemplate({
        fileName: result.fileName!,
        content: result.content,
        placeholders: [],
      });
      
      setIsPreviewing(false);
      setIsPreviewFull(false);
      setPreviewBuffer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi chọn template');
    }
  }, []);

  /**
   * Tạo ra một object rowData với khả năng khớp key thông minh và định dạng theo VBA
   */
  const createSmartRowData = (headers: string[], row: string[]) => {
    const rowData: Record<string, string> = {};
    headers.forEach((header, idx) => {
      const originalHeader = (header || '').trim();
      const value = String(row[idx] || '');
      const normalizedHeader = normalizeKey(originalHeader);
      
      // Định dạng số cho các cột tiền/số lượng
      let finalValue = value;
      const lowerHeader = originalHeader.toLowerCase();
      if (lowerHeader.includes('số lượng') || lowerHeader.includes('đơn giá') || lowerHeader.includes('thành tiền') || lowerHeader.includes('soluong') || lowerHeader.includes('dongia') || lowerHeader.includes('thanhtien')) {
        finalValue = formatNumber(value);
      }

      if (originalHeader) rowData[originalHeader] = finalValue;
      if (normalizedHeader && !rowData[normalizedHeader]) {
        rowData[normalizedHeader] = finalValue;
      }

      // Thêm map theo vị trí (VBA Style)
      rowData[`COL${idx + 1}`] = finalValue;
    });

    // Thêm các key VBA-specific nếu thiếu
    if (!rowData['ngayct']) rowData['ngayct'] = rowData['Ngày CT'] || rowData['COL1'] || '';
    if (!rowData['ten']) rowData['ten'] = rowData['Tên'] || rowData['COL2'] || '';
    
    return rowData;
  };

  /**
   * NHÓM DỮ LIỆU THEO NGÀY VÀ TÊN (VBA STYLE)
   */
  const groupExcelData = (headers: string[], rows: string[][]) => {
    const groups: { key: string, rows: Record<string, any>[], totalThanhTien: number }[] = [];
    
    rows.forEach((row) => {
      const rowData = createSmartRowData(headers, row);
      const groupKey = `${rowData['ngayct']}_${rowData['ten']}`;
      
      let group = groups.find(g => g.key === groupKey);
      if (!group) {
        group = { key: groupKey, rows: [], totalThanhTien: 0 };
        groups.push(group);
      }
      
      group.rows.push(rowData);
      
      // Tính tổng thành tiền cho group
      const thanhTienRaw = String(rowData['thanhtien'] || rowData['Thành tiền'] || '0').replace(/,/g, '');
      group.totalThanhTien += parseFloat(thanhTienRaw) || 0;
    });
    
    return groups;
  };

  /**
   * Chuyển đổi chế độ Xem trước
   */
  const togglePreview = useCallback(async (excelData: string[][], forceFull: boolean = false) => {
    if (!template || excelData.length < 2) return;

    if (isPreviewing && isPreviewFull === forceFull) {
      setIsPreviewing(false);
      setIsPreviewFull(false);
      setPreviewBuffer(null);
      return;
    }

    try {
      setIsMerging(true);
      setError(null);
      
      const headers = excelData[0];
      const rows = excelData.slice(1);
      let buffer: Uint8Array;

      if (forceFull) {
        const groupedData = groupExcelData(headers, rows);
        buffer = await renderDocxPreview(template.content, groupedData);
        setIsPreviewFull(true);
      } else {
        const row = rows[previewIndex];
        if (!row) throw new Error('Không tìm thấy dữ liệu dòng này');
        const rowData = createSmartRowData(headers, row);
        
        const singleGroup = [{ 
          key: 'single', 
          rows: [rowData], 
          totalThanhTien: parseFloat(String(rowData['thanhtien'] || rowData['Thành tiền'] || '0').replace(/,/g, '')) || 0 
        }];
        
        buffer = await renderDocxPreview(template.content, singleGroup);
        setIsPreviewFull(false);
      }

      setPreviewBuffer(buffer);
      setIsPreviewing(true);
    } catch (err: any) {
      setError('Lỗi xem trước: ' + (err.message || String(err)));
    } finally {
      setIsMerging(false);
    }
  }, [template, isPreviewing, isPreviewFull, previewIndex]);

  /**
   * Chuyển sang dòng dữ liệu khác trong bản xem trước
   */
  const navigatePreview = useCallback(async (direction: 'next' | 'prev', excelData: string[][]) => {
    const maxIndex = excelData.length - 2;
    let newIndex = previewIndex;

    if (direction === 'next') {
      newIndex = Math.min(maxIndex, previewIndex + 1);
    } else {
      newIndex = Math.max(0, previewIndex - 1);
    }

    if (newIndex === previewIndex) return;

    setPreviewIndex(newIndex);
    
    try {
      const headers = excelData[0];
      const row = excelData[newIndex + 1];
      const rowData = createSmartRowData(headers, row);

      if (!template) return;

      const singleGroup = [{ 
        key: 'single', 
        rows: [rowData], 
        totalThanhTien: parseFloat(String(rowData['thanhtien'] || rowData['Thành tiền'] || '0').replace(/,/g, '')) || 0 
      }];
      
      const buffer = await renderDocxPreview(template.content, singleGroup);
      setPreviewBuffer(buffer);
    } catch (err: any) {
      setError('Lỗi khi chuyển dòng xem trước: ' + err.message);
    }
  }, [template, previewIndex]);

  const runMerge = useCallback(async (excelData: string[][]) => {
    if (!template) return;
    
    const dirResult = await window.electron.selectExportDirectory();
    if (dirResult.cancelled || !dirResult.path) return;

    setIsMerging(true);
    setProgress(10);
    setError(null);

    const exportDir = dirResult.path;
    const headers = excelData[0];
    const rows = excelData.slice(1);
    
    try {
      const groupedData = groupExcelData(headers, rows);
      setProgress(30);

      if (!template) throw new Error('Không có template');
      const mergedBuffer = await renderDocxSingleFile(template.content, groupedData);
      
      setProgress(70);

      const finalFileName = `Merge_KetQua_${new Date().getTime()}.docx`;
      await window.electron.saveMergedFile({
        directory: exportDir,
        fileName: finalFileName,
        content: mergedBuffer,
      });

      setProgress(100);
      alert(`Đã xuất thành công tại: ${exportDir}/${finalFileName}`);
    } catch (err: any) {
      console.error('Lỗi trộn file:', err);
      setError(err instanceof Error ? err.message : 'Lỗi trộn file');
    } finally {
      setIsMerging(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [template]);

  return {
    template,
    isPreviewing,
    isPreviewFull,
    previewBuffer,
    previewIndex,
    togglePreview,
    navigatePreview,
    isMerging,
    progress,
    error,
    selectTemplate,
    runMerge,
    setError,
  };
}
