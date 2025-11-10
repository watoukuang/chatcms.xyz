import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

class MyDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html lang="zh-CN">
        <Head>
          <meta charSet="utf-8"/>
          
          {/* 默认 SEO - 可被页面级覆盖 */}
          <meta name="description" content="DemoChain - 区块链在线演示与学习平台，提供哈希、区块、区块链、POW/POS/DPoS/BFT/POH 等交互式演示"/>
          <meta name="keywords" content="区块链,哈希,SHA-256,工作量证明,POW,POS,DPoS,BFT,POH,挖矿,代币,教学,演示"/>
          <meta name="author" content="DemoChain"/>
          
          {/* Open Graph 默认值 */}
          <meta property="og:site_name" content="DemoChain"/>
          <meta property="og:type" content="website"/>
          <meta property="og:locale" content="zh_CN"/>
          
          {/* 图标和资源 */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
          <link rel="alternate icon" href="/favicon.ico"/>
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
          
          {/* 预加载主题脚本 - 避免闪烁 */}
          <script src="/js/theme-script.js" />
        </Head>
        <body>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
