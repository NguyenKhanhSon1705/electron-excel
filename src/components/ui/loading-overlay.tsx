'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Đang xử lý...',
  subMessage = 'File lớn có thể mất một chút thời gian',
  progress,
  onCancel,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
    >
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
      
      {progress !== undefined && (
        <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-600"
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-bold text-slate-900 animate-pulse">
          {message} {progress !== undefined ? `${progress}%` : ''}
        </p>
        <p className="text-xs text-slate-500 text-center px-8">{subMessage}</p>
      </div>
      {onCancel && (
        <button
          id="btn-cancel-loading"
          onClick={onCancel}
          className="mt-4 px-6 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95"
        >
          Hủy
        </button>
      )}
    </motion.div>
  );
};
