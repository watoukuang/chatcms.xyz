import React from 'react';
import {Order} from '@/src/shared/types/order';

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface PaymentStepProps {
    order: Order;
    timeLeft: number;
    qrCode: string;
    copyToClipboard: (text: string) => void;
    handleGo: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({order, timeLeft, qrCode, copyToClipboard, handleGo}) => {
    return (
        <div className="space-y-4">
            <div
                className="bg-gray-50 dark:bg-white/[0.06] rounded-lg p-3 space-y-3 border border-gray-200 dark:border-white/10">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">支付金额:</span>
                    <span className="font-bold">{order.amount} USDT</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">网络:</span>
                    <span>{order.network}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">收款地址</label>
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center gap-2 flex-1 h-9 px-3 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.06] overflow-hidden">
                        <span
                            className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">{order.address}</span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(order.address)}
                        className="h-9 px-3 rounded-lg bg-gray-200 dark:bg-white/[0.08] text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-white/[0.12] transition-colors shrink-0 border border-transparent dark:border-white/10"
                        title="复制到剪贴板"
                    >
                        复制
                    </button>
                </div>
            </div>

            <div className="text-center">
                <div
                    className="inline-block p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04]">
                    <img src={qrCode} alt="PaymentModel QR Code" className="w-40 h-40"/>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">使用钱包扫描二维码支付</p>
            </div>

            <div
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ 支付注意事项</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• 请确保转账金额完全一致: {order.amount} USDT</li>
                    <li>• 请使用正确的网络进行转账</li>
                    <li>• 支付完成后点击"已支付，立即查看"按钮跳转到订单页面</li>
                    <li>• 在订单页面查看支付状态和确认结果</li>
                    <li>• 如有问题请联系客服</li>
                </ul>
            </div>

            <div className="mt-3 flex items-center justify-center">
                <button
                    onClick={handleGo}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                >
                    已支付，立即查看
                </button>
            </div>
        </div>
    );
}

export default PaymentStep;
