import React from 'react';
import {Network} from '@/src/shared/types/order';

interface SelectStepProps {
    plan: { name: string; price: number; period: string } | null;
    selectedNetwork: Network;
    setSelectedNetwork: (n: Network) => void;
    onCreate: () => void;
    loading: boolean;
}

const NETWORK_OPTIONS: Array<{ id: Network; name: string; network: string; confirmations: number }> = [
    { id: 'usdt_trc20', name: 'USDT · TRC20', network: 'TRON', confirmations: 1 },
    { id: 'usdt_erc20', name: 'USDT · ERC20', network: 'Ethereum', confirmations: 12 },
    { id: 'usdt_bep20', name: 'USDT · BEP20', network: 'BSC', confirmations: 12 },
];

export default function SelectStep({
                                       plan,
                                       selectedNetwork,
                                       setSelectedNetwork,
                                       onCreate,
                                       loading
                                   }: SelectStepProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-lg p-4 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{plan?.name}</h3>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${plan?.price} USDT</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{plan?.period}</span>
                </div>
            </div>

            <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">选择 USDT 网络</h4>
                <div className="space-y-2">
                    {NETWORK_OPTIONS.map((network) => (
                        <label
                            key={network.id}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedNetwork === network.id
                                    ? 'border-orange-500 ring-1 ring-orange-500/20 bg-white dark:bg-white/[0.04]'
                                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={network.id}
                                checked={selectedNetwork === network.id}
                                onChange={(e) => setSelectedNetwork(e.target.value as Network)}
                                className="sr-only"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">{network.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {network.network} • 确认数: {network.confirmations}
                                </div>
                            </div>
                            {selectedNetwork === network.id && (
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center bg-orange-500 text-white">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </div>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={onCreate}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow"
            >
                {loading ? '创建订单中...' : '确认支付'}
            </button>
        </div>
    );
}
