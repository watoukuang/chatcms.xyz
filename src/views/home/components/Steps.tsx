import React from "react";

export default function Steps(): React.ReactElement {
  return (
    <section className="bg-white dark:bg-[#0f1115]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 border-t border-emerald-100 dark:border-[#1f232b]">
        <h2 className="text-center text-3xl font-extrabold text-emerald-600 md:text-4xl dark:text-emerald-300">AI创作流程</h2>
        <p className="mt-3 text-center text-gray-500 dark:text-gray-400">简单四步，轻松实现AI智能内容创作与分发</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StepItem index={1} title="输入主题" desc="输入您想要创作的内容主题或关键词" icon={<InputIcon className="h-8 w-8" />} />
          <StepItem index={2} title="AI智能生成" desc="AI自动生成文章内容和视频素材" icon={<AIIcon className="h-8 w-8" />} />
          <StepItem index={3} title="编辑优化" desc="根据需要对生成的内容进行编辑和优化" icon={<EditIcon className="h-8 w-8" />} />
          <StepItem index={4} title="一键分发" desc="选择目标平台，一键分发到多个社交媒体" icon={<SendIcon className="h-8 w-8" />} />
        </div>
      </div>
    </section>
  );
}

function StepItem({ index, title, desc, icon }: { index: number; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start transition hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-500">{index}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-emerald-500 dark:bg-[#1a1d24] dark:text-emerald-300">{icon}</div>
      </div>
      <h4 className="mt-4 text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}

function InputIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15l4-4 4 4" />
      <path d="M7 9h10" />
    </svg>
  );
}

function AIIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" />
      <path d="M12 1v6M12 17v6M23 12h-6M7 12H1" />
    </svg>
  );
}

function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 21l3.75-.75L21 6a2.121 2.121 0 00-3-3L3.75 17.25z" />
      <path d="M14 7l3 3" />
    </svg>
  );
}

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
