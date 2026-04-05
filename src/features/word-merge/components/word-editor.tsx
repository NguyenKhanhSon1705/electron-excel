'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Underline from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, 
  Table as TableIcon, List, ListOrdered,
  PlusCircle, Trash2
} from 'lucide-react';

interface WordEditorProps {
  content: string;
  onChange: (html: string) => void;
  onInsertTag?: (editor: any) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/50 sticky top-0 z-20">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
        title="In đậm"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
        title="In nghiêng"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
        title="Gạch chân"
      >
        <UnderlineIcon size={16} />
      </button>

      <div className="w-[1px] h-4 bg-slate-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
      >
        <AlignRight size={16} />
      </button>

      <div className="w-[1px] h-4 bg-slate-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-[1px] h-4 bg-slate-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
        title="Chèn bảng"
      >
        <TableIcon size={16} />
      </button>
      
      {editor.isActive('table') && (
        <>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 text-[10px] bg-indigo-50 text-indigo-600 rounded px-1.5 font-bold hover:bg-indigo-100">+ Cột</button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 text-[10px] bg-indigo-50 text-indigo-600 rounded px-1.5 font-bold hover:bg-indigo-100">+ Dòng</button>
          <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
        </>
      )}
    </div>
  );
};

export interface WordEditorRef {
  insertText: (text: string) => void;
}

export const WordEditor = React.forwardRef<WordEditorRef, WordEditorProps>(({ content, onChange, editable = true }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (editor) {
        editor.chain().focus().insertContent(text).run();
      }
    },
  }));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50 flex justify-center">
        <div className="w-full max-w-[800px] bg-white min-h-[1056px] p-[2cm] shadow-sm border border-slate-200 ring-1 ring-slate-100 prose prose-slate max-w-none">
          <EditorContent editor={editor} className="outline-none min-h-full" />
        </div>
      </div>
      
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 100%;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #cbd5e1;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f5f9;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
});

WordEditor.displayName = 'WordEditor';
