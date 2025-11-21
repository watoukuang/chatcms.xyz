import React, {useEffect} from 'react';

type Accent = 'blue' | 'red' | 'orange' | 'green' | 'purple';

interface DialogProps {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  maxWidth?: number; // px
  accent?: Accent;
}

const accentMap: Record<Accent, string> = {
  blue: 'from-lime-500/20 to-lime-600/10',
  red: 'from-red-500/20 to-red-600/10',
  orange: 'from-orange-500/20 to-orange-600/10',
  green: 'from-green-500/20 to-green-600/10',
  purple: 'from-purple-500/20 to-purple-600/10',
};

export default function Dialog({
  open,
  title,
  description,
  icon,
  onClose,
  onOk,
  okText = '确定',
  cancelText = '取消',
  children,
  maxWidth = 560,
  accent = 'blue',
}: DialogProps): React.ReactElement | null {
  if (!open) return null;

  // ESC 关闭
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const accentGradient = accentMap[accent] || accentMap.blue;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* 背景遮罩：玻璃态 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4" onClick={onClose}>
        {/* 卡片容器 */}
        <div
          className="w-full max-w-[90vw]" style={{ maxWidth: `${maxWidth}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`rounded-2xl shadow-xl overflow-hidden border border-white/10 dark:border-white/10 bg-white dark:bg-gray-900`}
          >
            {/* 渐变顶部 */}
            <div className={`px-6 py-4 bg-gradient-to-r ${accentGradient} dark:from-white/5 dark:to-white/0`}
            >
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="h-9 w-9 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center text-xl">
                    {icon}
                  </div>
                )}
                {title !== undefined && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                )}
              </div>
              {description && (
                <p className="mt-2 text-sm text-gray-700/90 dark:text-gray-300">{description}</p>
              )}
            </div>

            {/* 内容 */}
            {children && (
              <div className="p-6 text-sm text-gray-700 dark:text-gray-200">
                {children}
              </div>
            )}

            {/* 按钮区 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
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
    </div>
  );
}