'use client';

import React from 'react';
import { Upload, Plus, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExcelDropzoneProps {
  onImport: () => void;
}

export const ExcelDropzone: React.FC<ExcelDropzoneProps> = ({ onImport }) => {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-8"
    >
      <div
        id="dropzone"
        onClick={onImport}
        className="max-w-md w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-400 hover:bg-white transition-all group shadow-sm"
      >
        <div className="p-6 bg-indigo-50 rounded-full text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-500">
          <Upload size={48} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            Import your Excel data
          </h3>
          <p className="text-slate-500 text-sm">
            Chọn file .xlsx để bắt đầu xử lý
          </p>
        </div>
        <div className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-full group-hover:bg-indigo-600 transition-colors">
          Choose File
        </div>
      </div>

      <div className="mt-12 flex items-center gap-8 text-slate-400 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="flex items-center gap-2">
          <Plus size={16} /> Instant Editing
        </div>
        <div className="flex items-center gap-2">
          <Download size={16} /> Export Anything
        </div>
        <div className="flex items-center gap-2">
          <Search size={16} /> Filter Data
        </div>
      </div>
    </motion.div>
  );
};
