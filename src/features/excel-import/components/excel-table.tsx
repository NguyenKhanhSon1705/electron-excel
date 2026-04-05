'use client';

import React from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { motion } from 'framer-motion';

// Register Handsontable modules
registerAllModules();

interface ExcelTableProps {
  data: string[][];
}

export const ExcelTable: React.FC<ExcelTableProps> = ({ data }) => {
  const isLargeData = data.length > 50000;

  return (
    <div className="flex-1 w-full bg-white relative">
      <HotTable
        data={data}
        rowHeaders={true}
        colHeaders={true}
        height="100%"
        width="100%"
        stretchH="all"
        contextMenu={true}
        // Tắt các tính năng nặng nề nếu dữ liệu quá lớn để tránh treo UI
        filters={!isLargeData}
        dropdownMenu={!isLargeData}
        manualColumnResize={true}
        manualRowResize={true}
        // Tối ưu hiệu năng render cho Big Data
        viewportRowRenderingOffset={15}
        viewportColumnRenderingOffset={10}
        colWidths={120}
        rowHeights={32}
        autoRowSize={false}
        autoColumnSize={false}
        licenseKey="non-commercial-and-evaluation"
        className="htCenter"
        cells={(row) => {
          return {
            className: row === 0 ? 'header-row' : '',
          };
        }}
      />
      <style jsx global>{`
        .header-row {
          font-weight: bold !important;
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
        /* Tối ưu scrollbar cho mượt hơn */
        .handsontable .wtHolder {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>
    </div>
  );
};
