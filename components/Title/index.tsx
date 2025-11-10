import React from 'react';

interface HeaderProps {
    title?: string;
    description?: string;
}

const Title: React.FC<HeaderProps> = ({
                                          title = '文章中心',
                                          description = '探索区块链技术的深度文章，涵盖基础知识、共识机制、智能合约、DeFi 等热门话题',
                                      }) => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
};

export default Title;
