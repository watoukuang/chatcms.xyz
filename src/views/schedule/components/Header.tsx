import React from 'react';

interface HeaderProps {
    title?: React.ReactNode;
    isPastWeek: boolean;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    onAdd: () => void;
}

export default function Header({
    title = '📅 固定任务看板',
    isPastWeek,
    onPrevWeek,
    onNextWeek,
    onToday,
    onAdd,
}: HeaderProps): React.ReactElement {
    return (
        <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{title}</div>
            <div className="flex items-center gap-3 flex-wrap">
                {/*<Setting/>*/}
                {/*<div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>*/}
                <button
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                    onClick={onPrevWeek}
                >
                    上一周
                </button>
                <button
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                    onClick={onNextWeek}
                >
                    下一周
                </button>
                <button
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                    onClick={onToday}
                >
                    回到今天
                </button>
                <div className="h-6 w-px bg-gray-300 dark:border-gray-700 hidden sm:block"></div>
                <button
                    className={`px-4 py-1.5 rounded-md text-white text-sm font-medium transition-all ${isPastWeek ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'}`}
                    onClick={onAdd}
                    disabled={isPastWeek}
                >
                    + 新增
                </button>
            </div>
        </div>
    );
}