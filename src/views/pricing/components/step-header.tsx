import React from 'react';

export default function StepHeader({ step, onClose }: { step: 'select' | 'payment' | 'confirm'; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-white/10">
      <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">
        {step === 'select' && '选择支付方式'}
        {step === 'payment' && '完成支付'}
        {step === 'confirm' && '支付成功'}
      </h2>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}
