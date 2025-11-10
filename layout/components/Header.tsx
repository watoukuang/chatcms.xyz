import React, {useState} from 'react';
import Logo from '@/components/Logo';
import Theme from '@/layout/components/Theme';
import LoginModal from '@/components/Login';

export default function Header(): React.ReactElement | null {
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <header
            className="sticky top-0 z-40 relative py-4 border-b border-gray-100 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-gray-800 dark:bg-[#121212]/85">
            <div className="px-6 lg:px-12 max-w-screen-2xl mx-auto w-full relative flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Logo/>
                </div>
                <div className="flex items-center gap-3">
                    <Theme/>        
                </div>
            </div>
        </header>
    );
}