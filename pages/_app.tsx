import React from 'react';
import {AppProps} from 'next/app';
import {useRouter} from 'next/router';
import Head from 'next/head';
import {getPageSEO} from '@/src/shared/utils/seo';
import '../styles/globals.css';
import {ToastProvider} from 'components/Toast';
import TopProgressBar from '@/components/ui/TopProgressBar';
import Layout from '@/layout';

function Application({Component, pageProps}: AppProps): React.ReactElement {
    const router = useRouter();
    const seo = getPageSEO(router.pathname);
    const AppLayout = Layout;

    // 取消登录路由拦截与重定向，允许直接访问所有页面

    return (
        <>
            <TopProgressBar/>
            <Head>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description}/>
                {seo.keywords && <meta name="keywords" content={seo.keywords}/>}
                <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)"/>
                <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"/>
                <meta property="og:type" content="website"/>
                <meta property="og:site_name" content="DemoChain"/>
                <meta property="og:title" content={seo.ogTitle || seo.title}/>
                <meta property="og:description" content={seo.ogDescription || seo.description}/>
                <meta property="og:url" content={seo.canonical}/>
                {seo.ogImage && <meta property="og:image" content={seo.ogImage}/>}
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={seo.ogTitle || seo.title}/>
                <meta name="twitter:description" content={seo.ogDescription || seo.description}/>
                {seo.ogImage && <meta name="twitter:image" content={seo.ogImage}/>}
                <link rel="icon" href="/favicon.ico"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                {seo.canonical && <link rel="canonical" href={seo.canonical}/>}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'ChatCMS',
                            url: 'https://chatcms.xyz',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: 'https://chatcms.xyz/?q={search_term_string}',
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
            </Head>

            <ToastProvider>
                <AppLayout>
                    <Component {...pageProps} />
                </AppLayout>
            </ToastProvider>
        </>
    );
}

export default Application;
