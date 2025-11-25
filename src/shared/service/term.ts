import request from '@/src/shared/utils/request';

export interface Term {
  id: number;
  term: string;
  definition: string;
  category: string;
  related_terms: string[];
  popularity: number;
  created: string;
  updated: string;
}

export interface PageTermParams {
  page?: number;
  size?: number;
  category?: string;
  search?: string;
}

export interface PageTermResponse {
  items: Term[];
  total: number;
  page: number;
  size: number;
}

export async function pageTermAPI(params: PageTermParams): Promise<PageTermResponse> {
  const { page = 1, size = 12, category, search } = params;
  
  // 构建查询参数
  const queryParams = new URLSearchParams();
  queryParams.append('page', Math.max(1, page).toString());
  queryParams.append('size', Math.min(Math.max(1, size), 50).toString());
  
  if (category && category.trim()) {
    queryParams.append('category', category.trim());
  }
  
  if (search && search.trim()) {
    queryParams.append('search', search.trim());
  }
  
  const resp = await request.get<PageTermResponse>(`/api/term/page?${queryParams.toString()}`);
  
  if (!resp.success) {
    throw new Error(resp.message || '获取术语列表失败');
  }
  
  if (!resp.data) {
    throw new Error('术语数据为空');
  }
  
  // 转换数据格式以匹配前端期望
  return {
    items: resp.data.items.map(item => ({
      ...item,
      relatedTerms: item.related_terms, // 兼容前端字段名
    })) as Term[],
    total: resp.data.total,
    page: resp.data.page,
    size: resp.data.size,
  };
}
