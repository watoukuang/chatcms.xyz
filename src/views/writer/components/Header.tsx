import React from 'react';

interface HeaderProps {
  title: string;
  onChangeTitle: (v: string) => void;
  onSave: () => void;
}

export default function Header({title, onChangeTitle, onSave}: HeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <input
        value={title}
        onChange={e => onChangeTitle(e.target.value)}
        placeholder="输入标题"
        className="flex-1 mr-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-black/20 text-base"
      />
      <button
        onClick={onSave}
        className="px-3 py-2 text-sm rounded border bg-white border-gray-200 hover:bg-gray-50 dark:bg-black/20 dark:border-white/15 dark:text-gray-200"
      >保存</button>
    </div>
  );
}