import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {Article, getArticleByIdAPI} from '@/src/shared/service/article';
import Container from '@/src/views/slug/components/Container';
import Header from '@/src/views/slug/components/Header';
import Content from '@/src/views/slug/components/Content';

export default function ArticleDetailPage() {
    const router = useRouter();
    const {slug} = router.query;
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug || typeof slug !== 'string') return;

        const loadArticle = async () => {
            try {
                setLoading(true);
                setError(null);

                const articleData = await getArticleByIdAPI(slug);
                setArticle(articleData);

            } catch (err) {
                console.error('Failed to load blogs:', err);
                setError(err instanceof Error ? err.message : '加载文章失败');
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [slug]);

    // 加载中状态
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                        <div className="space-y-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {error || '文章不存在'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        抱歉，您访问的文章可能已被删除或不存在
                    </p>
                    <Link
                        href="/Users/xukui/demo-workspace/demochain/demochain-ui/pages/blogs"
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        返回文章列表
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{article.title} - DemoChain</title>
                <meta name="description" content={article.excerpt}/>
                <meta name="keywords" content={article.tags.join(', ')}/>
            </Head>

            <Container>
                <article
                    className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 dark:border-[#2a2c31] overflow-hidden dark:hover:shadow-2xl">
                    <Header title={article.title} created={article.created} views={article.views} tags={article.tags}/>
                    <Content content={article.content}/>
                    <footer className="px-8 pb-8 bg-transparent">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="flex items-center justify-center">
                                <Link href="/Users/xukui/demo-workspace/demochain/demochain-ui/pages/blogs"
                                      className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:underline">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                                    </svg>
                                    返回文章列表
                                </Link>
                            </div>
                        </div>
                    </footer>
                </article>
            </Container>
        </>
    );
}
