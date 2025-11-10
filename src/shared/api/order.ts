import {OrderDTO, OrderVO} from '../types/order';
import request from '../utils/request';
import {R} from "@/src/shared/types/response";

export async function addOrderAPI(payload: OrderDTO): Promise<R<String>> {
    const response = await request.post<any>('/api/order/add', payload);
    if (!response.success) {
        throw new Error(response.message || '注册失败');
    }
    return response;
}


export async function pageOrderAPI(page: number = 1, size: number = 10): Promise<{
    items: OrderVO[];
    total: number;
    page: number;
    size: number
}> {
    const resp = await request.get<any>(`/api/order/page?page=${page}&size=${size}`);
    if (!resp.success) throw new Error(resp.message || '获取订单失败');
    const data = resp.data || {};
    return {
        items: Array.isArray(data.items) ? data.items : [],
        total: typeof data.total === 'number' ? data.total : 0,
        page: typeof data.page === 'number' ? data.page : page,
        size: typeof data.size === 'number' ? data.size : size,
    };
}
