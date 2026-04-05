'use client';

import React from 'react';

interface SheetTabsProps {
  sheetNames: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({ sheetNames, currentIndex, onSelect }) => {
  if (sheetNames.length === 0) return null;

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
      {sheetNames.map((name, idx) => (
        <button
          key={idx}
          id={`sheet-tab-${idx}`}
          onClick={() => onSelect(idx)}
          className={`
            px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
            ${currentIndex === idx
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }
          `}
        >
          {name}
        </button>
      ))}
    </div>
  );
};
