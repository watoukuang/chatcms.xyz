import React from 'react';
import Sidebar from '@/src/layout/components/Sidebar';
import Header from '@/src/layout/components/Header';
import Footer from '@/src/layout/components/Footer';
import {LayoutProps} from '../../types';
import {useRouter} from 'next/router';
import {SidebarProvider} from '@/src/contexts/SidebarContext';

function LayoutContent({children}: LayoutProps): React.ReactElement {
    const router = useRouter();
    const isHome = router.pathname === '/';

    return (
        <div className="min-h-screen bg-white dark:bg-[#1a1d29]">
            {/* 左侧边栏 */}
            <Sidebar/>
            {/* 顶部导航 */}
            <Header/>
            {/* 主内容区 */}
            <main
                className={`ml-0 transition-all duration-300 md:ml-[80px] ${isHome ? 'pt-0' : 'pt-[60px]'} ${isHome ? '' : 'min-h-[calc(100vh-60px)] flex flex-col'}`}>
                <div
                    className={`w-full ${isHome ? 'mx-0 px-0 py-0' : 'flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
                    {children}
                </div>
            </main>
            {!isHome && <Footer/>}
        </div>
    );
}

export default function Layout({children}: LayoutProps): React.ReactElement {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
}