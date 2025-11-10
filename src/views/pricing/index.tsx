import React, {useState} from 'react';
import Link from 'next/link';
import PaymentModel from './components/payment-model';
import {useToast} from 'components/Toast';
import {PlanType} from "@/src/shared/types/plan";

const combos = [
    {
        name: '免费版',
        price: '0',
        period: '永久',
        badge: '',
        features: [
            {label: 'POW 共识演示', value: '✓'},
            {label: '哈希算法演示', value: '✓'},
            {label: '区块结构展示', value: '✓'},
            {label: '分布式挖矿', value: '✓'},
            {label: '代币转账演示', value: '✓'},
            {label: '币基奖励机制', value: '✓'},
            {label: '其他共识机制', value: '✗'},
        ],
        cta: '立即使用',
    },
    {
        name: '月度会员',
        price: '3',
        period: '每月',
        badge: '',
        features: [
            {label: '所有共识机制演示', value: '✓'},
            {label: 'POW 工作量证明', value: '✓'},
            {label: 'POS 权益证明', value: '✓'},
            {label: 'DPoS 委托权益证明', value: '✓'},
            {label: 'BFT 拜占庭容错', value: '✓'},
            {label: 'POH 历史证明', value: '✓'},
            {label: '无限制访问', value: '✓'},
        ],
        cta: '开始订阅',
    },
    {
        name: '年度会员',
        price: '10',
        period: '每年',
        badge: '推荐',
        features: [
            {label: '所有共识机制演示', value: '✓'},
            {label: 'POW 工作量证明', value: '✓'},
            {label: 'POS 权益证明', value: '✓'},
            {label: 'DPoS 委托权益证明', value: '✓'},
            {label: 'BFT 拜占庭容错', value: '✓'},
            {label: 'POH 历史证明', value: '✓'},
            {label: '无限制访问', value: '✓'},
        ],
        cta: '年度订阅',
    },
    {
        name: '终身会员',
        price: '15',
        period: '一次性',
        badge: '最划算',
        features: [
            {label: '所有共识机制演示', value: '✓'},
            {label: 'POW 工作量证明', value: '✓'},
            {label: 'POS 权益证明', value: '✓'},
            {label: 'DPoS 委托权益证明', value: '✓'},
            {label: 'BFT 拜占庭容错', value: '✓'},
            {label: 'POH 历史证明', value: '✓'},
            {label: '永久无限制访问', value: '✓'},
        ],
        cta: '终身购买',
    },
];

const faqs = [
    {
        q: '免费版有什么限制？',
        a: '免费版只能访问 POW 相关的所有演示功能，包括哈希、区块、区块链、分布式挖矿、代币转账和币基奖励。无法访问 POS、DPoS、BFT、POH 等其他共识机制。'
    },
    {
        q: '会员版本有什么区别吗？',
        a: '所有付费会员（月度、年度、终身）享受完全相同的功能，可以访问所有共识机制演示，没有任何功能上的区别对待。'
    },
    {
        q: '为什么终身会员这么便宜？',
        a: '我们希望让更多人能够长期学习区块链技术。终身会员 $15 的价格让您永久享受所有功能，包括未来可能新增的共识机制和功能。'
    },
    {q: '支持哪些付款方式？', a: '支持 PayPal、信用卡、借记卡等国际主流支付方式。'},
    {q: '可以申请退款吗？', a: '所有付费计划支持 7 天无理由退款。如有任何问题，请通过邮件联系我们。'},
    {q: '提供技术支持吗？', a: '我们不提供技术支持服务。平台设计简单易用，如遇到使用问题，建议查看演示说明或重新尝试操作。'},
    {q: '会有新功能更新吗？', a: '是的，我们会持续更新和改进平台功能。所有付费会员都能免费享受功能更新，无需额外付费。'},
];

