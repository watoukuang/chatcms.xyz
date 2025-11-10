import React from 'react';

const Skeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm animate-pulse border border-gray-100 dark:border-gray-700">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 mb-4"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export default Skeleton;
