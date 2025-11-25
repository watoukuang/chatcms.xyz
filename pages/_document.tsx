import Document, {Html, Head, Main, NextScript} from 'next/document';
import React from 'react';

class _Document extends Document {
    render(): React.ReactElement {
        return (
            <Html lang="zh-CN">
                <Head>
                    <meta charSet="utf-8"/>

                    {/* 默认 SEO - 修正为 AITODO */}
                    <meta name="description"
                          content="AITODO - 您的智能AI待办事项助手。通过自然语言理解技术，让您用对话的方式管理任务，真正实现 AI Todo for Me 的智能体验。"/>
                    <meta name="keywords"
                          content="AI待办事项,智能任务管理,AI任务助手,自然语言任务,时间管理工具,个人生产力,智能日程规划,AI Todo"/>
                    <meta name="author" content="AITODO"/>

                    {/* Open Graph 默认值 */}
                    <meta property="og:site_name" content="AITODO"/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:locale" content="zh_CN"/>
                    <meta property="og:title" content="AITODO - 智能AI待办事项助手 | AI Todo for Me"/>
                    <meta property="og:description"
                          content="AITODO：用AI重新定义任务管理。通过自然语言理解技术，让您用最自然的方式管理待办事项。说出您的任务，AI自动处理剩下的一切。"/>

                    {/* Twitter Card */}
                    <meta name="twitter:card" content="summary_large_image"/>
                    <meta name="twitter:title" content="AITODO - 智能AI待办事项助手"/>
                    <meta name="twitter:description" content="用AI重新定义任务管理。说出您的任务，AI自动处理剩下的一切。"/>

                    {/* 图标和资源 */}
                    <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
                    <link rel="alternate icon" href="/favicon.ico"/>

                    {/* 网站验证（可选 - 如果您使用搜索引擎站长工具） */}
                    {/* <meta name="google-site-verification" content="your-verification-code" /> */}

                    {/* 结构化数据（可选 - 增强搜索结果显示） */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebApplication",
                                "name": "AITODO",
                                "description": "智能AI待办事项管理工具，通过自然语言理解技术帮助用户管理任务",
                                "url": "https://aitodo.me",
                                "applicationCategory": "ProductivityApplication",
                                "operatingSystem": "Web Browser",
                                "permissions": "browser",
                                "offers": {
                                    "@type": "Offer",
                                    "price": "0",
                                    "priceCurrency": "USD"
                                }
                            })
                        }}
                    />

                    {/* 字体预加载 */}
                    <link rel="preconnect" href="https://fonts.googleapis.com"/>
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                          rel="stylesheet"/>

                    {/* 预加载主题脚本 - 避免闪烁 */}
                    <script src="/js/theme-script.js"/>
                </Head>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        );
    }
}

export default _Document;