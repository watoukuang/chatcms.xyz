import React, {useState, useEffect} from 'react';
import Head from 'next/head';
import {pageOrderAPI} from '@/src/shared/service/order';
import OrderTable from './components/order-table';
import Empty from './components/empty';
import Loading from './components/loading'

export default function OrdersPage() {
    const [orderDetails, setOrderDetails] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const MIN_LOADING_MS = 300; // 最少loading时长，避免闪烁

    const isInitial = orderDetails === null;

    useEffect(() => {
        const loadOrders = async () => {
            const start = Date.now();
            try {
                const {items, total, page, size} = await pageOrderAPI(currentPage, pageSize);
                // 将后端项映射为表格需要的最小字段，兼容旧结构
                const mapped = (items || []).map((o: any) => ({
                    id: o.id,
                    planType: o.plan_type,
                    amount: o.amount,
                    network: o.network,
                    state: o.state,
                    created: o.created,
                }));
                setOrderDetails(mapped);
                setTotalCount(typeof total === 'number' ? total : 0);
            } catch (error) {
                console.error('Failed to load orders:', error);
            } finally {
                const elapsed = Date.now() - start;
                const delay = Math.max(0, MIN_LOADING_MS - elapsed);
                setTimeout(() => {
                    setLoading(false);
                }, delay);
            }
        };

        loadOrders();
    }, [currentPage, pageSize]);

    // 分页逻辑 - 使用后端分页
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            <Head>
                <title>订单管理 - DemoChain</title>
                <meta name="description" content="查看您的订阅订单历史和支付记录"/>
            </Head>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">订单管理</h1>
                        <p className="text-gray-600 dark:text-gray-400">查看您的订阅订单历史和支付记录</p>
                    </div>

                    {isInitial || loading ? (
                        <Loading/>
                    ) : (orderDetails && orderDetails.length > 0) ? (
                        <OrderTable orderDetails={orderDetails} currentPage={currentPage} totalPages={totalPages}
                                    totalCount={totalCount} onPageChange={handlePageChange}
                        />
                    ) : (
                        <Empty/>
                    )}
                </div>
            </div>
        </>
    );
}
