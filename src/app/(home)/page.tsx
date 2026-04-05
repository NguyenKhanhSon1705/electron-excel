"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExcelToolbar,
  ExcelTable,
  ExcelDropzone,
  useExcelImport,
} from "~/features/excel-import";
import { LoadingOverlay } from "~/components/ui/loading-overlay";
import { WordMergeView } from "~/features/word-merge";

export default function Home() {
  const {
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
  } = useExcelImport();

  const [currentView, setCurrentView] = React.useState<'excel' | 'word-merge'>('excel');

  const excelHeaders = React.useMemo(() => 
    activeSheetData.length > 0 ? activeSheetData[0] : [],
    [activeSheetData]
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <AnimatePresence mode="wait">
        {currentView === 'excel' ? (
          <motion.div 
            key="excel-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            {/* Toolbar */}
            <ExcelToolbar
              hasData={hasData}
              fileName={workbook?.fileName}
              sheetNames={sheetNames}
              currentSheetIndex={currentSheetIndex}
              onSelectSheet={selectSheet}
              onImport={importFile}
              onClear={clearData}
              onOpenWordMerge={() => setCurrentView('word-merge')}
            />

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {hasData ? (
                  <ExcelTable data={activeSheetData} />
                ) : (
                  <ExcelDropzone onImport={importFile} />
                )}
              </AnimatePresence>

              {/* Loading Overlay */}
              {isLoading && (
                <LoadingOverlay
                  message={progress === 95 ? "Đang xử lý dữ liệu..." : "Đang đọc file Excel..."}
                  subMessage={progress === 95 ? "Dữ liệu đang được chuyển về giao diện" : "Vui lòng đợi trong giây lát"}
                  progress={progress}
                  onCancel={cancelImport}
                />
              )}

              {/* Error Toast */}
              {error && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600 text-xs font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
            </main>
          </motion.div>
        ) : (
          <motion.div 
            key="word-merge-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 h-full"
          >
            <WordMergeView 
              onBack={() => setCurrentView('excel')}
              excelHeaders={excelHeaders}
              excelData={activeSheetData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Handsontable style overrides */}
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
