import React from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// 简单的 Markdown 渲染器（不依赖外部库）
export default function MdRender({content, className = ''}: MarkdownRendererProps) {
    const renderMarkdown = (text: string): string => {
        let html = text;

        // 标题
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6 text-gray-900 dark:text-gray-100">$1</h1>');

        // 粗体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');

        // 斜体
        html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // 行内代码
        html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-sm font-mono rounded text-gray-800 dark:text-gray-200">$1</code>');

        // 代码块
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="my-4">
        <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code class="text-sm font-mono">${code.trim()}</code>
        </pre>
      </div>`;
        });

        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

        // 无序列表
        html = html.replace(/^\- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>');
        html = html.replace(/(<li class="ml-4 mb-1">• .+<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>');

        // 有序列表
        html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
        html = html.replace(/(<li class="ml-4 mb-1">.+<\/li>\n?)+/g, '<ol class="my-4 space-y-1 list-decimal list-inside">$&</ol>');

        // 表格
        html = html.replace(/\|(.+)\|/g, (match, content) => {
            const cells = content.split('|').map((cell: string) => cell.trim());
            return '<tr>' + cells.map((cell: string) => `<td class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">${cell}</td>`).join('') + '</tr>';
        });
        html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table class="my-4 w-full border-collapse">$&</table>');

        // 段落
        html = html.replace(/^(?!<[h1-6]|<ul|<ol|<table|<div|<pre)(.+)$/gm, '<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">$1</p>');

        // 换行
        html = html.replace(/\n/g, '<br>');

        return html;
    };

    return (
        <div
            className={`prose prose-gray dark:prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{__html: renderMarkdown(content)}}
        />
    );
}
