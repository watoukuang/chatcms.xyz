import React from 'react';

export default function Empty() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="text-orange-400 dark:text-orange-500 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                暂无订单记录
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                您还没有任何订阅订单，立即选择适合您的订阅计划
            </p>
            <a
                href="/pricing"
                className="inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                查看订阅计划
            </a>
        </div>
    );
}
