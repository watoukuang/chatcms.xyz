import React from "react";
import Link from "next/link";
import LogoIcon from "@/src/components/Icons/LogoIcon";

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({className}) => {
    return (
        <Link
            href="/public"
            className={`group flex items-center min-w-0 overflow-hidden ${className || ""}`}
            onClick={() => {
                if (typeof window !== "undefined") {
                    localStorage.setItem("consensus", "POW");
                    window.dispatchEvent(new Event("consensusChanged"));
                }
            }}
        >
            <span
                className="shrink-0 inline-flex group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-shadow)]"
                style={{color: 'var(--accent-color)'}}
            >
                {/*<LogoIcon className="w-10 h-10 transition duration-200"/>*/}
            </span>
            <span
                className="truncate max-w-[40vw] sm:max-w-[50vw] md:max-w-none text-lg md:text-xl font-bold tracking-wide leading-none select-none drop-shadow-sm transition duration-200 filter group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_var(--accent-shadow)]"
                style={{color: 'var(--accent-color)'}}
            >
                AiTodo.Me
            </span>
        </Link>
    );
};

export default Logo;
