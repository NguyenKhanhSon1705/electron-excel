import * as XLSX from 'xlsx';

self.onmessage = (e: MessageEvent<ArrayBuffer>) => {
  try {
    const data = e.data;
    const workbook = XLSX.read(data, { type: 'array' });
    
    const workbookData = workbook.SheetNames.map((name) => ({
      sheetName: name,
      data: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }),
    }));
    
    self.postMessage({ type: 'success', data: workbookData });
  } catch (error) {
    self.postMessage({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
