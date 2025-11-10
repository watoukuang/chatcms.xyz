import React from 'react';

type Props = {
  content: string;
};

const Content: React.FC<Props> = ({ content }) => {
  // 极简 Markdown 渲染（标题与段落）
  const renderMarkdown = (md: string) =>
    md.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4 mt-8">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-3 mt-6">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-2 mt-4">{line.slice(4)}</h3>;
      if (!line.trim()) return <br key={i} />;
      return <p key={i} className="mb-4 leading-relaxed">{line}</p>;
    });

  return (
    <div className="px-8 py-8">
      <div className="prose prose-xl max-w-none dark:prose-invert text-gray-900 dark:text-gray-100">
        {renderMarkdown(content)}
      </div>
    </div>
  );
};

export default Content;
