import React from 'react';
import {AppProps} from 'next/app';
import {useRouter} from 'next/router';
import Head from 'next/head';
import {getPageSEO} from '@/src/shared/utils/seo';
import '../styles/globals.css';
import '../styles/animations.css';
import 'reactflow/dist/style.css';
import {ToastProvider} from '@/src/components/Toast';
import TopProgressBar from '@/src/components/ui/TopProgressBar';
import Layout from 'src/layout';
import { AppProviders } from '@/src/providers/AppProviders';

function Application({Component, pageProps}: AppProps): React.ReactElement {
    const router = useRouter();
    const seo = getPageSEO(router.pathname);
    const AppLayout = Layout;

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
                <meta property="og:site_name" content="AiTodo"/>
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
                            name: 'AITODO',
                            url: 'https://aitodo.me',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: 'https://aitodo.me/?q={search_term_string}',
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
            </Head>

            <ToastProvider>
                <AppProviders>
                    <AppLayout>
                        <Component {...pageProps} />
                    </AppLayout>
                </AppProviders>
            </ToastProvider>
        </>
    );
}

export default Application;
