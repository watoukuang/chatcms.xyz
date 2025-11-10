import React, {useEffect, useState} from 'react';
import {Article, pageArticleAPI} from '@/src/shared/api/article';
import Pagination from '@/src/views/order/components/pagination';
import Acard from '@/components/Articles/components/Acard';
import Skeleton from '@/components/Articles/components/Skeleton';
import Empty from '@/components/Articles/components/Empty';

// 模拟分类数据
const categories = [
    {id: 'tech', name: '技术'},
    {id: 'tutorial', name: '教程'},
    {id: 'news', name: '资讯'},
];

export default function ArticleIndex() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(6);
    const [totalCount, setTotalCount] = useState(0);
    useEffect(() => {
        const loadArticles = async () => {
            const start = Date.now();
            setLoading(true);
            try {
                const {items, total} = await pageArticleAPI(currentPage, pageSize);
                setArticles(items);
                setTotalCount(total);
            } catch (error) {
                console.error('Failed to load articles:', error);
            } finally {
                const elapsed = Date.now() - start;
                const delay = Math.max(0, 300 - elapsed);
                setTimeout(() => {
                    setLoading(false);
                }, delay);
            }
        };
        void loadArticles();
    }, [currentPage, pageSize]);

    // 分页逻辑
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const categoryMap = categories.reduce<Record<string, string>>((acc, c) => {
        acc[c.id] = c.name;
        return acc;
    }, {});

    return (
        <>


            <div className="min-h-screen">
                <div className="py-4 sm:py-6 lg:py-12">
                    <div>
                        {loading ? (
                            // 加载状态
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                {[...Array(6)].map((_, i) => (<Skeleton key={i}/>))}
                            </div>
                        ) : (
                            <>
                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
                                    {articles.map((article) => (
                                        <Acard key={article.id} article={article} categoryMap={categoryMap}/>
                                    ))}
                                </div>

                                {/* 分页控件 */}
                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalCount={totalCount}
                                        onPageChange={handlePageChange}
                                    />
                                )}

                                {/* 无文章提示 */}
                                {!loading && articles.length === 0 && (
                                    <Empty/>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}