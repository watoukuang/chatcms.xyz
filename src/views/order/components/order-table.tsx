import React from 'react';
import {OrderDetail} from '@/src/shared/types/order';
import OrderRow from './order-row';
import Pagination from './pagination';

interface OrderTableProps {
    orderDetails: OrderDetail[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (page: number) => void;
}

export default function OrderTable({orderDetails, currentPage, totalPages, totalCount, onPageChange}: OrderTableProps) {
    return (
        <div
            className="bg-white dark:bg-gray-900/40 rounded shadow-xl overflow-hidden border border-gray-100/60 dark:border-white/10">
            {/* 表格 */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/60">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            订单号
                        </th>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            订阅计划
                        </th>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            金额
                        </th>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            支付方式
                        </th>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            状态
                        </th>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            创建时间
                        </th>
                        <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            操作
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orderDetails.map((orderDetail) => (
                        <OrderRow key={orderDetail.id} orderDetail={orderDetail}/>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 分页控件 */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={onPageChange}
            />
        </div>
    );
}
