import React from 'react';

interface ToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onImport: () => void;
  onExport: () => void;
  onNew: () => void;
  onInsertImage?: () => void;
}

function IconButton({title, onClick, children, disabled = false}: { title: string; onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 grid place-items-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1a1d24] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ onUndo, onRedo, onImport, onExport, onNew, onInsertImage }: ToolbarProps): React.ReactElement {
  return (
    <div className="border-b border-gray-200 dark:border-white/10">
      <div className="w-full flex items-center justify-center gap-2 px-3 py-2">
      {/* Undo */}
      <IconButton title="撤销" onClick={onUndo}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
          <path d="M9 14l-5-5 5-5"/>
          <path d="M4 9h10a6 6 0 016 6v0"/>
        </svg>
      </IconButton>
      {/* Redo */}
      <IconButton title="重做" onClick={onRedo}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
          <path d="M15 14l5-5-5-5"/>
          <path d="M20 9H10a6 6 0 00-6 6v0"/>
        </svg>
      </IconButton>

      <div className="w-px h-5 bg-gray-200 dark:bg-[#2a2c31] mx-1"/>

      {/* Upload (import) */}
      <IconButton title="导入 JSON" onClick={onImport}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
          <path d="M12 3v12"/>
          <path d="M8 7l4-4 4 4"/>
          <path d="M20 21H4a2 2 0 01-2-2v-5"/>
        </svg>
      </IconButton>
      {/* Download (export) */}
      <IconButton title="导出 JSON" onClick={onExport}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
          <path d="M12 21V9"/>
          <path d="M16 17l-4 4-4-4"/>
          <path d="M20 3H4a2 2 0 00-2 2v5"/>
        </svg>
      </IconButton>

      <div className="w-px h-5 bg-gray-200 dark:bg-[#2a2c31] mx-1"/>

      {/* New file */}
      <IconButton title="新建笔记" onClick={onNew}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
          <rect x="4" y="3" width="16" height="18" rx="2"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
        </svg>
      </IconButton>

      {/* Image */}
      <IconButton title="插入图片（占位）" onClick={onInsertImage}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <circle cx="8" cy="10" r="2"/>
          <path d="M21 16l-5-5-4 4-2-2-6 6"/>
        </svg>
      </IconButton>
      </div>
    </div>
  );
}