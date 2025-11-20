import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import ClockIcon from '@/src/components/Icons/ClockIcon';
import ArticleIcon from '@/src/components/Icons/ArticleIcon';
import FolderIcon from '@/src/components/Icons/FolderIcon';
import DataExport from '@/src/components/DataExport';
import Setting from '@/src/layout/components/Setting';

const Sidebar: React.FC = () => {
    const menuItems = [
        {icon: <ClockIcon className="w-4 h-4"/>, label: '制定任务', href: '/'},
        {icon: <ArticleIcon className="w-4 h-4"/>, label: '固定日程', href: '/schedule'},
        {icon: <FolderIcon className="w-4 h-4"/>, label: '灵活备选', href: '/planner'},
        {icon: '🏪', label: '任务市场', href: '/market'},
        {icon: '🤖', label: '智能应用', href: '/ai-tools'}
    ];

    const router = useRouter();
    const currentPath = router.pathname;
    const isActive = (href: string) => href === currentPath;

    return (
        <aside
            className={"fixed left-0 top-0 h-screen bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-[#1f2937] dark:via-[#1a1d29] dark:to-[#1f2937] border-r border-gray-200/80 dark:border-gray-700/50 shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 z-50 transition-all duration-300 hidden md:flex md:flex-col w-[80px]"}>
            {/* Logo */}
            <div
                className="px-4 py-6 border-b border-gray-200/70 dark:border-gray-700/50 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10">
                <Link href="/public" className="flex items-center gap-3 group">
                    <div
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                        <span className="text-xl">🦊</span>
                    </div>
                    <span
                        className={"font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300 w-0 opacity-0"}>AiTodo.Me</span>
                </Link>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-6 px-3 overflow-y-auto">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        title={item.label}
                        className={`group relative flex flex-col items-center gap-2 px-3 py-4 mb-2 rounded-xl transition-all duration-300 ${
                            isActive(item.href)
                                ? 'bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent text-gray-900 dark:text-white font-semibold shadow-md dark:shadow-blue-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-b hover:from-gray-100 hover:to-transparent dark:hover:from-gray-800/50 dark:hover:to-transparent'
                        }`}
                    >
                        {/* 图标背景 */}
                        <div
                            className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 flex-shrink-0 ${
                                isActive(item.href)
                                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-purple-600/20'
                            }`}>
                            <span className={`transition-transform duration-300 ${
                                isActive(item.href) ? 'scale-100' : 'group-hover:scale-110'
                            }`}>
                                {typeof item.icon === 'string' ? item.icon : item.icon}
                            </span>
                        </div>

                        {/* 标签文字（收缩样式下显示为小号居中） */}
                        <div className={`text-xs text-center ${
                            isActive(item.href)
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}>{item.label}</div>
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div
                className={"mt-auto px-3 py-4 border-t border-gray-200/70 dark:border-gray-700/50 flex flex-col items-center gap-2"}
            >
                <DataExport iconOnly/>
                <Setting iconOnly/>
            </div>
        </aside>
    );
};

export default Sidebar;
