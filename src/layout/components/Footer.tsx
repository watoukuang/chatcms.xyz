import React from "react";
import {useRouter} from 'next/router';
import TelegramIcon from "@/src/components/Icons/TelegramIcon";
import TwitterIcon from "@/src/components/Icons/TwitterIcon";
import DiscordIcon from "@/src/components/Icons/DiscordIcon";
import Logo from "@/src/components/Logo";

export default function Footer(): React.ReactElement {
    const currentYear = new Date().getFullYear();
    const router = useRouter();
    const isHome = router.pathname === '/';

    const socialLinkClass =
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-400 transition-all duration-300 transform hover:scale-110 hover:border-lime-500 hover:text-lime-400 hover:bg-lime-500/10";

    return (
        <footer
            className={`${isHome ? 'mt-0 relative' : 'mt-8'} ml-0 transition-all duration-300 md:ml-[80px] border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1115]`}>
            <div className={`${isHome ? 'px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto py-8' : 'px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto py-6'}`}>
                <div
                    className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 text-center md:text-left w-full">
                    <div
                        className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-4 w-full md:w-auto">
                        <Logo className="mx-auto md:mx-0"/>
                        <p className="text-xs md:text-[13px] text-gray-600 dark:text-gray-400 mt-1 md:mt-0 text-center md:text-left">
                            © {currentYear} aitodo.me · AI TODO FOR ME
                        </p>
                    </div>

                    {/* 右侧邮箱 + 社交 */}
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                        <a
                            href="mailto:chatcms@gmail.com"
                            className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                        >
                            联系邮箱:aitodome@gmail.com
                        </a>
                        <div className="flex items-center gap-3 justify-center">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Discord"
                                className={`${socialLinkClass}`}
                            >
                                <DiscordIcon className="h-4 w-4"/>
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className={`${socialLinkClass}`}
                            >
                                <TwitterIcon className="h-4 w-4"/>
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                                className={`${socialLinkClass}`}
                            >
                                <TelegramIcon className="h-4 w-4"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
