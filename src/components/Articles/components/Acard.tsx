import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import ClockIcon from '@/src/components/Icons/ClockIcon';
import EyeIcon from '@/src/components/Icons/EyeIcon';
import {Article} from '@/src/shared/api/article';

interface ArticleCardProps {
    article: Article;
    categoryMap?: Record<string, string>;
}

const Acard: React.FC<ArticleCardProps> = ({article, categoryMap = {}}) => {
    const router = useRouter();
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('zh-CN');
    const displayTags = (article.tags || []).slice(0, 3).map((id) => categoryMap[id] ?? id);

    return (
        <Link href={`/blogs/${article.id}`} className="block">
            <article
                onClick={(e) => {
                    // 作为兜底，确保点击整个卡片可导航
                    e.preventDefault();
                    router.push(`/article/${article.id}`);
                }}
                className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 dark:border-[#2a2c31] p-5 hover:shadow-lg dark:hover:shadow-2xl hover:border-orange-300 dark:hover:border-orange-400 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
            >
                {/* 标题 */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {article.title}
                </h2>

                {/* 摘要 */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">{article.excerpt}</p>

                {/* 标签 */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {displayTags.map((tag, idx) => (
                            <span
                                key={`${tag}-${idx}`}
                                className="inline-block px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded dark:bg-orange-500/20 dark:text-orange-300"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 底部信息 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4"/>
                        <span>{formatDate(article.created)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <EyeIcon className="w-4 h-4"/>
                        <span>{article.views}浏览</span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default Acard;