export default function Pricing(): React.ReactElement {
    const {success} = useToast();
    const [payment, setPayment] = useState<{ isOpen: boolean; planType: PlanType | null; }>({
        isOpen: false,
        planType: null
    });


    const handleSubscribe = (comboType: string) => {
        if (comboType === '免费版') {
            success('您已在使用免费版！');
            return;
        }
        const planMapping: Record<string, PlanType> = {
            '月度会员': 'monthly',
            '年度会员': 'yearly',
            '终身会员': 'lifetime'
        };
        const planType = planMapping[comboType];
        if (!planType) return;
        setPayment({isOpen: true, planType});
    };

    return (
        <div className="px-4 lg:px-12 max-w-screen-2xl mx-auto py-10 md:py-14">
            {/* 标题 */}
            <header className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">选择适合您的区块链学习方案</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">从免费体验到专业定制，满足不同学习需求</p>
            </header>

            {/* 价格卡片 */}
            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-12">
                {combos.map((p, i) => (
                    <div key={i}
                         className={`rounded-2xl border bg白/80 backdrop-blur p-5 dark:bg-[#15161a]/80 dark:border-[#2a2c31] ${i === 2 ? 'ring-2 ring-orange-500 dark:ring-orange-400' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">{p.name}</h3>
                            {p.badge && <span
                                className={`text-xs px-2 py-0.5 rounded text-white ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-orange-500' : 'bg-purple-500'}`}>{p.badge}</span>}
                        </div>
                        <div className="mb-4">
                            <span className="text-3xl font-extrabold">${p.price}</span>
                            <span className="ml-2 text-sm text-gray-500">{p.period}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-5">
                            {p.features.map((f, idx) => (
                                <li key={idx} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={f.value === '✓' ? 'text-emerald-500' : f.value === '✗' ? 'text-red-500' : 'text-emerald-500'}>
                                            {f.value === '✓' ? '✓' : f.value === '✗' ? '✗' : '✓'}
                                        </span>
                                        {f.label}
                                    </span>
                                    {f.value !== '✓' && f.value !== '✗' &&
                                        <span className="opacity-80">{f.value}</span>}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSubscribe(p.name)}
                            className={`w-full rounded-xl py-2.5 hover:opacity-90 transition-all duration-300 ${
                                i === 0
                                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    : 'bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            }`}>
                            {i === 0 ? p.cta : `${p.cta} - ${p.price} USDT`}
                        </button>
                    </div>
                ))}
            </section>

            {/* FAQ */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-center">常见问题解答</h2>
                <div className="space-y-3">
                    {faqs.map((f, i) => (
                        <details key={i}
                                 className="rounded-2xl border p-4 bg-white/70 dark:bg-[#15161a]/70 dark:border-[#2a2c31]">
                            <summary className="cursor-pointer list-none font-medium flex items-center justify-between">
                                <span>{f.q}</span>
                                <span className="opacity-60">+</span>
                            </summary>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{f.a}</div>
                        </details>
                    ))}
                </div>
            </section>

            {/* 功能对比表 */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">功能对比</h2>
                <div className="overflow-x-auto">
                    <table
                        className="w-full rounded-2xl border bg-white/80 backdrop-blur dark:bg-[#15161a]/80 dark:border-[#2a2c31]">
                        <thead>
                        <tr className="border-b dark:border-[#2a2c31]">
                            <th className="text-left p-4 font-semibold">功能特性</th>
                            <th className="text-center p-4 font-semibold">免费版</th>
                            <th className="text-center p-4 font-semibold">月度会员</th>
                            <th className="text-center p-4 font-semibold">年度会员</th>
                            <th className="text-center p-4 font-semibold">终身会员</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm">
                        <tr className="border-b dark:border-[#2a2c31]/50">
                            <td className="p-4">POW 工作量证明</td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                        </tr>
                        <tr className="border-b dark:border-[#2a2c31]/50">
                            <td className="p-4">POS 权益证明</td>
                            <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                        </tr>
                        <tr className="border-b dark:border-[#2a2c31]/50">
                            <td className="p-4">DPoS 委托权益证明</td>
                            <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                        </tr>
                        <tr className="border-b dark:border-[#2a2c31]/50">
                            <td className="p-4">BFT 拜占庭容错</td>
                            <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text中心 p-4"><span className="text-emerald-500">✓</span></td>
                        </tr>
                        <tr className="border-b dark:border-[#2a2c31]/50">
                            <td className="p-4">POH 历史证明</td>
                            <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                            <td className="text-center p-4"><span className="text-emerald-500">✓</span></td>
                        </tr>
                        <tr>
                            <td className="p-4">功能访问权限</td>
                            <td className="text-center p-4">POW 仅</td>
                            <td className="text-center p-4">全部</td>
                            <td className="text-center p-4">全部</td>
                            <td className="text-center p-4">全部</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mb-12">
                <div
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center border border-blue-200 dark:border-blue-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💰 支付方式</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">我们支持 USDT
                        加密货币支付，安全便捷，全球通用</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-green-500 text-2xl mb-2">🔗</div>
                            <h3 className="font-semibold text-gray-900 dark:text白 mb-1">USDT (TRC-20)</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">TRON 网络，低手续费</p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-blue-500 text-2xl mb-2">⚡</div>
                            <h3 className="font-semibold text-gray-900 dark:text白 mb-1">USDT (ERC-20)</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">以太坊网络，安全可靠</p>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-yellow-500 text-2xl mb-2">🚀</div>
                            <h3 className="font-semibold text-gray-900 dark:text白 mb-1">USDT (BEP-20)</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">BSC 网络，快速确认</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">有疑问或建议？</p>
                <Link href="mailto:hello@demochain.com"
                      className="inline-flex items-center rounded-xl border px-4 py-2 hover:bg-gray-50 dark:border-[#2a2c31] dark:hover:bg-[#1a1d24]">联系我们</Link>
            </section>

            {payment.planType && (
                <PaymentModel isOpen={payment.isOpen} planType={payment.planType as PlanType}
                              onClose={() => setPayment({isOpen: false, planType: null})}/>
            )}
        </div>
    );
}
