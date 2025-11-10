import React from 'react';
import {OrderDetail} from '@/src/shared/types/order';
import OrderTag from './order-tag';

interface OrderRowProps {
    orderDetail: OrderDetail;
}

export default function OrderRow({orderDetail}: OrderRowProps) {
    const getPlanText = (planType: string) => {
        switch (planType) {
            case 'monthly':
                return '月度会员';
            case 'yearly':
                return '年度会员';
            case 'lifetime':
                return '终身会员';
            default:
                return planType;
        }
    };

    return (
        <tr className="hover:bg-orange-50/60 dark:hover:bg-white/5 transition-colors">
            <td className="px-6 py-4">
                <div className="text-sm font-mono text-gray-900 dark:text-white break-all max-w-xs">
                    {orderDetail.id}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getPlanText(orderDetail.planType)}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {orderDetail.amount} USDT
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                    {orderDetail.network?.toUpperCase() || orderDetail.network?.toUpperCase() || 'N/A'}
                </div>
            </td>
            <td className="px-6 py-4">
                <OrderTag status={orderDetail.state || 'unknown'}/>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(orderDetail.created).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </td>
            <td className="px-6 py-4 text-sm">
                <button
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors">
                    查看详情
                </button>
            </td>
        </tr>
    );
}
