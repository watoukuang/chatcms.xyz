export interface SEOConfig {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonical?: string;
}

// 全局默认 SEO 配置（DemoChain）
export const defaultSEO: SEOConfig = {
    title: 'AiTodo - 您的智能AI待办事项助手 | AI Todo for Me',
    description:
        'AiTodo是一款智能待办事项管理工具，通过AI技术为您自动解析、分类和规划任务。用自然语言添加待办，AI帮您智能设置时间、优先级，让任务管理变得简单高效。',
    keywords:
        'AI待办事项,智能任务管理,AI Todo,任务规划,时间管理,生产力工具,自然语言处理,智能助手,待办清单,AI任务分配',
    ogImage: '/og-image.jpg',
};

// 页面级 SEO 配置
export const pageSEO: Record<string, Partial<SEOConfig>> = {
    '/': {
        title: 'AiTodo - 您的智能AI待办事项助手 | AI Todo for Me',
        description:
            'AiTodo是一款智能待办事项管理工具，通过AI技术为您自动解析、分类和规划任务。用自然语言添加待办，AI帮您智能设置时间、优先级，让任务管理变得简单高效。',
        keywords:
            'AI待办事项,智能任务管理,AI Todo,任务规划,时间管理,生产力工具,自然语言处理,智能助手,待办清单,AI任务分配',
    },
};

// 获取页面 SEO 配置
export function getPageSEO(pathname: string): SEOConfig {
    const pageSEOConfig = pageSEO[pathname] || {};
    return {
        ...defaultSEO,
        ...pageSEOConfig,
        ogTitle: pageSEOConfig.ogTitle || pageSEOConfig.title || defaultSEO.title,
        ogDescription: pageSEOConfig.ogDescription || pageSEOConfig.description || defaultSEO.description,
        canonical: `https://aitodo.me${pathname}`,
    };
}
