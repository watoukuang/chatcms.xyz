import React from 'react';

interface OrderStatusBadgeProps {
    status: string;
}

export default function OrderTag({status}: OrderStatusBadgeProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'confirmed':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'paid':
                return 'bg-lime-100 text-lime-800 dark:bg-lime-900/20 dark:text-lime-400';
            case 'pending_payment':
            case 'created':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'cancelled':
            case 'expired':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStateText = (status: string) => {
        switch (status) {
            case 'created':
                return '已创建';
            case 'pending_payment':
                return '待支付';
            case 'paid':
                return '已支付';
            case 'confirmed':
                return '已确认';
            case 'completed':
                return '已完成';
            case 'cancelled':
                return '已取消';
            case 'expired':
                return '已过期';
            default:
                return status;
        }
    };

    return (
        <span
            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
            {getStateText(status)}
        </span>
    );
}
