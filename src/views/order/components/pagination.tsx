import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({currentPage, totalPages, totalCount, onPageChange}: PaginationProps) {
    const goToPrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const goToNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div
            className="bg-white/60 dark:bg-transparent backdrop-blur px-4 py-2 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    显示第 {currentPage} 页，共 {totalPages} 页 ({totalCount} 条记录)
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPrevious}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500"
                    >
                        上一页
                    </button>

                    <div className="flex items-center space-x-1">
                        {/* 分页数字按钮 */}
                        {(() => {
                            const pages = [];
                            const maxVisible = 5;
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                            if (endPage - startPage + 1 < maxVisible) {
                                startPage = Math.max(1, endPage - maxVisible + 1);
                            }

                            // 第一页
                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => onPageChange(1)}
                                        className="px-2 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500"
                                    >
                                        1
                                    </button>
                                );
                                if (startPage > 2) {
                                    pages.push(
                                        <span key="start-ellipsis" className="px-1 text-gray-500">...</span>
                                    );
                                }
                            }

                            // 中间页码
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => onPageChange(i)}
                                        className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                                            currentPage === i
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500'
                                        }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            // 最后一页
                            if (endPage < totalPages) {
                                if (endPage < totalPages - 1) {
                                    pages.push(
                                        <span key="end-ellipsis" className="px-1 text-gray-500">...</span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => onPageChange(totalPages)}
                                        className="px-2 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500"
                                    >
                                        {totalPages}
                                    </button>
                                );
                            }

                            return pages;
                        })()}
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500"
                    >
                        下一页
                    </button>
                </div>
            </div>
        </div>
    );
}
