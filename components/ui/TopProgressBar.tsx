import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

// 轻量级顶部进度条：无依赖、页面切换更顺滑
export default function TopProgressBar(): React.ReactElement | null {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const start = () => {
    setVisible(true);
    setWidth(0);
    // 模拟进度推进（前期快速，后期渐慢）
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    intervalRef.current = window.setInterval(() => {
      setWidth((w) => {
        const next = w + (w < 60 ? 8 : w < 85 ? 4 : 2);
        return next >= 95 ? 95 : next;
      });
    }, 120);
  };

  const done = () => {
    // 到达 100%，并稍作延迟再隐藏，避免突兀
    setWidth(100);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, 200);
  };

  useEffect(() => {
    const handleStart = () => start();
    const handleComplete = () => done();
    const handleError = () => done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [router.events]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 top-0 z-[1000] w-full h-0.5">
      <div
        className="h-full transition-[width] duration-150 ease-out bg-gradient-to-r from-emerald-500 via-lime-500 to-sky-500 dark:from-emerald-400 dark:via-lime-400 dark:to-sky-400"
        style={{ width: `${width}%` }}
      />
      {/* 细微阴影，让进度条看起来更自然 */}
      <div className="pointer-events-none h-[1px] w-full bg-black/5 dark:bg-white/10" />
    </div>
  );
}