import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import {LayoutProps} from '../types';

export default function Layout({children}: LayoutProps): React.ReactElement {
    return (
        <div
            className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-[#0f1115] dark:via-[#111317] dark:to-[#0f1115]">
            <Header/>
            <main className="flex-1 py-4 sm:py-6 lg:py-8">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    {children}
                </div>
            </main>
            <Footer/>
        </div>
    );
}