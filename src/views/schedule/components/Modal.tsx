import React, {useEffect} from 'react';

interface ModalProps {
    open: boolean;
    title?: React.ReactNode;
    onClose: () => void;
    onOk?: () => void;
    okText?: string;
    cancelText?: string;
    children: React.ReactNode;
    maxWidth?: number; // px
}

export default function Modal({
                                  open,
                                  title,
                                  onClose,
                                  onOk,
                                  okText = '✓ 提交',
                                  cancelText = '取消',
                                  children,
                                  maxWidth = 800,
                              }: ModalProps): React.ReactElement | null {
    if (!open) return null;

    // 支持 ESC 键关闭
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 animate-fadeIn" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
            {/* 点击内容外区域关闭 */}
            <div className="absolute inset-0 flex items-center justify-center p-4" onClick={onClose}>
                <div
                    className="bg-white rounded-lg shadow-2xl transform transition-all w-full"
                    style={{maxWidth: `${maxWidth}px`}}
                    onClick={(e) => e.stopPropagation()}
                >
                    {title !== undefined && (
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        </div>
                    )}
                    <div className="p-6">{children}</div>
                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-white transition-colors text-sm font-medium text-gray-700"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        {onOk && (
                            <button
                                className="px-4 py-2 rounded-md bg-lime-600 hover:bg-lime-700 text-[#0f1115] transition-all shadow-sm hover:shadow text-sm font-medium"
                                onClick={onOk}
                            >
                                {okText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}