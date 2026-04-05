'use client';

import { useEffect, useRef } from 'react';
import * as docx from 'docx-preview';

interface DocxViewerProps {
  buffer: Uint8Array | null;
  className?: string;
}

export function DocxViewer({ buffer, className }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buffer || !containerRef.current) return;

    const renderDocx = async () => {
      try {
        // Xóa nội dung cũ
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Render docx vào container
        await docx.renderAsync(buffer, containerRef.current!, undefined, {
          className: 'docx-preview-container',
          inWrapper: true,
          ignoreHeight: false,
          ignoreWidth: false,
          breakPages: true,
          debug: false,
        });
        
        // Tùy chỉnh style cho container sau khi render
        const wrapper = containerRef.current?.querySelector('.docx-wrapper') as HTMLElement;
        if (wrapper) {
          wrapper.style.backgroundColor = 'transparent';
          wrapper.style.padding = '60px 20px';
          wrapper.style.display = 'flex';
          wrapper.style.flexDirection = 'column';
          wrapper.style.alignItems = 'center';
          wrapper.style.gap = '40px';
        }

        const pages = containerRef.current?.querySelectorAll('.docx') as NodeListOf<HTMLElement>;
        pages.forEach(page => {
          page.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)';
          page.style.marginBottom = '0'; // Dùng gap của wrapper
          page.style.borderRadius = '8px';
          page.style.backgroundColor = '#fff';
          page.style.transition = 'transform 0.3s ease';
        });

      } catch (error) {
        console.error('Lỗi khi render Docx:', error);
      }
    };

    renderDocx();
  }, [buffer]);

  if (!buffer) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
        <p>Chọn mẫu Word để bắt đầu xem trước</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`docx-viewer-root h-full overflow-auto bg-slate-200/30 rounded-xl p-4 ${className}`}
      id="docx-viewer-container"
    />
  );
}
