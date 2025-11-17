import React from 'react';
import Theme from "@/src/layout/components/Theme";

const Header: React.FC = () => {

    return (
        <header
            className={"fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-[#1f2937] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 transition-all duration-300 md:left-[80px]"}>
            {/* 左侧：关注我们 */}
            <div className="flex items-center gap-4">
                <div
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                    <span className="text-base">⭕</span>
                    <span className="hidden sm:inline">关注我们</span>
                </div>
            </div>

            {/* 右侧：导出、设置、主题切换 */}
            <div className="flex items-center gap-2">
                <Theme/>
            </div>
        </header>
    );
};

export default Header;
