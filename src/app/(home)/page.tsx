"use client";

import React, { useState, useCallback, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Trash2, 
  Search,
  Plus,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// register Handsontable modules
registerAllModules();

// Handsontable CSS
import "handsontable/dist/handsontable.full.min.css";

interface ExcelData {
  sheetName: string;
  data: any[][];
}

export default function Home() {
  const [workbookData, setWorkbookData] = useState<ExcelData[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const cancelFileUpload = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // Create worker
      const worker = new Worker(new URL('../workers/excel.worker.ts', import.meta.url));
      workerRef.current = worker;

      worker.onmessage = (event) => {
        const { type, data, error } = event.data;
        if (type === 'success') {
          setWorkbookData(data);
          setCurrentSheetIndex(0);
        } else {
          console.error("Excel processing error:", error);
        }
        setIsLoading(false);
        worker.terminate();
        workerRef.current = null;
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setIsLoading(false);
        worker.terminate();
        workerRef.current = null;
      };

      const arrayBuffer = await file.arrayBuffer();
      // Using transferables for performance
      worker.postMessage(arrayBuffer, [arrayBuffer]);
    } catch (err) {
      console.error("File reading failed:", err);
      setIsLoading(false);
    }
  }, []);

  const clearData = () => {
    setWorkbookData([]);
    setCurrentSheetIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeData = workbookData[currentSheetIndex]?.data || [];

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Sticky Header Toolbar */}
      <header className="h-16 shrink-0 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileSpreadsheet size={20} />
            <span className="font-bold text-sm tracking-tight">Excel Manager</span>
          </div>
          
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />
          
          {workbookData.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
              {workbookData.map((sheet, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSheetIndex(idx)}
                  className={`
                    px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
                    ${currentSheetIndex === idx 
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"}
                  `}
                >
                  {sheet.sheetName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {workbookData.length > 0 ? (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw size={14} />
                Re-import
              </button>
              <button 
                onClick={clearData}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <Upload size={16} />
              Import Data
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {workbookData.length > 0 ? (
            <motion.div 
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 w-full bg-white relative"
            >
              <HotTable
                data={activeData}
                rowHeaders={true}
                colHeaders={true}
                height="100%"
                width="100%"
                stretchH="all"
                contextMenu={true}
                filters={true}
                dropdownMenu={true}
                manualColumnResize={true}
                manualRowResize={true}
                licenseKey="non-commercial-and-evaluation"
                className="htCenter"
                cells={(row, col) => {
                  return {
                    className: row === 0 ? "font-bold bg-slate-50 text-slate-900" : ""
                  };
                }}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8"
            >
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="max-w-md w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-400 hover:bg-white transition-all group shadow-sm"
              >
                <div className="p-6 bg-indigo-50 rounded-full text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-500">
                  <Upload size={48} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Import your Excel data</h3>
                  <p className="text-slate-500 text-sm">Select .xlsx, .xls or .csv files to get started</p>
                </div>
                <div className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-full group-hover:bg-indigo-600 transition-colors">
                  Choose File
                </div>
              </div>
              
              <div className="mt-12 flex items-center gap-8 text-slate-400 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <div className="flex items-center gap-2"><Plus size={16}/> Instant Editing</div>
                <div className="flex items-center gap-2"><Download size={16}/> Export Anything</div>
                <div className="flex items-center gap-2"><Search size={16}/> Filter Data</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-bold text-slate-900 animate-pulse">Processing workbook...</p>
              <p className="text-xs text-slate-500">Large files may take a moment</p>
            </div>
            <button 
              onClick={cancelFileUpload}
              className="mt-4 px-6 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95"
            >
              Cancel Upload
            </button>
          </div>
        )}
      </main>

      {/* Styled HotTable (Handsontable) overrides in global CSS is recommended, but we can use Tailwind here too */}
      <style jsx global>{`
        .handsontable {
          font-size: 13px !important;
          font-family: inherit !important;
        }
        .handsontable td {
          border-color: #e2e8f0 !important;
          padding: 8px !important;
        }
        .handsontable th {
          background-color: #f8fafc !important;
          border-color: #e2e8f0 !important;
          font-weight: 600 !important;
          padding: 8px !important;
        }
        .handsontable .ht__highlight {
          background-color: #eef2ff !important;
        }
      `}</style>
    </div>
  );
}
