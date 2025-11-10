import request from '../utils/request';

export interface Article {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    views: number;
    created: string;
}

export interface PageResult<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
}

export async function pageArticleAPI(page: number = 1, size: number = 10): Promise<PageResult<Article>> {
    const p = Math.max(1, Math.floor(page || 1));
    const s = Math.max(1, Math.floor(size || 10));
    const url = `/api/article/page?page=${p}&size=${s}`;

    const resp = await request.get<PageResult<Article>>(url);
    if (!resp.success) throw new Error(resp.message || '获取文章失败');

    const data = (resp.data ?? {}) as Partial<PageResult<Article>>;
    const itemsRaw = Array.isArray(data.items) ? data.items : [];
    const items: Article[] = itemsRaw.map((it: any) => ({
        id: String(it?.id ?? ''),
        title: String(it?.title ?? ''),
        excerpt: String(it?.excerpt ?? ''),
        content: String(it?.content ?? ''),
        tags: Array.isArray(it?.tags) ? it.tags as string[] : [],
        views: Number.isFinite(it?.views) ? Number(it.views) : 0,
        created: String(it?.created ?? ''),
    }));

    return {
        items,
        total: Number.isFinite(data.total) ? Number(data.total) : 0,
        page: Number.isFinite(data.page) ? Number(data.page) : p,
        size: Number.isFinite(data.size) ? Number(data.size) : s,
    };
}

export async function getArticleByIdAPI(id: string): Promise<Article> {
    const url = `/api/article/${encodeURIComponent(id)}`;
    const resp = await request.get<Article>(url);
    
    if (!resp.success) throw new Error(resp.message || '获取文章失败');
    if (!resp.data) throw new Error('文章不存在');

    const it = resp.data;
    return {
        id: String(it?.id ?? ''),
        title: String(it?.title ?? ''),
        excerpt: String(it?.excerpt ?? ''),
        content: String(it?.content ?? ''),
        tags: Array.isArray(it?.tags) ? it.tags as string[] : [],
        views: Number.isFinite(it?.views) ? Number(it.views) : 0,
        created: String(it?.created ?? ''),
    };
}
