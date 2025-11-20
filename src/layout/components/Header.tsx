import React from 'react';
import Theme from "@/src/layout/components/Theme";
import AboutIcon from "@/src/components/Icons/AboutIcon";

const Header: React.FC = () => {

    return (
        <header
            className={"fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-[#0f1115] border-b border-gray-200 dark:border-gray-800 flex items-center justify-end px-4 sm:px-6 lg:px-8 z-40 transition-all duration-300 md:left-[80px]"}>
            <div className="flex items-center gap-4">
                <div
                    className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-gray-300 transition-colors cursor-pointer">
                    <AboutIcon/>
                    <span className="hidden sm:inline">关于我们</span>
                </div>
                <div className="flex items-center gap-2">
                    <Theme/>
                </div>
            </div>
        </header>
    );
};

export default Header;
