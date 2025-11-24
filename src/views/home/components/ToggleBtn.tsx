"use client";

import React from "react";

type ToggleBtnProps = {
    side: "left" | "right";
    collapsed: boolean;
    onToggle: () => void;
    labelCollapsed: string;
    labelExpanded: string;
};

const ToggleBtn: React.FC<ToggleBtnProps> = ({
    side,
    collapsed,
    onToggle,
    labelCollapsed,
    labelExpanded,
}) => {
    const title = collapsed ? labelCollapsed : labelExpanded;
    const ariaLabel = title;

    const icon = (() => {
        if (side === "left") {
            return collapsed ? "⟩" : "⟨";
        }
        return collapsed ? "⟨" : "⟩";
    })();

    return (
        <button
            type="button"
            title={title}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-lime-200/70 dark:border-lime-500/40 bg-white/90 dark:bg-gray-900/80 text-gray-700 dark:text-gray-100 shadow-sm hover:shadow-md hover:border-lime-400/80 dark:hover:border-lime-300/70 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label={ariaLabel}
        >
            <span className="text-base leading-none select-none">
                {icon}
            </span>
        </button>
    );
};

export default ToggleBtn;
