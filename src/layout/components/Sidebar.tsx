import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import ClockIcon from '@/src/components/Icons/ClockIcon';
import ArticleIcon from '@/src/components/Icons/ArticleIcon';
import FolderIcon from '@/src/components/Icons/FolderIcon';
import MarketIcon from '@/src/components/Icons/MarketIcon';
import RobotIcon from '@/src/components/Icons/RobotIcon';
import DataExport from '@/src/components/DataExport';
import Setting from '@/src/layout/components/Setting';
import Logo from "@/src/components/Logo";

const Sidebar: React.FC = () => {
    const menuItems = [
        {icon: <ClockIcon className="w-4 h-4"/>, label: '制定任务', href: '/'},
        {icon: <ArticleIcon className="w-4 h-4"/>, label: '固定日程', href: '/schedule'},
        {icon: <FolderIcon className="w-4 h-4"/>, label: '灵活备选', href: '/planner'},
        {icon: <MarketIcon className="w-4 h-4"/>, label: '任务市场', href: '/market'},
        {icon: <RobotIcon className="w-4 h-4"/>, label: '智能应用', href: '/robot'}
    ];

    const router = useRouter();
    const currentPath = router.pathname;
    const isActive = (href: string) => href === currentPath;

    return (
        <aside
            className={"fixed left-0 top-0 hidden md:flex md:flex-col w-[80px] h-screen bg-white dark:bg-[#0f1115] border-r border-gray-200/80 dark:border-gray-800/80 shadow-xl shadow-black/10 z-50 transition-all duration-300"}>
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
                                ? 'bg-gradient-to-b from-lime-500/10 via-lime-500/5 to-transparent text-gray-900 dark:text-white font-semibold shadow-md shadow-lime-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-b hover:from-gray-100 hover:to-transparent dark:hover:from-[#1a1d29] dark:hover:to-transparent'
                        }`}
                    >
                        {/* 图标背景 */}
                        <div
                            className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 flex-shrink-0 ${
                                isActive(item.href)
                                    ? 'bg-gradient-to-br from-lime-500 to-lime-600 text-[#0f1115] shadow-lg shadow-lime-500/30'
                                    : 'bg-gray-100 dark:bg-[#1f232a] group-hover:bg-gradient-to-br group-hover:from-lime-500/20 group-hover:to-lime-600/20'
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
                                ? 'font-semibold text-gray-900 dark:text-white'
                                : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}>{item.label}</div>
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div
                className={"mt-auto px-3 py-4 border-t border-lime-500/30 dark:border-lime-700/40 flex flex-col items-center gap-2"}
            >
                <DataExport iconOnly/>
                <Setting iconOnly/>
            </div>
        </aside>
    );
};

export default Sidebar;
