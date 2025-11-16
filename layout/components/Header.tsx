import React from 'react';
import Theme from "@/layout/components/Theme";
import {useSidebar} from '@/src/contexts/SidebarContext';

const Header: React.FC = () => {
    const { isCollapsed, toggleSidebar } = useSidebar();
    
    return (
        <header
            className={`fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-[#1f2937] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 transition-all duration-300 ${
                isCollapsed ? 'md:left-[80px]' : 'md:left-[200px]'
            }`}>
            {/* 左侧：折叠按钮 + 关注我们 */}
            <div className="flex items-center gap-4">
                {/* 折叠按钮 */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
                    aria-label="切换侧边栏"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isCollapsed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        )}
                    </svg>
                </button>
                
                <div
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                    <span className="text-base">⭕</span>
                    <span className="hidden sm:inline">关注我们</span>
                </div>
            </div>

            {/* 右侧：搜索框 + 按钮 */}
            <div className="flex items-center gap-4">
                {/* 搜索框 */}
                {/*<div className="relative">*/}
                {/*    <input*/}
                {/*        type="text"*/}
                {/*        placeholder="搜索内容"*/}
                {/*        className="w-[280px] h-[36px] bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-4 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"*/}
                {/*    />*/}
                {/*    <button*/}
                {/*        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">*/}
                {/*        🔍*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/* 创建按钮 */}
                {/*<button*/}
                {/*    className="h-[36px] px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">*/}
                {/*    创建*/}
                {/*</button>*/}

                <Theme/>
            </div>
        </header>
    );
};

export default Header;
