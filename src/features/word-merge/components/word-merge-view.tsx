'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, X, Save, Download, AlertCircle, Loader2, Info, Eye, 
  EyeOff, ChevronLeft, ChevronRight, Hash, Copy, CheckCircle2,
  Sparkles, Layers, ArrowLeft
} from 'lucide-react';
import { useWordMerge } from '../hooks/use-word-merge';
import { DocxViewer } from './docx-viewer';

interface WordMergeViewProps {
  onBack: () => void;
  excelHeaders: string[];
  excelData: string[][];
}

const FieldCard = ({ header, isSpecial = false }: { header: string, isSpecial?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const tag = `{{${header}}}`;
    navigator.clipboard.writeText(tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCopy}
      className={`w-full text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm ${
        isSpecial 
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:border-amber-400' 
          : 'bg-white border-slate-100 hover:border-indigo-400 hover:shadow-indigo-100/50'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <code className={`text-xs font-black tracking-tight ${isSpecial ? 'text-amber-700' : 'text-indigo-600'}`}>
          {'{{'}{header}{'}}'}
        </code>
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-emerald-500"
            >
              <CheckCircle2 size={14} />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="group-hover:opacity-100 transition-opacity text-slate-400"
            >
              <Copy size={12} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <span className={`text-[10px] font-black uppercase tracking-widest block truncate ${
        isSpecial ? 'text-amber-500/80' : 'text-slate-400 group-hover:text-slate-600'
      }`}>
        {isSpecial && 'Tự động: '}{header}
      </span>

      {/* Glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity ${
        isSpecial ? 'bg-amber-400' : 'bg-indigo-400'
      }`} />
      
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-3 bottom-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg pointer-events-none uppercase"
          >
            Đã Copy
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const WordMergeView: React.FC<WordMergeViewProps> = ({
  onBack,
  excelHeaders,
  excelData,
}) => {
  const {
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
  } = useWordMerge();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex-1 flex flex-col h-full bg-white overflow-hidden"
    >
      {/* Header Bar */}
      <div className="px-8 sm:px-12 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between bg-white z-20">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={!isMerging ? onBack : undefined}
            disabled={isMerging}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                Mail Merge Studio
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 uppercase tracking-widest">
                <Sparkles size={12} className="text-amber-400" />
                Xử lý Word XML Trực Tiếp
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          {template && !isMerging && (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePreview(excelData, false)}
                className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-black rounded-2xl transition-all shadow-sm uppercase tracking-wider ${
                  isPreviewing && !isPreviewFull
                    ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isPreviewing && !isPreviewFull ? <EyeOff size={16} /> : <Eye size={16} />}
                DÒNG {previewIndex + 1}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePreview(excelData, true)}
                className={`flex items-center gap-2.5 px-6 py-3 text-[10px] font-black rounded-2xl transition-all uppercase tracking-wider ${
                  isPreviewing && isPreviewFull
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isPreviewing && isPreviewFull ? <EyeOff size={16} /> : <Layers size={16} />}
                XEM TOÀN BỘ ({excelData.length - 1})
              </motion.button>

              <div className="w-px h-8 bg-slate-100 mx-2" />

              <button
                onClick={selectTemplate}
                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group"
                title="Đổi mẫu khác"
              >
                <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-slate-50 relative">
        {/* Sidebar - Always visible for quick tag access */}
        <aside 
          className={`border-r border-slate-200 bg-white flex flex-col shadow-2xl z-10 transition-all duration-500 ease-in-out ${
            isSidebarOpen ? 'w-full sm:w-80 lg:w-96' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-8 pb-4 flex items-center justify-between">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Hash size={20} className="text-indigo-500" />
              Studio Fields
            </h4>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="px-8 mb-6">
            <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Workflow</p>
                <p className="text-xs font-bold leading-relaxed">
                  1. Click copy field<br/>
                  2. Paste vào Word gốc<br/>
                  3. Bấm "Nạp Mẫu" để xem thử
                </p>
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 opacity-20 group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 scrollbar-thin">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cố định / Tự động</p>
              <FieldCard header="STT" isSpecial />
              <FieldCard header="ngayct" isSpecial />
              <FieldCard header="ten" isSpecial />
              <FieldCard header="diachi" isSpecial />
            </div>
            
            <div className="h-px bg-slate-100 my-4" />
            
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Từ file Excel</p>
              {excelHeaders.map(header => (
                <FieldCard key={header} header={header} />
              ))}
            </div>
          </div>
        </aside>

        {/* View Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100/30">
          <div className="px-10 py-4 bg-white border-b border-slate-100 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 h-10 w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              )}
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                {isPreviewing ? 'GIẢ LẬP TRANG IN THỰC TẾ' : 'VĂN BẢN MÔ PHỎNG'}
              </h4>
            </div>

            {isPreviewing && !isPreviewFull && (
              <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-2xl shadow-inner">
                <button 
                  onClick={() => navigatePreview('prev', excelData)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-indigo-600 disabled:opacity-30"
                  disabled={previewIndex === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 text-center min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-800 tracking-tight">
                    DÒNG {previewIndex + 1} <span className="opacity-30">/</span> {excelData.length - 1}
                  </p>
                </div>
                <button 
                  onClick={() => navigatePreview('next', excelData)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-indigo-600 disabled:opacity-30"
                  disabled={previewIndex >= excelData.length - 2}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Stage */}
          <div className="flex-1 p-8 sm:p-12 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            
            {!template ? (
              <div className="h-full w-full flex items-center justify-center relative z-10">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={selectTemplate}
                  className="w-full max-w-xl py-24 border-4 border-dashed border-slate-200 rounded-[3.5rem] hover:border-indigo-400 hover:bg-white hover:shadow-2xl transition-all flex flex-col items-center justify-center gap-10 text-slate-400 group bg-white/50"
                >
                  <div className="w-28 h-28 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Download size={56} />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-black text-slate-800 block mb-3 group-hover:text-indigo-600">Nạp Mẫu Word (.docx)</span>
                    <p className="text-base text-slate-400 font-medium max-w-xs mx-auto">Tải lên file văn bản của bạn có chứa các thẻ {'{{...}}'}</p>
                  </div>
                </motion.button>
              </div>
            ) : (
              <motion.div 
                layout
                className="h-full w-full max-w-5xl mx-auto bg-white shadow-[0_32px_120px_-32px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden relative z-10 border border-slate-200/50"
              >
                <DocxViewer 
                  buffer={isPreviewing ? previewBuffer : (template?.content || null)} 
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="px-12 py-8 bg-white border-t border-slate-100 z-30 flex flex-wrap items-center justify-between gap-6">
        <div className="flex-1 min-w-[300px]">
          <AnimatePresence>
            {isMerging && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  <span className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Đang xuất file...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-100"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => runMerge(excelData)}
            disabled={!template || isMerging}
            className={`group px-12 py-5 rounded-[2rem] text-sm font-black flex items-center gap-4 transition-all shadow-2xl active:scale-95 relative overflow-hidden ${
              !template || isMerging
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}
          >
            {isMerging ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Final Export</span>
              <span>{isMerging ? 'XỬ LÝ DỮ LIỆU...' : `XUẤT ${excelData.length > 1 ? excelData.length - 1 : 0} VĂN BẢN`}</span>
            </div>
          </motion.button>
        </div>
      </div>
      
      {/* Error Floating Card */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-12 z-[100] max-w-md bg-white border-2 border-red-50 rounded-[2.5rem] shadow-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1 pr-6">
                <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Lỗi Hệ Thống</p>
                <p className="text-[11px] text-red-600 font-bold">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-2 text-red-300 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
