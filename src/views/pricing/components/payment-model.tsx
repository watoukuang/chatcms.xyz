import React, {useState} from 'react';
import {Network, Order, OrderDTO} from '@/src/shared/types/order';
import {addOrderAPI} from '@/src/shared/api/order';
import {useToast} from '@/src/components/Toast';
import StepHeader from './step-header';
import SelectStep from './select-step';
import PaymentStep from './payment-step';
import {Plan, PlanType} from "@/src/shared/types/plan";

interface PaymentProps {
    isOpen: boolean;
    onClose: () => void;
    planType: PlanType;
}

const PLAN_META: Record<Exclude<PlanType, 'free'>, Plan> = {
    monthly: {name: '月度会员', price: 3, period: '每月'},
    yearly: {name: '年度会员', price: 10, period: '每年'},
    lifetime: {name: '终身会员', price: 15, period: '一次性'},
};

export default function PaymentModel({isOpen, onClose, planType}: PaymentProps) {
    const {success, error} = useToast();
    const [step, setStep] = useState<'select' | 'payment'>('select');
    const [selectedNetwork, setSelectedNetwork] = useState<Network>('usdt_trc20');
    const [order, setOrder] = useState<Order | null>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [deepLink, setDeepLink] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const handleClose = () => {
        setStep('select');
        setOrder(null);
        setQrCode('');
        setTimeLeft(0);
        onClose();
    };

    const plan = planType !== 'free' ? PLAN_META[planType] : null;

    const makeTempOrder = (pt: Exclude<PlanType, 'free'>, address: string, network: Network): Order => ({
        amount: PLAN_META[pt].price,
        network,
        qrCode: '',
        address: address,
    });

    const handleAdd = async () => {
        if (!planType || planType === 'free') {
            error('免费计划无需支付');
            return;
        }
        setLoading(true);
        try {
            const payload: OrderDTO = {plan_type: planType, network: selectedNetwork};
            const {code, data, message} = await addOrderAPI(payload);
            if (code !== 200 || !data) throw new Error(message || '创建订单失败');
            const pt = planType as Exclude<PlanType, 'free'>;
            setOrder(makeTempOrder(pt, data as unknown as string, selectedNetwork));
            setQrCode('');
            setStep('payment');
            success('订单创建成功，请完成支付');
        } catch (err: any) {
            error(err.message || '创建订单失败');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        success('已复制到剪贴板');
    };

    const handleGo = async () => {
        if (!order) return;
        onClose();
        success('正在跳转到订单页面，请查看支付状态...');

        // 延迟 1.5 秒再跳转
        setTimeout(() => {
            window.location.href = '/order';
        }, 1500);
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3">
            <div
                className={
                    `bg-white dark:bg-[#0b0f17] rounded-xl border border-gray-200 dark:border-white/12 shadow-xl w-full max-w-sm md:max-w-md max-h-[85vh] overflow-y-auto text-gray-900 dark:text-gray-100 ` +
                    `transform transition-all duration-200 ease-out opacity-100 scale-100 translate-y-0`
                }
            >
                {/* 头部 */}
                <StepHeader step={step} onClose={handleClose}/>

                {/* 内容 */}
                <div className="p-4">
                    {step === 'select' && (
                        <SelectStep plan={plan} selectedNetwork={selectedNetwork}
                                    setSelectedNetwork={setSelectedNetwork} onCreate={handleAdd} loading={loading}/>
                    )}

                    {step === 'payment' && order && (
                        <PaymentStep order={order} timeLeft={timeLeft} qrCode={qrCode}
                                     copyToClipboard={copyToClipboard} handleGo={handleGo}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
