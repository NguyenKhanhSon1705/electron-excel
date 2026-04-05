'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Trash2,
  FileText,
} from 'lucide-react';
import { SheetTabs } from './sheet-tabs';

interface ExcelToolbarProps {
  hasData: boolean;
  fileName?: string;
  sheetNames: string[];
  currentSheetIndex: number;
  onSelectSheet: (index: number) => void;
  onImport: () => void;
  onClear: () => void;
  onOpenWordMerge?: () => void;
}

export const ExcelToolbar: React.FC<ExcelToolbarProps> = ({
  hasData,
  fileName,
  sheetNames,
  currentSheetIndex,
  onSelectSheet,
  onImport,
  onClear,
  onOpenWordMerge,
}) => {
  return (
    <header
      id="excel-toolbar"
      className="h-16 shrink-0 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 flex items-center justify-between z-20 sticky top-0"
    >
      {/* Left side: Logo + Sheet Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <FileSpreadsheet size={20} />
          <span className="font-bold text-sm tracking-tight">Excel Manager</span>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        {hasData && (
          <>
            {fileName && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50 max-w-[180px] truncate">
                {fileName}
              </span>
            )}
            <SheetTabs
              sheetNames={sheetNames}
              currentIndex={currentSheetIndex}
              onSelect={onSelectSheet}
            />
          </>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        {hasData ? (
          <>
            <button
              id="btn-mail-merge"
              onClick={onOpenWordMerge}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <FileText size={14} />
              Mail Merge
            </button>
            <button
              id="btn-reimport"
              onClick={onImport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <RefreshCw size={14} />
              Re-import
            </button>
            <button
              id="btn-clear"
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
              title="Xóa dữ liệu"
            >
              <Trash2 size={18} />
            </button>
          </>
        ) : (
          <button
            id="btn-import"
            onClick={onImport}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Upload size={16} />
            Import Data
          </button>
        )}
      </div>
    </header>
  );
};
