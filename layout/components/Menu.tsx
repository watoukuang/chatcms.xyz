import React, {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import NameIcon from '@/components/Icons/NameIcon';
import ArticleIcon from '@/components/Icons/ArticleIcon';

export type MenuItem = { name: string; href: string; icon: React.ReactNode };

interface MenuProps {
    currentPathname: string;
    menuItems: MenuItem[];
}


export default function Menu(props: MenuProps): React.ReactElement {
    const allItems: MenuItem[] = React.useMemo(() => {
        const extra: MenuItem[] = [
            {name: 'AI创作', href: '/create', icon: (<NameIcon/>)},
            {name: '模板库', href: '/templates', icon: (<ArticleIcon/>)},
        ];
        return [...props.menuItems, ...extra];
    }, [props.menuItems]);

    const {currentPathname} = props;

    const LinkItem = ({item}: { item: MenuItem }) => {
        const isActive = currentPathname === item.href || (item.href === '/article' && currentPathname.startsWith('/blogs/'));
        return (
            <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center space-x-2 transition-all duration-200 ${
                    isActive
                        ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#1a1d24]'
                }`}
            >
                {item.icon}
                <span>{item.name}</span>
            </Link>
        );
    };

    const OverflowMenu = ({items}: { items: MenuItem[] }) => {
        const [open, setOpen] = useState(false);
        const ref = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            const handler = (e: MouseEvent) => {
                if (!ref.current) return;
                if (!ref.current.contains(e.target as Node)) setOpen(false);
            };
            if (open) document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
        }, [open]);

        if (items.length === 0) return null;
        return (
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setOpen(v => !v)}
                    className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center space-x-2 transition-colors bg-white/98 text-gray-700 hover:bg-gray-100 dark:bg-[#1a1d24] dark:text-gray-200 dark:hover:bg-[#2a2c31]"
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    <span>更多</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                {open && (
                    <div role="menu"
                         className="absolute right-0 mt-2 w-48 rounded-2xl border bg-white backdrop-blur-sm shadow-lg ring-1 ring-black/5 p-2 border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2d2d30] dark:ring-white/5 z-50">
                        {items.map((item) => {
                            const isActive = currentPathname === item.href || (item.href === '/article' && currentPathname.startsWith('/blogs/'));
                            return (
                                <Link
                                    key={`more-${item.name}`}
                                    href={item.href}
                                    className={`flex items-center font-medium gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'}`}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const MAX_INLINE_MD = 2;
    const MAX_INLINE_LG = 3;
    const inlineMd = allItems.slice(0, MAX_INLINE_MD);
    const overflowMd = allItems.slice(MAX_INLINE_MD);
    const inlineLg = allItems.slice(0, MAX_INLINE_LG);
    const overflowLg = allItems.slice(MAX_INLINE_LG);

    return (
        <div className="flex items-center">
            {/* < md: only show Articles */}
            <div className="flex md:hidden items-center space-x-1">
                {(() => {
                    const article = allItems.find(i => i.href === '/article');
                    return article ? <LinkItem key={`sm-article`} item={article}/> : null;
                })()}
            </div>

            {/* md only */}
            <div className="hidden md:flex lg:hidden xl:hidden items-center space-x-1">
                {inlineMd.map((item) => (
                    <LinkItem key={`md-${item.name}`} item={item}/>
                ))}
                <OverflowMenu items={overflowMd}/>
            </div>

            <div className="md:hidden lg:flex xl:hidden items-center space-x-1">
                {inlineLg.map((item) => (
                    <LinkItem key={`lg-inline-${item.name}`} item={item}/>
                ))}
                <OverflowMenu items={overflowLg}/>
            </div>

            <div className="hidden xl:flex items-center space-x-1">
                {allItems.map((item) => (
                    <LinkItem key={`xl-${item.name}`} item={item}/>
                ))}
            </div>
        </div>
    );
}

